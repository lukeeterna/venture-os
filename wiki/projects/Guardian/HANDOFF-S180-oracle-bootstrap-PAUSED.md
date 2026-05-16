# HANDOFF S180 Oracle bootstrap — PAUSED per system stress

> Generato 2026-05-16 sessione corrente, pausa per macOS load 444 / processo stuck.
> NON sovrascrivere HANDOFF-S180.md generale, questo è micro-state.

## DOVE SIAMO ESATTAMENTE

Account Oracle Cloud Free Tier **attivato**:
- Cloud Account: `gianlucadistasi81`
- Username: `gianlucadistasi81@gmail.com`
- Tenancy: `gianlucadistasi81`
- Home region scelta: **Italy Northwest / Milan (`eu-milan-1`)** — CONFERMATO da Luke 2026-05-16, LOCKED per Always Free (non cambiabile)
- Availability Domain: **eu-milan-1-AD-1** (single-AD region, no fallback AD-2/AD-3)
- Strategia OOC: retry loop su AD-1 con exponential backoff (Milan meno saturata di Frankfurt storicamente)

## CREDENTIAL GIÀ GENERATE SU MACBOOK (NON ripetere generazione)

### SSH keypair (per accesso ARM A1 instance)
- Private: `~/.ssh/oracle_guardian_ed25519` (perms 600, no passphrase)
- Public: `~/.ssh/oracle_guardian_ed25519.pub`
- Comment: `luke-guardian-oracle-arm-20260516`
- Fingerprint pub: `SHA256:mc3HGV1YMfhCkoVQklNFENsCgp2lZnAfhUvTLLLBZwM`

### OCI API keypair (per autenticazione CLI)
- Private: `~/.oci/oci_api_key.pem` (perms 600)
- Public: `~/.oci/oci_api_key_public.pem`
- Fingerprint MD5: `8d:4a:42:d1:1a:cc:60:a3:26:04:b8:85:7a:fc:fe:cf`

## STATO ESECUZIONE STEP

- [x] P1 Step 1 — Genera API keypair PEM (DONE, files in ~/.oci/)
- [x] P1 Step 2.0 — pipx installed (1.7.1 via brew)
- [x] P1 Step 2.1 — oci-cli 3.82.0 installato (pipx metadata ancora corrotto ma binary funzionante via symlink manuale in ~/.local/bin/oci → ~/.local/pipx/venvs/oci-cli/bin/oci)
- [ ] P1 Step 2.2 — **Luke deve fare**: console OCI → My profile → API keys → Add API key → paste public key (~/.oci/oci_api_key_public.pem)
- [ ] P1 Step 2.3 — Luke copia "Configuration File Preview" da console e incolla in chat (user OCID, tenancy OCID, region, fingerprint)
- [ ] P1 Step 3 — Claude scrive ~/.oci/config + test `oci iam region list`
- [ ] P1 Step 4 — Claude crea VCN + subnet + IGW + security list via CLI
- [ ] P1 Step 5 — Claude launch ARM A1 instance Ubuntu 22.04 4 OCPU 24GB Milan AD-1 con SSH pub key embedded, retry loop OOC con backoff (single-AD region)
- [ ] P1 Step 6 — Claude output Public IP + scrive ~/.ssh/config alias `oracle-arm` + test connect

## PROSSIMI 3 COMANDI AL RESTART

1. Verifica system load OK: `uptime` (load < 5)
2. Verifica file ancora present: `ls -la ~/.oci/ ~/.ssh/oracle_guardian_ed25519*`
3. Reinstall oci-cli: `pipx install oci-cli` (se non ancora installato, check `which oci`)

Poi riapri questo file e riprendi da step 2.2 (Luke incolla pub key in console OCI).

## PUBLIC KEY DA INCOLLARE IN ORACLE CONSOLE (step 2.2)

```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkA1kHGnQ8X7c9ErzhNya
DbAGMRI+5YVIkVhoTwqumWMWpIm7FWnOj6rWwwkZoMjGOvkd1a94KsqrisslEmLh
E5oCi0JtTQfytNeu+73ZrzX77CsuttQvC+D4M55Uw6hDvcDFLC4+FmJ6tdMBBPs5
WciNsfnP+m56GUJk3DCg19/OdAeY+hRIvoS7XQM0iWFCwCDzzyDVAMgHXnlsMF/O
fpqRDCs+A7/aljP7cXSS1sWEjLMXKIkPAbgOAO6yMXOzzcVSOyPSIcoOA6yY1tJT
ZgZqNZMyuNZaaibiUEGqnQozjr856hWR81jtFyhenBzouncpmui9Nl+jur4WnuTv
OQIDAQAB
-----END PUBLIC KEY-----
```

Match fingerprint atteso (Oracle deve mostrarlo dopo paste): `8d:4a:42:d1:1a:cc:60:a3:26:04:b8:85:7a:fc:fe:cf`

## SSH PUBLIC KEY DA EMBED IN ARM A1 INSTANCE (step 5)

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPxpm38IQhgxQlQxQUTF0UxB4VG3WL9LPgVeG5r76zc6 luke-guardian-oracle-arm-20260516
```

## VINCOLI CONFERMATI

- Region Milan eu-milan-1 (Always Free supports ARM A1 Flex, home region locked)
- Shape: `VM.Standard.A1.Flex` OCPU=4 RAM=24GB
- Image: Canonical Ubuntu 22.04 (NON 24.04, NON Oracle Linux)
- Boot volume: default 47GB (limite gratuito 200GB block storage)
- Public IPv4: assigned
- Security list: ingress port 22 (ssh), poi MQTT 1883 (interno Tailscale) + Tailscale UDP — definire P1 step 4

## CAUSA PAUSA

System load 444 sessione corrente. Diagnostica top -o mem/cpu pending. Sospetti: residui spawn background, possibile fork bomb script utente, pipx install non era colpevole isolato (lanciato dopo segnale già presente).
