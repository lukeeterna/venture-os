# Outreach message — SKELETON niche-free (meccanismo presell riusabile)

> Il *contenuto* lo attrezza la venture; lo *scheletro* e' riusabile. Tono founder, 1:1, no broadcast.
> Anti-pattern (factory-line §8b): NON "vi interessa?" generico. Apri con un'**osservazione concreta** sul dolore,
> non con il pitch. Il pitch e' la seconda frase.

## Slot da compilare per-venture (JIT, nel terminale della venture — NON qui)

| Slot | Cosa | Esempio (forma, non nicchia) |
|---|---|---|
| `{{founder}}` | nome reale, prima persona | "Gianluca" |
| `{{observation}}` | dolore osservato del buyer, specifico, verificabile | il workaround che usano oggi |
| `{{job_core}}` | cosa fa il prodotto in 1 frase, niente feature-list | l'esito, non il come |
| `{{anti_positioning}}` | da cosa ti distingui (il competitor che paga gia') | "Non sono <X>" |
| `{{scarcity_real}}` | leva onesta, non finta | "Accetto N <buyer> per il lancio di <mese>, li seguo io" |
| `{{ask}}` | il micro-si' che produce il pagamento | acconto via link / demo 2 min |

## Template

> Ciao {{nome_buyer}}, sono {{founder}}. {{observation}}.
> Ho costruito una cosa che {{job_core}}. {{anti_positioning}}.
> {{scarcity_real}}. {{ask}}?

## Regole d'uso
- **Max 2 varianti** (`v1`,`v2`) per A/B grezzo; ogni invio logga `msg_variant` in `outreach_log.jsonl`.
- Personalizza `{{observation}}` per contatto: un dettaglio reale dal loro profilo/post. Generico = ignorato.
- L'`{{ask}}` deve puntare a un **fatto terminale** (link di pagamento), non a un proxy ("ti va una call?" e' un proxy se non porta al pagamento).
