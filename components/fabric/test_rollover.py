from __future__ import annotations

import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

FABRIC = Path(__file__).resolve().parent
if str(FABRIC) not in sys.path:
    sys.path.insert(0, str(FABRIC))

import bridge  # noqa: E402
import checkpoint  # noqa: E402
import rollover  # noqa: E402
import worker_adapter  # noqa: E402


class RolloverTests(unittest.TestCase):
    MANDATE = "a" * 64
    BASE = "b" * 64
    LAST_RESULT = "c" * 64

    def executable(self, name: str) -> str:
        value = shutil.which(name)
        self.assertIsNotNone(value, "fixture executable %s is required" % name)
        return str(Path(value).resolve())

    def worker_spec(self, cwd: str) -> dict:
        exe = self.executable("printf")
        return {
            "worker_id": "fixture-posix",
            "eligible_workers": ["fixture-posix"],
            "data_class": "INTERNAL",
            "max_cost_usd": 0,
            "network": "NONE",
            "external_effects": False,
            "command": [exe, "rollover-ok"],
            "allowed_executables": [exe],
            "allowed_paths": [cwd],
            "cwd": cwd,
            "timeout_seconds": 2,
            "env": {},
        }

    def ready_checkpoint(self, continuation_ref: str | None = "codex-thread:old") -> dict:
        cp = checkpoint.new_checkpoint("rollover-task", self.MANDATE, self.BASE)
        if continuation_ref is None:
            return cp
        return checkpoint.advance(
            cp,
            state="READY",
            continuation_ref=continuation_ref,
            last_result_sha256=self.LAST_RESULT,
        )

    def test_below_threshold_continues_without_generation_change(self) -> None:
        cp = self.ready_checkpoint()
        result = rollover.watch(
            cp,
            {"context_used_units": 79, "context_limit_units": 100},
            threshold_percent=80,
        )
        self.assertEqual(result["action"], "CONTINUE")
        self.assertFalse(result["planned_now"])
        self.assertEqual(result["checkpoint"], cp)
        self.assertEqual(result["founder_prompt_shuttling"], 0)
        self.assertRegex(result["telemetry_sha256"], r"^[0-9a-f]{64}$")

    def test_threshold_plans_rollover_once_and_preserves_evidence(self) -> None:
        cp = self.ready_checkpoint()
        result = rollover.watch(
            cp,
            {"context_used_units": 80, "context_limit_units": 100},
            threshold_percent=80,
        )
        planned = result["checkpoint"]
        self.assertEqual(result["action"], "ROLLOVER")
        self.assertTrue(result["planned_now"])
        self.assertEqual(planned["state"], "ROLLOVER_REQUIRED")
        self.assertEqual(planned["generation"], cp["generation"] + 1)
        self.assertEqual(planned["continuation_ref"], cp["continuation_ref"])
        self.assertEqual(planned["last_result_sha256"], cp["last_result_sha256"])

        replay = rollover.watch(
            planned,
            {"context_used_units": 95, "context_limit_units": 100},
            threshold_percent=80,
        )
        self.assertEqual(replay["action"], "ROLLOVER")
        self.assertFalse(replay["planned_now"])
        self.assertEqual(replay["checkpoint"], planned)

    def test_threshold_without_continuation_fails_closed(self) -> None:
        cp = self.ready_checkpoint(continuation_ref=None)
        with self.assertRaisesRegex(rollover.RolloverError, "continuation_ref"):
            rollover.watch(
                cp,
                {"context_used_units": 90, "context_limit_units": 100},
            )

    def test_worker_failed_state_must_be_resolved_before_rollover(self) -> None:
        cp = self.ready_checkpoint()
        cp = checkpoint.advance(
            cp,
            state="WORKER_FAILED",
            continuation_ref=cp["continuation_ref"],
            last_result_sha256=cp["last_result_sha256"],
        )
        with self.assertRaisesRegex(rollover.RolloverError, "failed worker"):
            rollover.watch(
                cp,
                {"context_used_units": 90, "context_limit_units": 100},
            )

    def test_complete_rollover_is_monotonic_and_idempotent(self) -> None:
        cp = self.ready_checkpoint()
        planned = rollover.watch(
            cp,
            {"context_used_units": 90, "context_limit_units": 100},
        )["checkpoint"]
        completed = rollover.complete_rollover(
            planned,
            expected_old_continuation_ref="codex-thread:old",
            new_continuation_ref="codex-thread:new",
        )
        ready = completed["checkpoint"]
        self.assertTrue(completed["completed_now"])
        self.assertEqual(ready["state"], "READY")
        self.assertEqual(ready["generation"], planned["generation"] + 1)
        self.assertEqual(ready["continuation_ref"], "codex-thread:new")
        self.assertEqual(ready["last_result_sha256"], self.LAST_RESULT)
        self.assertEqual(completed["founder_prompt_shuttling"], 0)

        replay = rollover.complete_rollover(
            ready,
            expected_old_continuation_ref="codex-thread:old",
            new_continuation_ref="codex-thread:new",
        )
        self.assertFalse(replay["completed_now"])
        self.assertEqual(replay["checkpoint"], ready)

    def test_stale_or_same_ref_completion_fails_closed(self) -> None:
        cp = self.ready_checkpoint()
        planned = rollover.watch(
            cp,
            {"context_used_units": 90, "context_limit_units": 100},
        )["checkpoint"]
        with self.assertRaisesRegex(rollover.RolloverError, "stale rollover"):
            rollover.complete_rollover(
                planned,
                expected_old_continuation_ref="codex-thread:stale",
                new_continuation_ref="codex-thread:new",
            )
        with self.assertRaisesRegex(rollover.RolloverError, "must differ"):
            rollover.complete_rollover(
                planned,
                expected_old_continuation_ref="codex-thread:old",
                new_continuation_ref="codex-thread:old",
            )

    def test_invalid_telemetry_fails_closed(self) -> None:
        cp = self.ready_checkpoint()
        bad_values = [
            {"context_used_units": -1, "context_limit_units": 100},
            {"context_used_units": 1, "context_limit_units": 0},
            {"context_used_units": 101, "context_limit_units": 100},
            {"context_used_units": 50, "context_limit_units": 100, "extra": 1},
        ]
        for telemetry in bad_values:
            with self.subTest(telemetry=telemetry):
                with self.assertRaises(rollover.RolloverError):
                    rollover.watch(cp, telemetry)

    def test_two_worker_turns_cross_rollover_with_zero_founder_shuttle(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            cp0 = checkpoint.new_checkpoint("e2e-rollover", self.MANDATE, self.BASE)

            first = bridge.prepare_dispatch(
                cp0,
                self.worker_spec(td),
                vos_authorization_ref="vos://fixture/authorized/e2e-1",
                continuation_ref="codex-thread:old",
            )
            first_result = worker_adapter.run_request(first["worker_request"])
            first_consumed = bridge.consume_result(first["checkpoint"], first_result)
            cp2 = first_consumed["checkpoint"]
            self.assertEqual(cp2["state"], "WORKER_DONE")
            self.assertEqual(cp2["generation"], 2)

            planned = rollover.watch(
                cp2,
                {"context_used_units": 85, "context_limit_units": 100},
                threshold_percent=80,
            )
            cp3 = planned["checkpoint"]
            self.assertEqual(cp3["state"], "ROLLOVER_REQUIRED")
            self.assertEqual(cp3["generation"], 3)

            completed = rollover.complete_rollover(
                cp3,
                expected_old_continuation_ref="codex-thread:old",
                new_continuation_ref="codex-thread:new",
            )
            cp4 = completed["checkpoint"]
            self.assertEqual(cp4["state"], "READY")
            self.assertEqual(cp4["generation"], 4)
            self.assertEqual(cp4["continuation_ref"], "codex-thread:new")
            self.assertEqual(cp4["last_result_sha256"], cp2["last_result_sha256"])

            second = bridge.prepare_dispatch(
                cp4,
                self.worker_spec(td),
                vos_authorization_ref="vos://fixture/authorized/e2e-2",
                continuation_ref=cp4["continuation_ref"],
            )
            second_result = worker_adapter.run_request(second["worker_request"])
            second_consumed = bridge.consume_result(second["checkpoint"], second_result)
            cp6 = second_consumed["checkpoint"]
            self.assertEqual(cp6["state"], "WORKER_DONE")
            self.assertEqual(cp6["generation"], 6)
            self.assertEqual(cp6["continuation_ref"], "codex-thread:new")

            all_evidence = [first, first_consumed, planned, completed, second, second_consumed]
            for item in all_evidence:
                self.assertEqual(item["founder_prompt_shuttling"], 0)
                encoded = json.dumps(item, sort_keys=True).lower()
                self.assertNotIn('"prompt":', encoded)
                self.assertNotIn('"founder_prompt":', encoded)


if __name__ == "__main__":
    unittest.main()
