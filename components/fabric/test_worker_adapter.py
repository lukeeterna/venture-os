#!/usr/bin/env python3
import hashlib
import importlib.util
import shutil
import tempfile
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).with_name("worker_adapter.py")
spec = importlib.util.spec_from_file_location("worker_adapter_under_test", str(MODULE_PATH))
module = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(module)


def tool(name):
    path = shutil.which(name)
    if not path:
        raise RuntimeError("required fixture tool not found: " + name)
    return str(Path(path).resolve())


PRINTF = tool("printf")
TRUE = tool("true")
FALSE = tool("false")
SLEEP = tool("sleep")


class WorkerAdapterTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.cwd = Path(self.tmp.name).resolve()

    def tearDown(self):
        self.tmp.cleanup()

    def request(self, command):
        return {
            "request_id": "fixture-1",
            "mandate_sha256": "a" * 64,
            "worker_id": "fixture-process",
            "eligible_workers": ["fixture-process"],
            "data_class": "INTERNAL",
            "max_cost_usd": 0,
            "network": "NONE",
            "external_effects": False,
            "command": command,
            "allowed_executables": [command[0]],
            "allowed_paths": [str(self.cwd)],
            "cwd": str(self.cwd),
            "timeout_seconds": 5,
            "env": {},
        }

    def test_success_has_content_hashes(self):
        raw = self.request([PRINTF, "hello\n"])
        result = module.run_request(raw)
        self.assertEqual(result["status"], "DONE")
        self.assertEqual(result["exit_code"], 0)
        self.assertEqual(result["stdout_sha256"], hashlib.sha256(b"hello\n").hexdigest())
        self.assertEqual(result["stdout_bytes"], 6)
        self.assertEqual(result["mandate_sha256"], "a" * 64)

    def test_nonzero_is_terminal_failed(self):
        result = module.run_request(self.request([FALSE]))
        self.assertEqual(result["status"], "FAILED")
        self.assertNotEqual(result["exit_code"], 0)

    def test_timeout_is_terminal(self):
        raw = self.request([SLEEP, "2"])
        raw["timeout_seconds"] = 0.05
        result = module.run_request(raw)
        self.assertEqual(result["status"], "TIMEOUT")
        self.assertIsNone(result["exit_code"])

    def test_paid_request_is_blocked(self):
        raw = self.request([TRUE])
        raw["max_cost_usd"] = 0.01
        result = module.run_request(raw)
        self.assertEqual(result["status"], "BLOCKED")
        self.assertIn("max_cost_usd", result["reason"])

    def test_missing_data_class_is_blocked(self):
        raw = self.request([TRUE])
        raw.pop("data_class")
        result = module.run_request(raw)
        self.assertEqual(result["status"], "BLOCKED")
        self.assertIn("data_class", result["reason"])

    def test_bad_mandate_hash_is_blocked(self):
        raw = self.request([TRUE])
        raw["mandate_sha256"] = "not-a-sha"
        result = module.run_request(raw)
        self.assertEqual(result["status"], "BLOCKED")
        self.assertIn("mandate_sha256", result["reason"])

    def test_ineligible_worker_is_blocked(self):
        raw = self.request([TRUE])
        raw["worker_id"] = "other"
        result = module.run_request(raw)
        self.assertEqual(result["status"], "BLOCKED")
        self.assertIn("not eligible", result["reason"])

    def test_network_requires_vos_reference(self):
        raw = self.request([TRUE])
        raw["network"] = "VOS_AUTHORIZED"
        result = module.run_request(raw)
        self.assertEqual(result["status"], "BLOCKED")
        self.assertIn("network_authorization_ref", result["reason"])

    def test_structurally_authorized_network_is_accepted(self):
        raw = self.request([TRUE])
        raw["network"] = "VOS_AUTHORIZED"
        raw["network_authorization_ref"] = "vos-result://fixture/network/1"
        result = module.run_request(raw)
        self.assertEqual(result["status"], "DONE")

    def test_external_effects_are_blocked(self):
        raw = self.request([TRUE])
        raw["external_effects"] = True
        result = module.run_request(raw)
        self.assertEqual(result["status"], "BLOCKED")
        self.assertIn("external_effects", result["reason"])

    def test_cwd_outside_allowed_paths_is_blocked(self):
        raw = self.request([TRUE])
        with tempfile.TemporaryDirectory() as other:
            raw["cwd"] = other
            result = module.run_request(raw)
        self.assertEqual(result["status"], "BLOCKED")
        self.assertIn("allowed_paths", result["reason"])

    def test_relative_executable_is_blocked(self):
        raw = self.request([TRUE])
        raw["command"][0] = "true"
        result = module.run_request(raw)
        self.assertEqual(result["status"], "BLOCKED")
        self.assertIn("absolute", result["reason"])

    def test_executable_outside_allowlist_is_blocked(self):
        raw = self.request([TRUE])
        raw["allowed_executables"] = [FALSE]
        result = module.run_request(raw)
        self.assertEqual(result["status"], "BLOCKED")
        self.assertIn("allowed_executables", result["reason"])

    def test_string_command_is_blocked_no_shell_fallback(self):
        raw = self.request([TRUE])
        raw["command"] = "echo unsafe"
        result = module.run_request(raw)
        self.assertEqual(result["status"], "BLOCKED")
        self.assertIn("argv", result["reason"])

    def test_missing_executable_is_terminal_worker_error(self):
        missing = str((self.cwd / "__vos_fixture_missing_binary__").resolve())
        raw = self.request([missing])
        raw["allowed_executables"] = [missing]
        result = module.run_request(raw)
        self.assertEqual(result["status"], "WORKER_ERROR")
        self.assertIsNone(result["exit_code"])
        self.assertGreater(result["stderr_bytes"], 0)


if __name__ == "__main__":
    unittest.main()
