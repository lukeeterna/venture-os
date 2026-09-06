from __future__ import annotations

import copy
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
import worker_adapter  # noqa: E402


class BridgeTests(unittest.TestCase):
    MANDATE = "a" * 64
    BASE = "b" * 64

    def executable(self, name: str) -> str:
        value = shutil.which(name)
        self.assertIsNotNone(value, "fixture executable %s is required" % name)
        return str(Path(value).resolve())

    def worker_spec(self, cwd: str, *, executable: str | None = None) -> dict:
        exe = executable or self.executable("printf")
        argv = [exe, "bridge-ok"] if Path(exe).name != "false" else [exe]
        return {
            "worker_id": "fixture-posix",
            "eligible_workers": ["fixture-posix"],
            "data_class": "INTERNAL",
            "max_cost_usd": 0,
            "network": "NONE",
            "external_effects": False,
            "command": argv,
            "allowed_executables": [exe],
            "allowed_paths": [cwd],
            "cwd": cwd,
            "timeout_seconds": 2,
            "env": {},
        }

    def new_checkpoint(self) -> dict:
        return checkpoint.new_checkpoint("fixture-task", self.MANDATE, self.BASE)

    def test_zero_prompt_shuttling_end_to_end_fixture(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            prepared = bridge.prepare_dispatch(
                self.new_checkpoint(),
                self.worker_spec(td),
                vos_authorization_ref="vos://fixture/authorized/1",
                continuation_ref="codex-thread:fixture-1",
            )
            self.assertEqual(prepared["founder_prompt_shuttling"], 0)
            self.assertEqual(prepared["checkpoint"]["state"], "DISPATCH_READY")
            self.assertEqual(prepared["checkpoint"]["generation"], 1)
            self.assertRegex(prepared["dispatch_sha256"], r"^[0-9a-f]{64}$")
            evidence_json = json.dumps(prepared["evidence"], sort_keys=True).lower()
            self.assertNotIn('"prompt":', evidence_json)
            self.assertNotIn('"founder_prompt":', evidence_json)

            result = worker_adapter.run_request(prepared["worker_request"])
            self.assertEqual(result["status"], "DONE")
            consumed = bridge.consume_result(prepared["checkpoint"], result)
            self.assertTrue(consumed["consumed_now"])
            self.assertEqual(consumed["founder_prompt_shuttling"], 0)
            self.assertEqual(consumed["checkpoint"]["state"], "WORKER_DONE")
            self.assertEqual(consumed["checkpoint"]["generation"], 2)
            self.assertEqual(
                consumed["checkpoint"]["continuation_ref"],
                "codex-thread:fixture-1",
            )
            self.assertEqual(
                consumed["checkpoint"]["last_result_sha256"],
                consumed["result_sha256"],
            )

    def test_same_result_replay_is_idempotent_changed_replay_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            prepared = bridge.prepare_dispatch(
                self.new_checkpoint(),
                self.worker_spec(td),
                vos_authorization_ref="vos://fixture/authorized/2",
            )
            result = worker_adapter.run_request(prepared["worker_request"])
            consumed = bridge.consume_result(prepared["checkpoint"], result)
            replay = bridge.consume_result(consumed["checkpoint"], result)
            self.assertFalse(replay["consumed_now"])
            self.assertEqual(replay["checkpoint"], consumed["checkpoint"])

            changed = copy.deepcopy(result)
            changed["stdout_bytes"] += 1
            with self.assertRaisesRegex(bridge.BridgeError, "different result"):
                bridge.consume_result(consumed["checkpoint"], changed)

    def test_worker_failure_becomes_terminal_failed_checkpoint(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            prepared = bridge.prepare_dispatch(
                self.new_checkpoint(),
                self.worker_spec(td, executable=self.executable("false")),
                vos_authorization_ref="vos://fixture/authorized/3",
            )
            result = worker_adapter.run_request(prepared["worker_request"])
            self.assertEqual(result["status"], "FAILED")
            consumed = bridge.consume_result(prepared["checkpoint"], result)
            self.assertEqual(consumed["checkpoint"]["state"], "WORKER_FAILED")

    def test_missing_authorization_ref_is_blocked(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            with self.assertRaisesRegex(bridge.BridgeError, "vos_authorization_ref"):
                bridge.prepare_dispatch(
                    self.new_checkpoint(),
                    self.worker_spec(td),
                    vos_authorization_ref="",
                )

    def test_worker_cannot_override_bridge_owned_identity(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            spec = self.worker_spec(td)
            spec["mandate_sha256"] = "c" * 64
            with self.assertRaisesRegex(bridge.BridgeError, "bridge-owned"):
                bridge.prepare_dispatch(
                    self.new_checkpoint(),
                    spec,
                    vos_authorization_ref="vos://fixture/authorized/4",
                )

    def test_paid_or_effectful_worker_spec_is_blocked(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            paid = self.worker_spec(td)
            paid["max_cost_usd"] = 0.01
            with self.assertRaisesRegex(bridge.BridgeError, "max_cost_usd"):
                bridge.prepare_dispatch(
                    self.new_checkpoint(),
                    paid,
                    vos_authorization_ref="vos://fixture/authorized/5",
                )

            effectful = self.worker_spec(td)
            effectful["external_effects"] = True
            with self.assertRaisesRegex(bridge.BridgeError, "external_effects"):
                bridge.prepare_dispatch(
                    self.new_checkpoint(),
                    effectful,
                    vos_authorization_ref="vos://fixture/authorized/6",
                )

    def test_result_identity_mismatch_is_blocked(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            prepared = bridge.prepare_dispatch(
                self.new_checkpoint(),
                self.worker_spec(td),
                vos_authorization_ref="vos://fixture/authorized/7",
            )
            result = worker_adapter.run_request(prepared["worker_request"])
            result["request_id"] = "wrong-request"
            with self.assertRaisesRegex(bridge.BridgeError, "request_id"):
                bridge.consume_result(prepared["checkpoint"], result)


if __name__ == "__main__":
    unittest.main()
