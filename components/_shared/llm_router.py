# llm_router.py — VOS S9 LLM router adapter (long_context fallback chain runtime).
#
# Espone una facade `complete()` che legge routing.yaml e prova primary →
# fallback chain in ordine. Provider supportati: google (Gemini), openrouter
# (OpenAI-compat), cerebras (OpenAI-compat, deferred long_context).
#
# Vincoli (CLAUDE.md):
#   #1  fattualita: endpoint/headers verificati via routing-http-verify S8.
#   #5  zero-cost: free tier first, costi tracciati state/costs.jsonl.
#   #8  no libs blacklist: solo stdlib + requests + pyyaml.
#   #10 verified > verosimile: errori espliciti, no fallback silenzioso su
#       errori non-retryable (400/401/403 → raise, no next provider).
#
# Scope chunking: ottimizzato per output narrativo/markdown (Karpathy compilation).
# NON usare per output JSON strictly-structured: continuation prompt può
# produrre ripetizioni o salti. Per JSON usa single-shot con provider che
# garantisce output_tokens_max ≥ richiesto.
#
# Circuit breaker scope: in-process (module-level dict). Stato perso a ogni
# rilancio python3. Per S9 sufficiente (compiler fa N call nello stesso
# processo). File-state deferred a S9b se serve cross-process.

"""LLM router adapter — fallback chain runtime per routing.yaml."""
from __future__ import annotations

import json
import os
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Tuple

import requests
import yaml

# ----- paths -----

VOS_ROOT = Path(os.path.expanduser("~/venture-os"))
ROUTING_FILE = VOS_ROOT / "config" / "routing.yaml"
COSTS_FILE = VOS_ROOT / "state" / "costs.jsonl"
ENV_FILE = Path.home() / ".claude" / ".env.free-gpu"

COMPONENT = "llm-router"

# ----- circuit breaker state (module-level, in-process) -----

# fail_log[provider_model_id] = [ts1, ts2, ...] failure timestamps.
# skip_until[provider_model_id] = epoch ts oltre cui riprovare.
_fail_log: Dict[str, List[float]] = {}
_skip_until: Dict[str, float] = {}

CB_FAIL_WINDOW_S = 300.0   # 5 minuti
CB_FAIL_THRESHOLD = 3
CB_SKIP_DURATION_S = 600.0  # 10 minuti


def _cb_record_failure(key: str) -> None:
    now = time.time()
    log = _fail_log.setdefault(key, [])
    log.append(now)
    # purge oltre finestra
    _fail_log[key] = [t for t in log if now - t <= CB_FAIL_WINDOW_S]
    if len(_fail_log[key]) >= CB_FAIL_THRESHOLD:
        _skip_until[key] = now + CB_SKIP_DURATION_S


def _cb_should_skip(key: str) -> bool:
    until = _skip_until.get(key, 0.0)
    if until and time.time() < until:
        return True
    if until and time.time() >= until:
        # reset alla scadenza
        _skip_until.pop(key, None)
        _fail_log.pop(key, None)
    return False


def _cb_reset_on_success(key: str) -> None:
    _fail_log.pop(key, None)
    _skip_until.pop(key, None)


# ----- env + config -----

def _load_env_file(path: Path = ENV_FILE) -> Dict[str, str]:
    out: Dict[str, str] = {}
    if not path.exists():
        return out
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def _resolve_api_key(auth_env: str) -> str:
    """Precedenza env var > env file (env var sovrascrive per test fault-injection)."""
    env_var = os.environ.get(auth_env, "")
    if env_var:
        return env_var
    return _load_env_file().get(auth_env, "")


def _load_routing(path: Path = ROUTING_FILE) -> dict:
    if not path.exists():
        raise RouterError(f"routing.yaml missing: {path}")
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def _resolve_chain(routing: dict, role: str) -> List[dict]:
    """Risolve la fallback chain per un role.

    Per role='long_context' usa defaults.long_context_fallback_chain (lista di
    model_id). Per altri role usa il singolo model con matching role.
    """
    models_by_id: Dict[str, dict] = {m["model_id"]: m for m in routing.get("models", [])}
    defaults = routing.get("defaults", {})

    chain: List[dict] = []
    if role == "long_context":
        chain_ids = defaults.get("long_context_fallback_chain") or [defaults.get("long_context")]
        for mid in chain_ids:
            if not mid:
                continue
            entry = models_by_id.get(mid)
            if entry is None:
                # Vincolo #10: fail-fast, no silent skip.
                raise RouterError(
                    f"chain references model_id '{mid}' not present in routing.yaml models. "
                    "Verifica catalog drift con routing-http-verify.py."
                )
            chain.append(entry)
    else:
        # Generic role: prima entry con role match + eventuali fallback con
        # role <role>_fallback_*. Per S9 minimo cerchiamo solo singolo match.
        for m in routing.get("models", []):
            if m.get("role") == role:
                chain.append(m)
        if not chain:
            raise RouterError(f"no model entry for role={role} in routing.yaml")
    return chain


# ----- errors -----

class RouterError(Exception):
    """Errore di configurazione o exhaustion fallback chain."""


class _ProviderRetryable(Exception):
    """Errore retryable (429/5xx/timeout) → prossimo provider."""

    def __init__(self, msg: str, status: int = 0):
        super().__init__(msg)
        self.status = status


class _ProviderFatal(Exception):
    """Errore non-retryable (400/401/403) → raise immediato, no fallback."""

    def __init__(self, msg: str, status: int = 0):
        super().__init__(msg)
        self.status = status


# ----- provider base + impls -----

@dataclass
class CallResult:
    text: str
    tokens_in: int
    tokens_out: int
    finish_reason: str = ""  # "stop", "length", "max_tokens", "error"
    raw: dict = field(default_factory=dict)


class _Provider:
    """Base provider — sottoclassi implementano _call_once."""

    name = "base"

    def __init__(self, model_entry: dict):
        self.entry = model_entry
        self.model_id = model_entry["model_id"]
        self.endpoint = model_entry["api_endpoint"].rstrip("/")
        self.auth_env = model_entry.get("auth_env", "")
        self.output_tokens_max = int(model_entry.get("output_tokens_max", 4096))
        self.required_headers = model_entry.get("required_headers", {}) or {}

    def cb_key(self) -> str:
        return f"{self.name}|{self.model_id}"

    def call(self, system: Optional[str], user: str,
             max_output_tokens: Optional[int], temperature: float,
             timeout_s: int = 300) -> CallResult:
        return self._call_once(system, user, max_output_tokens, temperature, timeout_s)

    def _call_once(self, system: Optional[str], user: str,
                   max_output_tokens: Optional[int], temperature: float,
                   timeout_s: int) -> CallResult:  # pragma: no cover
        raise NotImplementedError


class GoogleProvider(_Provider):
    """Gemini generativelanguage.googleapis.com — systemInstruction + contents."""

    name = "google"

    def _call_once(self, system, user, max_output_tokens, temperature, timeout_s):
        api_key = _resolve_api_key(self.auth_env)
        if not api_key:
            raise _ProviderFatal(f"missing_key:{self.auth_env}", status=0)
        url = f"{self.endpoint}/models/{self.model_id}:generateContent"
        headers = {
            "x-goog-api-key": api_key,
            "Content-Type": "application/json",
            "User-Agent": "venture-os/1.0",
        }
        max_out = max_output_tokens or self.output_tokens_max
        payload: Dict[str, Any] = {
            "contents": [{"role": "user", "parts": [{"text": user}]}],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_out,
                # Disabilita thinking: 2.5-flash brucia maxOutputTokens budget
                # su CoT interno. Karpathy use case = consolidamento, non reasoning.
                "thinkingConfig": {"thinkingBudget": 0},
            },
        }
        if system:
            payload["systemInstruction"] = {"parts": [{"text": system}]}

        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=timeout_s)
        except requests.exceptions.Timeout as e:
            raise _ProviderRetryable(f"timeout: {e}", status=0)
        except requests.exceptions.ConnectionError as e:
            raise _ProviderRetryable(f"conn_error: {e}", status=0)

        if resp.status_code == 200:
            data = resp.json()
            try:
                text = data["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError):
                # finish_reason MAX_TOKENS spesso => no parts. Trattiamo come truncation.
                fr = (data.get("candidates", [{}])[0] or {}).get("finishReason", "")
                if fr in ("MAX_TOKENS", "LENGTH"):
                    text = ""
                else:
                    raise _ProviderFatal(
                        f"unexpected_response_shape finish_reason={fr} body={str(data)[:300]}",
                        status=200,
                    )
            usage = data.get("usageMetadata", {}) or {}
            fr = (data.get("candidates", [{}])[0] or {}).get("finishReason", "")
            return CallResult(
                text=text,
                tokens_in=int(usage.get("promptTokenCount", 0)),
                tokens_out=int(usage.get("candidatesTokenCount", 0)),
                finish_reason=fr,
                raw=data,
            )

        body_snip = resp.text[:500]
        if resp.status_code == 429:
            raise _ProviderRetryable(f"rate_limit_429: {body_snip}", status=429)
        if resp.status_code in (500, 502, 503, 504):
            raise _ProviderRetryable(f"server_err_{resp.status_code}: {body_snip}", status=resp.status_code)
        # 400 / 401 / 403 → fatal, no fallback (key invalid è errore di config)
        # NB Gemini ritorna 400 "API key not valid" per chiavi rotte → cb tratta come fatal.
        # Per fault-injection test usiamo invece sovrascrittura env con chiave _vuota_
        # → _ProviderFatal("missing_key") che NON entra in fallback. Per testare
        # fallback dobbiamo usare una chiave _sintatticamente valida ma rifiutata
        # con 429 (impossibile da forzare) → workaround: monkey-patch _call_once.
        raise _ProviderFatal(f"http_{resp.status_code}: {body_snip}", status=resp.status_code)


class OpenAICompatProvider(_Provider):
    """OpenRouter + Cerebras condividono /chat/completions OpenAI-style."""

    name = "openai_compat"

    def _call_once(self, system, user, max_output_tokens, temperature, timeout_s):
        api_key = _resolve_api_key(self.auth_env)
        if not api_key:
            raise _ProviderFatal(f"missing_key:{self.auth_env}", status=0)
        url = f"{self.endpoint}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "venture-os/1.0",
            "Accept": "application/json",
        }
        headers.update(self.required_headers)

        messages: List[dict] = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": user})

        max_out = max_output_tokens or self.output_tokens_max
        payload = {
            "model": self.model_id,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_out,
        }

        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=timeout_s)
        except requests.exceptions.Timeout as e:
            raise _ProviderRetryable(f"timeout: {e}", status=0)
        except requests.exceptions.ConnectionError as e:
            raise _ProviderRetryable(f"conn_error: {e}", status=0)

        if resp.status_code == 200:
            data = resp.json()
            try:
                choice = data["choices"][0]
                text = choice["message"]["content"] or ""
                fr = choice.get("finish_reason", "")
            except (KeyError, IndexError):
                raise _ProviderFatal(
                    f"unexpected_response_shape body={str(data)[:300]}", status=200
                )
            usage = data.get("usage", {}) or {}
            return CallResult(
                text=text,
                tokens_in=int(usage.get("prompt_tokens", 0)),
                tokens_out=int(usage.get("completion_tokens", 0)),
                finish_reason=fr,
                raw=data,
            )

        body_snip = resp.text[:500]
        if resp.status_code == 429:
            raise _ProviderRetryable(f"rate_limit_429: {body_snip}", status=429)
        if resp.status_code in (500, 502, 503, 504):
            raise _ProviderRetryable(f"server_err_{resp.status_code}: {body_snip}", status=resp.status_code)
        raise _ProviderFatal(f"http_{resp.status_code}: {body_snip}", status=resp.status_code)


def _build_provider(entry: dict) -> _Provider:
    provider_name = entry.get("provider", "")
    if provider_name == "google":
        return GoogleProvider(entry)
    if provider_name in ("openrouter", "cerebras"):
        p = OpenAICompatProvider(entry)
        p.name = provider_name  # for cb key + logs
        return p
    raise RouterError(f"unsupported provider: {provider_name}")


# ----- cost tracking -----

# Pricing fallback (USD per 1M tokens). Free tier = 0.0. Aggiornato runtime
# da campi cost_per_1m_in/out di routing.yaml entry; questi sono backup.
def _compute_cost_usd(entry: dict, tokens_in: int, tokens_out: int) -> float:
    if entry.get("free_tier"):
        return 0.0
    cin = float(entry.get("cost_per_1m_in", 0.0))
    cout = float(entry.get("cost_per_1m_out", 0.0))
    return (tokens_in / 1_000_000.0) * cin + (tokens_out / 1_000_000.0) * cout


def _track_cost(record: dict) -> None:
    COSTS_FILE.parent.mkdir(parents=True, exist_ok=True)
    record.setdefault("ts", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
    record.setdefault("component", COMPONENT)
    with COSTS_FILE.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


# ----- output chunking -----

CONTINUATION_TAIL_CHARS = 200
CHUNK_MAX_ROUNDS = 8  # safety cap: max 8 segmenti = 8x output_tokens_max


def _continuation_user_prompt(original_user: str, accumulated_tail: str, round_idx: int) -> str:
    """Costruisce prompt di continuation: original + 'continue from: <tail>'."""
    return (
        f"{original_user}\n\n"
        f"---\n"
        f"[CONTINUATION ROUND {round_idx}] "
        f"Continue the output from EXACTLY where it stopped. "
        f"Do NOT repeat content already produced. Last 200 characters produced were:\n"
        f"<<<\n{accumulated_tail}\n>>>\n"
        f"Resume from after these characters. No preamble, no re-introduction."
    )


def _call_with_chunking(provider: _Provider, system: Optional[str], user: str,
                        max_output_tokens: Optional[int], temperature: float,
                        timeout_s: int) -> Tuple[str, int, int, int]:
    """Chiama il provider, applicando output chunking se richiesto > cap del provider.

    Returns: (full_text, total_tokens_in, total_tokens_out, rounds_done).
    """
    target_out = max_output_tokens or provider.output_tokens_max
    if target_out <= provider.output_tokens_max:
        # Single-shot, no chunking
        r = provider.call(system, user, target_out, temperature, timeout_s)
        return r.text, r.tokens_in, r.tokens_out, 1

    # Chunking attivo: richiesta > cap provider
    sys.stderr.write(
        f"[{COMPONENT}] chunking attivo provider={provider.name}/{provider.model_id} "
        f"target_out={target_out} cap={provider.output_tokens_max}\n"
    )
    accumulated = ""
    total_in = 0
    total_out = 0
    rounds = 0
    remaining = target_out

    for round_idx in range(1, CHUNK_MAX_ROUNDS + 1):
        request_out = min(provider.output_tokens_max, remaining)
        if round_idx == 1:
            current_user = user
        else:
            tail = accumulated[-CONTINUATION_TAIL_CHARS:]
            current_user = _continuation_user_prompt(user, tail, round_idx)
        r = provider.call(system, current_user, request_out, temperature, timeout_s)
        rounds = round_idx
        total_in += r.tokens_in
        total_out += r.tokens_out
        accumulated += r.text
        # Stop condition: modello dichiara "stop" naturale OR output vuoto
        # OR raggiunto target.
        fr = (r.finish_reason or "").lower()
        natural_stop = fr in ("stop", "stop_sequence")
        if not r.text or natural_stop:
            break
        # Decrementa quota residua per output ACTUAL tokens emessi.
        remaining -= max(r.tokens_out, 1)
        if remaining <= 50:  # tolleranza
            break

    return accumulated, total_in, total_out, rounds


# ----- public facade -----

def complete(prompt: str,
             role: str = "long_context",
             system: Optional[str] = None,
             max_output_tokens: Optional[int] = None,
             temperature: float = 0.0,
             stream: bool = False,
             timeout_s: int = 600) -> str:
    """Completa un prompt usando la fallback chain del role.

    Args:
        prompt: user prompt (testo).
        role: routing role (default 'long_context'). Risolto via routing.yaml.
        system: optional system instruction.
        max_output_tokens: cap output (default = output_tokens_max del provider).
            Se >cap del provider corrente, viene applicato output chunking
            (multiple completions con continuation prompt — vedi scope nel header).
        temperature: 0.0 default (deterministic for compilation).
        stream: deferred S9b. Per ora deve essere False.
        timeout_s: timeout per singola HTTP call.

    Returns:
        Testo concatenato del completion.

    Raises:
        RouterError: config invalida o exhaustion della chain.
        _ProviderFatal: il primo errore non-retryable (4xx non-quota) abortisce.
    """
    if stream:
        raise NotImplementedError("stream=True deferred a S9b")

    routing = _load_routing()
    chain = _resolve_chain(routing, role)

    last_error: Optional[Exception] = None
    fallback_depth = 0

    for idx, entry in enumerate(chain):
        provider = _build_provider(entry)
        cb_key = provider.cb_key()

        if _cb_should_skip(cb_key):
            sys.stderr.write(f"[{COMPONENT}] cb_skip provider={cb_key} skip until={_skip_until.get(cb_key)}\n")
            continue

        t_start = time.time()
        try:
            text, tin, tout, rounds = _call_with_chunking(
                provider, system, prompt, max_output_tokens, temperature, timeout_s
            )
            latency_ms = int((time.time() - t_start) * 1000)
            _cb_reset_on_success(cb_key)
            _track_cost({
                "event": "complete",
                "role": role,
                "provider": provider.name,
                "model": provider.model_id,
                "input_tokens": tin,
                "output_tokens": tout,
                "cost_usd": _compute_cost_usd(entry, tin, tout),
                "latency_ms": latency_ms,
                "fallback_depth": fallback_depth,
                "chunk_rounds": rounds,
            })
            return text
        except _ProviderFatal as e:
            # 4xx non-quota: configurazione rotta. Non fallback.
            latency_ms = int((time.time() - t_start) * 1000)
            _track_cost({
                "event": "fatal",
                "role": role,
                "provider": provider.name,
                "model": provider.model_id,
                "input_tokens": 0,
                "output_tokens": 0,
                "cost_usd": 0.0,
                "latency_ms": latency_ms,
                "fallback_depth": fallback_depth,
                "error": str(e)[:300],
                "http_status": e.status,
            })
            # Eccezione: missing_key NON è fatal di routing — è fatal di un
            # singolo provider. Se primary key manca ma fallback key esiste,
            # vogliamo provare fallback. Quindi: missing_key → degradiamo a
            # retryable (passa a prossimo provider).
            if "missing_key" in str(e):
                last_error = e
                fallback_depth += 1
                _cb_record_failure(cb_key)
                continue
            raise
        except _ProviderRetryable as e:
            latency_ms = int((time.time() - t_start) * 1000)
            _track_cost({
                "event": "retryable_fail",
                "role": role,
                "provider": provider.name,
                "model": provider.model_id,
                "input_tokens": 0,
                "output_tokens": 0,
                "cost_usd": 0.0,
                "latency_ms": latency_ms,
                "fallback_depth": fallback_depth,
                "error": str(e)[:300],
                "http_status": e.status,
            })
            _cb_record_failure(cb_key)
            last_error = e
            fallback_depth += 1
            sys.stderr.write(
                f"[{COMPONENT}] retryable fail provider={provider.name}/{provider.model_id} "
                f"status={e.status} → next in chain (depth={fallback_depth})\n"
            )
            continue

    # Chain exhausted
    raise RouterError(
        f"fallback chain exhausted for role={role}, depth={fallback_depth}. "
        f"Last error: {last_error}"
    )


# ----- CLI smoke test -----

def _cli() -> int:
    """python3 llm_router.py 'prompt' [--role X] [--max-out N]"""
    import argparse
    p = argparse.ArgumentParser(description="VOS llm-router smoke test")
    p.add_argument("prompt", help="user prompt")
    p.add_argument("--role", default="long_context")
    p.add_argument("--system", default=None)
    p.add_argument("--max-out", type=int, default=None)
    p.add_argument("--temperature", type=float, default=0.0)
    args = p.parse_args()

    print(f"[{COMPONENT}] role={args.role} max_out={args.max_out}")
    t0 = time.time()
    out = complete(
        prompt=args.prompt,
        role=args.role,
        system=args.system,
        max_output_tokens=args.max_out,
        temperature=args.temperature,
    )
    dt = time.time() - t0
    print(f"--- output ({len(out)} chars, {dt:.1f}s) ---")
    print(out)
    return 0


if __name__ == "__main__":
    sys.exit(_cli())
