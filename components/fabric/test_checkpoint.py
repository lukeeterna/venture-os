#!/usr/bin/env python3
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).with_name("checkpoint.py")
spec = importlib.util.spec_from_file_location("checkpoint_under_test", str(MODULE_PATH))
module = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(module)


class CheckpointTests(unittest.TestCase):
    def base(self):
        return module.new_checkpoint(
            "task-1",
            "a" * 64,
            "b" * 64,
        )

    def test_new_checkpoint_is_valid_generation_zero(self):
        cp = self.base()
        self.assertEqual(cp["generation"], 0)
        self.assertEqual(cp["state"], "READY")
        self.assertEqual(cp["effects"], {})
        self.assertEqual(len(module.checkpoint_digest(cp)), 64)

    def test_advance_is_monotonic_and_preserves_identity(self):
        cp = self.base()
        nxt = module.advance(
            cp,
            state="WORKER_DONE",
            continuation_ref="codex-thread://abc",
            last_result_sha256="c" * 64,
        )
        self.assertEqual(nxt["generation"], 1)
        self.assertEqual(nxt["task_id"], cp["task_id"])
        self.assertEqual(nxt["mandate_sha256"], cp["mandate_sha256"])
        self.assertEqual(nxt["base_sha"], cp["base_sha"])
        self.assertEqual(nxt["continuation_ref"], "codex-thread://abc")

    def test_claim_effect_is_exactly_once_for_same_bytes(self):
        cp = self.base()
        cp2, claimed = module.claim_effect(cp, "publish:artifact-1", "d" * 64)
        self.assertTrue(claimed)
        self.assertEqual(cp2["generation"], 1)
        cp3, claimed_again = module.claim_effect(cp2, "publish:artifact-1", "d" * 64)
        self.assertFalse(claimed_again)
        self.assertEqual(cp3, cp2)

    def test_claim_effect_rejects_same_id_different_bytes(self):
        cp, _ = module.claim_effect(self.base(), "send:lead-1", "d" * 64)
        with self.assertRaisesRegex(module.CheckpointError, "different hash"):
            module.claim_effect(cp, "send:lead-1", "e" * 64)

    def test_invalid_mandate_hash_fails_closed(self):
        cp = self.base()
        cp["mandate_sha256"] = "bad"
        with self.assertRaisesRegex(module.CheckpointError, "mandate_sha256"):
            module.validate_checkpoint(cp)

    def test_unknown_field_fails_closed(self):
        cp = self.base()
        cp["surprise"] = True
        with self.assertRaisesRegex(module.CheckpointError, "unknown checkpoint fields"):
            module.validate_checkpoint(cp)

    def test_effect_hash_must_be_sha256(self):
        with self.assertRaisesRegex(module.CheckpointError, "effect_sha256"):
            module.claim_effect(self.base(), "x", "bad")

    def test_atomic_roundtrip(self):
        cp, _ = module.claim_effect(self.base(), "publish:x", "f" * 64)
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "nested" / "checkpoint.json"
            digest = module.write_atomic(path, cp)
            self.assertEqual(len(digest), 64)
            restored = module.read_checkpoint(path)
            self.assertEqual(restored, cp)
            json.loads(path.read_text(encoding="utf-8"))

    def test_checkpoint_digest_is_stable_across_key_order(self):
        cp = self.base()
        reversed_cp = dict(reversed(list(cp.items())))
        self.assertEqual(module.checkpoint_digest(cp), module.checkpoint_digest(reversed_cp))


if __name__ == "__main__":
    unittest.main()
