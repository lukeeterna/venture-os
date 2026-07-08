#!/usr/bin/env python3
"""
VOS LLM Router — multi-provider LLM CLI con cost tracking.
Usage:
  router.py --role <long_context|code_gen|code_review|reasoning|cheap> --prompt "..."
  router.py --model <name> --prompt "..."  # explicit model
  router.py --list                          # list available models
"""
import os, sys, json, time, argparse, urllib.request, urllib.error
from pathlib import Path
from datetime import datetime, timezone

# Load env from ~/.claude/.env.free-gpu
ENV_FILE = Path.home() / ".claude/.env.free-gpu"
if ENV_FILE.exists():
    for line in ENV_FILE.read_text().splitlines():
        if "=" in line and not line.strip().startswith("#"):
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

COSTS_LOG = Path.home() / "venture-os/state/costs.jsonl"

# Routing matrix per role (verified 2026-05-16)
ROLES = {
    "long_context": [
        ("gemini-2.5-flash", "google", 0.0, 0.0),  # FREE 250 RPD
        ("deepseek/deepseek-chat", "openrouter", 0.32, 0.89),
    ],
    "code_gen": [
        ("moonshotai/kimi-k2.5", "openrouter", 0.40, 1.90),
        ("deepseek/deepseek-chat", "openrouter", 0.32, 0.89),
    ],
    "code_review": [
        ("deepseek/deepseek-chat", "openrouter", 0.32, 0.89),
        ("qwen/qwen3-coder:free", "openrouter", 0.0, 0.0),
    ],
    "reasoning": [
        ("deepseek/deepseek-chat", "openrouter", 0.32, 0.89),
        ("gemini-2.5-pro", "google", 1.25, 5.0),
    ],
    "cheap": [
        ("gemini-2.5-flash", "google", 0.0, 0.0),
        ("meta-llama/llama-3.3-70b-instruct:free", "openrouter", 0.0, 0.0),
    ],
}


def call_google(model, prompt, max_tokens=2000):
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise RuntimeError("GEMINI_API_KEY missing")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
    body = json.dumps({"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"maxOutputTokens": max_tokens}}).encode()
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = json.loads(r.read())
    text = data["candidates"][0]["content"]["parts"][0]["text"]
    usage = data.get("usageMetadata", {})
    return text, usage.get("promptTokenCount", 0), usage.get("candidatesTokenCount", 0)


def call_openrouter(model, prompt, max_tokens=2000):
    key = os.environ.get("OPENROUTER_API_KEY")
    if not key:
        raise RuntimeError("OPENROUTER_API_KEY missing")
    url = "https://openrouter.ai/api/v1/chat/completions"
    body = json.dumps({"model": model, "messages": [{"role": "user", "content": prompt}], "max_tokens": max_tokens}).encode()
    req = urllib.request.Request(url, data=body, headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r:
        data = json.loads(r.read())
    text = data["choices"][0]["message"]["content"]
    usage = data.get("usage", {})
    return text, usage.get("prompt_tokens", 0), usage.get("completion_tokens", 0)


def call_cerebras(model, prompt, max_tokens=2000):
    key = os.environ.get("CEREBRAS_API_KEY")
    if not key:
        raise RuntimeError("CEREBRAS_API_KEY missing")
    url = "https://api.cerebras.ai/v1/chat/completions"
    body = json.dumps({"model": model, "messages": [{"role": "user", "content": prompt}], "max_tokens": max_tokens}).encode()
    req = urllib.request.Request(url, data=body, headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = json.loads(r.read())
    text = data["choices"][0]["message"]["content"]
    usage = data.get("usage", {})
    return text, usage.get("prompt_tokens", 0), usage.get("completion_tokens", 0)


PROVIDERS = {"google": call_google, "openrouter": call_openrouter, "cerebras": call_cerebras}


def log_cost(model, provider, in_tok, out_tok, cost_usd, latency_ms, role):
    COSTS_LOG.parent.mkdir(parents=True, exist_ok=True)
    entry = {"ts": datetime.now(timezone.utc).isoformat(), "model": model, "provider": provider, "role": role, "in_tok": in_tok, "out_tok": out_tok, "cost_usd": round(cost_usd, 6), "latency_ms": latency_ms}
    with COSTS_LOG.open("a") as f:
        f.write(json.dumps(entry) + "\n")


def run(role=None, model=None, prompt="", max_tokens=2000):
    if model:
        candidates = [(model, "openrouter" if "/" in model else "google", 0, 0)]
    elif role:
        candidates = ROLES.get(role, [])
        if not candidates:
            return {"error": f"unknown role: {role}"}
    else:
        return {"error": "either --role or --model required"}

    for model_id, provider, cost_in, cost_out in candidates:
        try:
            t0 = time.time()
            text, in_tok, out_tok = PROVIDERS[provider](model_id, prompt, max_tokens)
            latency = int((time.time() - t0) * 1000)
            cost = (in_tok * cost_in + out_tok * cost_out) / 1_000_000
            log_cost(model_id, provider, in_tok, out_tok, cost, latency, role or "explicit")
            return {"result": text, "model": model_id, "provider": provider, "in_tok": in_tok, "out_tok": out_tok, "cost_usd": round(cost, 6), "latency_ms": latency}
        except (urllib.error.HTTPError, urllib.error.URLError, RuntimeError, KeyError) as e:
            print(f"# fallback from {model_id}: {e}", file=sys.stderr)
            continue
    return {"error": "all candidates failed"}


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--role", choices=list(ROLES.keys()))
    p.add_argument("--model")
    p.add_argument("--prompt", default="")
    p.add_argument("--max-tokens", type=int, default=2000)
    p.add_argument("--list", action="store_true")
    args = p.parse_args()
    if args.list:
        for role, models in ROLES.items():
            print(f"\n[{role}]")
            for m, prov, ci, co in models:
                print(f"  {m} ({prov}) ${ci}/${co} per M tok")
        return
    if not args.prompt and not sys.stdin.isatty():
        args.prompt = sys.stdin.read()
    if not args.prompt:
        print("ERROR: --prompt required (or stdin)", file=sys.stderr)
        sys.exit(1)
    result = run(role=args.role, model=args.model, prompt=args.prompt, max_tokens=args.max_tokens)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
