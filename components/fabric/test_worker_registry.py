#!/usr/bin/env python3
import unittest

try:
    from . import router, worker_registry
except ImportError:
    import router  # type: ignore
    import worker_registry  # type: ignore


class CertifiedWorkerRegistryTests(unittest.TestCase):
    def test_exact_qualification_refs_are_bound(self):
        workers = worker_registry.certified_public_registry()
        by_id = {item["worker_id"]: item for item in workers}
        codex = by_id[worker_registry.CODEX_WORKER_ID]
        a2 = by_id[worker_registry.A2_WORKER_ID]

        self.assertEqual(codex["qualification_ref"], worker_registry.G2_QUALIFICATION_REF)
        self.assertIn("run=34964332252", codex["qualification_ref"])
        self.assertIn("runtime_parent_run=34888246045", codex["qualification_ref"])

        self.assertEqual(a2["qualification_ref"], worker_registry.A2_QUALIFICATION_REF)
        self.assertIn("runtime_run=35001277172", a2["qualification_ref"])
        self.assertIn("runtime_job=104489983602", a2["qualification_ref"])
        self.assertIn("fabric_a2=443d285caff4631de6d0f94d3a28cc765f6b914a", a2["qualification_ref"])
        self.assertIn("composite_run=35001894829", a2["qualification_ref"])
        self.assertIn("composite_head=490bdef15b266c4c21ee6059081a4088bc3cfd05", a2["qualification_ref"])

    def test_a2_remains_public_only_zero_cost_direct_official(self):
        workers = worker_registry.certified_public_registry()
        a2 = next(item for item in workers if item["worker_id"] == worker_registry.A2_WORKER_ID)
        self.assertEqual(a2["kind"], "DIRECT_OFFICIAL")
        self.assertEqual(a2["data_classes"], ["PUBLIC"])
        self.assertEqual(a2["data_policy"], "PUBLIC_ONLY")
        self.assertEqual(a2["max_cost_usd"], 0.0)
        self.assertIs(a2["zero_cost_hard_stop"], True)
        self.assertIs(a2["consumer_oauth_proxy"], False)

    def test_codex_breaker_open_is_exact_evidence_bound(self):
        state = worker_registry.current_capacity_state()
        codex = state["breakers"][worker_registry.CODEX_WORKER_ID]
        self.assertEqual(codex["state"], "OPEN")
        self.assertIsNone(codex["reset_at"])
        self.assertEqual(
            state["evidence"][worker_registry.CODEX_WORKER_ID],
            worker_registry.CODEX_CAPACITY_EVIDENCE_REF,
        )
        self.assertIn("run=34964855224", worker_registry.CODEX_CAPACITY_EVIDENCE_REF)
        self.assertIn("job=104366796337", worker_registry.CODEX_CAPACITY_EVIDENCE_REF)
        self.assertIn("classification=BLOCKED_PROVIDER_CAPACITY", worker_registry.CODEX_CAPACITY_EVIDENCE_REF)

    def test_canonical_public_route_skips_open_codex_and_selects_a2(self):
        routed = worker_registry.route_public_request()
        self.assertEqual(routed["request"]["max_cost_usd"], 0)
        self.assertEqual(routed["request"]["data_class"], "PUBLIC")
        self.assertEqual(routed["decision"]["status"], "ROUTE")
        self.assertEqual(
            routed["decision"]["worker"]["worker_id"],
            worker_registry.A2_WORKER_ID,
        )

    def test_without_capacity_block_deterministic_priority_prefers_codex(self):
        registry = worker_registry.certified_public_registry()
        request = {
            "data_class": "PUBLIC",
            "eligible_workers": [worker_registry.CODEX_WORKER_ID, worker_registry.A2_WORKER_ID],
            "max_cost_usd": 0,
        }
        decision = router.route_request(request, registry, {})
        self.assertEqual(decision["status"], "ROUTE")
        self.assertEqual(decision["worker"]["worker_id"], worker_registry.CODEX_WORKER_ID)

    def test_non_public_request_is_not_eligible(self):
        registry = worker_registry.certified_public_registry()
        capacity = worker_registry.current_capacity_state()
        request = {
            "data_class": "INTERNAL",
            "eligible_workers": [worker_registry.CODEX_WORKER_ID, worker_registry.A2_WORKER_ID],
            "max_cost_usd": 0,
        }
        decision = router.route_request(request, registry, capacity["breakers"])
        self.assertEqual(decision["status"], "BLOCKED_DATA_POLICY")


if __name__ == "__main__":
    unittest.main()
