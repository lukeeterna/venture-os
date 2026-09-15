#!/usr/bin/env python3
import unittest

try:
    from . import router
except ImportError:
    import router  # type: ignore


def worker(
    worker_id,
    *,
    kind="DIRECT_OFFICIAL",
    policy="NO_TRAINING",
    classes=None,
    network="VOS_AUTHORIZED",
    priority=None,
    credential_domain=None,
    max_cost=0,
    hard_stop=True,
    oauth_proxy=False,
):
    if classes is None:
        classes = ["PUBLIC", "INTERNAL"]
    if priority is None:
        priority = {name: 10 for name in classes}
    return {
        "worker_id": worker_id,
        "provider": "provider-" + worker_id,
        "model_id": "model-" + worker_id,
        "kind": kind,
        "credential_domain": credential_domain or ("cred-" + worker_id),
        "qualification_ref": "evidence:qualification:" + worker_id,
        "data_policy_ref": "evidence:data-policy:" + worker_id,
        "data_classes": classes,
        "data_policy": policy,
        "network": network,
        "max_cost_usd": max_cost,
        "zero_cost_hard_stop": hard_stop,
        "consumer_oauth_proxy": oauth_proxy,
        "enabled": True,
        "priority": priority,
    }


class RouterTests(unittest.TestCase):
    def request(self, workers, data_class="PUBLIC", max_cost=0):
        return {
            "data_class": data_class,
            "eligible_workers": workers,
            "max_cost_usd": max_cost,
        }

    def test_deterministic_priority_then_worker_id(self):
        a = worker("a", priority={"PUBLIC": 20, "INTERNAL": 20})
        b = worker("b", priority={"PUBLIC": 10, "INTERNAL": 10})
        result = router.route_request(self.request(["a", "b"]), [a, b], {})
        self.assertEqual(result["status"], "ROUTE")
        self.assertEqual(result["worker"]["worker_id"], "b")

        a["priority"]["PUBLIC"] = 10
        result = router.route_request(self.request(["a", "b"]), [b, a], {})
        self.assertEqual(result["worker"]["worker_id"], "a")

    def test_request_nonzero_cost_blocked(self):
        result = router.route_request(self.request(["a"], max_cost=0.01), [worker("a")], {})
        self.assertEqual(result["status"], "BLOCKED_COST")

    def test_registry_requires_zero_cost_hard_stop(self):
        bad = worker("a", hard_stop=False)
        result = router.route_request(self.request(["a"]), [bad], {})
        self.assertEqual(result["status"], "BLOCKED_POLICY")

    def test_consumer_oauth_proxy_forbidden(self):
        bad = worker("a", oauth_proxy=True)
        result = router.route_request(self.request(["a"]), [bad], {})
        self.assertEqual(result["status"], "BLOCKED_POLICY")

    def test_credential_domains_must_be_isolated(self):
        a = worker("a", credential_domain="same")
        b = worker("b", credential_domain="same")
        result = router.route_request(self.request(["a", "b"]), [a, b], {})
        self.assertEqual(result["status"], "BLOCKED_POLICY")

    def test_internal_rejects_public_only(self):
        public = worker(
            "public",
            policy="PUBLIC_ONLY",
            classes=["PUBLIC"],
            priority={"PUBLIC": 1},
        )
        result = router.route_request(
            self.request(["public"], data_class="INTERNAL"), [public], {}
        )
        self.assertEqual(result["status"], "BLOCKED_DATA_POLICY")

    def test_confidential_requires_zdr_or_local(self):
        internal = worker("internal")
        result = router.route_request(
            self.request(["internal"], data_class="CONFIDENTIAL"), [internal], {}
        )
        self.assertEqual(result["status"], "BLOCKED_DATA_POLICY")

    def test_secret_requires_local_deterministic_zero_egress(self):
        local = worker(
            "local",
            kind="LOCAL_DETERMINISTIC",
            policy="LOCAL_ONLY",
            classes=["SECRET"],
            network="NONE",
            priority={"SECRET": 1},
        )
        result = router.route_request(
            self.request(["local"], data_class="SECRET"), [local], {}
        )
        self.assertEqual(result["status"], "ROUTE")
        self.assertEqual(result["worker"]["network"], "NONE")

    def test_open_breaker_skipped(self):
        a = worker("a", priority={"PUBLIC": 1, "INTERNAL": 1})
        b = worker("b", priority={"PUBLIC": 2, "INTERNAL": 2})
        breakers = {"a": {"state": "OPEN", "reset_at": 200, "failures": 1}}
        result = router.route_request(self.request(["a", "b"]), [a, b], breakers)
        self.assertEqual(result["worker"]["worker_id"], "b")

    def test_half_open_requires_explicit_probe(self):
        a = worker("a")
        breakers = {"a": {"state": "HALF_OPEN", "reset_at": 100, "failures": 1}}
        normal = router.route_request(self.request(["a"]), [a], breakers)
        self.assertEqual(normal["status"], "BLOCKED_QUOTA")
        probe = router.route_request(self.request(["a"]), [a], breakers, probe=True)
        self.assertEqual(probe["status"], "ROUTE")

    def test_unknown_quota_reset_stays_fail_closed(self):
        opened = router.transition_breaker(router.default_breaker(), "QUOTA", now=100)
        self.assertEqual(opened, {"state": "OPEN", "reset_at": None, "failures": 1})
        with self.assertRaises(router.RouterPolicyError):
            router.transition_breaker(opened, "PROBE_WINDOW", now=1000)

    def test_breaker_explicit_transitions(self):
        opened = router.transition_breaker(
            router.default_breaker(), "QUOTA", now=100, reset_at=200
        )
        with self.assertRaises(router.RouterPolicyError):
            router.transition_breaker(opened, "PROBE_WINDOW", now=199)
        half = router.transition_breaker(opened, "PROBE_WINDOW", now=200)
        self.assertEqual(half["state"], "HALF_OPEN")
        closed = router.transition_breaker(half, "SUCCESS", now=201)
        self.assertEqual(closed, router.default_breaker())


if __name__ == "__main__":
    unittest.main()
