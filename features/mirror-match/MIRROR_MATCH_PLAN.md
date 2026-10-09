# Mirror Match — Implementation Plan

> A wholesome two-sided Moment for **Girlfriend Day (Aug 1)** and beyond.
> Same privacy contract as Desire Matcher (private answers → mutual reveal only),
> **zero** Red Zone inheritance (`adult`, AgeGate, heat, Desire Deck chrome).

Slug: `mirror-match` · Shelf: **Big moments** · Pattern: structured Moment (matcher)

---

## 0. Decisions locked in

| Decision                        | Choice                                               | Why                                                                                                |
| ------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| New type vs fork Desire Matcher | **New slug** `mirror-match`                          | Catalog, pricing, Red Zone isolation, seasonal campaign                                            |
| Answer model                    | Keep **yes / maybe / no**                            | Proven privacy math; soft labels in UI (“That’s us” / “Kinda” / “Not really”)                      |
| Item model                      | **Prompts** with `mood` (not `heat`)                 | `sweet` \| `funny` \| `deep` \| `us` — wholesome tone only                                         |
| Reveal rule                     | Identical to Desire Matcher                          | Both `yes` → matches; neither `no` but not double-yes → soft matches; either `no` → hidden forever |
| Base pattern                    | **Matcher Moment**, not `moment_common`              | Need structured `payload` + `build_reveal`, not single yes/no ask                                  |
| Red Zone                        | **None** — `adult: false`, no AgeGate                | Main catalog + Girlfriend Day campaign                                                             |
| Girlfriend Day                  | Seasonal **seal + prompt pack**, not a separate type | Reusable year-round; Aug 1 is packaging                                                            |
| Payment                         | Own `product_code: "mirror-match"`                   | Independent free/paid control in admin                                                             |
| Code reuse                      | **Copy-adapt**, don’t import Desire Matcher UI       | Avoid accidental heat/AgeGate coupling; share only the _pattern_                                   |

---

## 1. Product concept

**Pitch:** You both answer the same soft questions about _us_ — privately.
Kyndl shows only what you **both** feel. No scorekeeping, no one-sided leaks.

**Girlfriend Day hook:** “Do we see us the same way?” — then a shareable
**mirror card** of mutual matches (optional certificate-style finale).

**Core loop**

```
Him (owner) curates prompts + answers privately
        → publish → /v/<token>
Her answers the same prompts (ownerAnswers redacted)
        → respond → reveal { matches, softMatches, total }
Him opens /mirror-match/results?id=… → same reveal recomputed
```

---

## 2. Content schema (v1)

### Creation.content

| Field           | Type                                   | Notes                                                        |
| --------------- | -------------------------------------- | ------------------------------------------------------------ |
| `recipientName` | string                                 | Her name                                                     |
| `ownerName`     | string                                 | His name (shown to her)                                      |
| `title`         | string                                 | Default: `"Do we see us the same way?"`                      |
| `intro`         | string                                 | Privacy copy (answers stay private; only overlaps show)      |
| `occasion`      | `"none"` \| `"girlfriend-day"` \| …    | Optional seasonal skin; default `none`                       |
| `items[]`       | `{ id, mood, label }`                  | Client-minted ids (`m1`, …); `mood ∈ sweet\|funny\|deep\|us` |
| `ownerAnswers`  | `Record<itemId, "yes"\|"maybe"\|"no">` | **Private**; stripped on public read                         |

### Response.payload

```json
{ "answers": { "<itemId>": "yes|maybe|no" }, "responderName": "" }
```

### Reveal (returned to responder + recomputed for owner)

```json
{
  "matches": [{ "id", "label", "mood" }],
  "softMatches": [{ "id", "label", "mood" }],
  "total": 12
}
```

Naming: use `softMatches` in Mirror Match (Desire Matcher uses `maybes`) so
copy/UI stay wholesome. Backend field name can be `softMatches`; if we want
max API reuse later, alias is fine — **prefer clear product naming in v1**.

### Reveal math (must match client + server)

```
missing answer → treat as "no"
either side "no" → omit (never leak one-sided)
both "yes" → matches
else (neither no) → softMatches
```

---

## 3. UX flows

### Builder (owner)

1. Names + title + intro (+ optional Girlfriend Day occasion toggle)
2. Prompt list: starter pack / add / edit / reorder / remove
3. Per-prompt private answer (3 soft buttons)
4. Live preview of partner flow (**no** age gate)
5. Save → Publish → copy share link
6. Results link: `/mirror-match/results?id=<creationId>`

**Starter packs (seed in `config.ts`)**

- **Us** — everyday couple truths (“We laugh at the same dumb things”)
- **Girlfriend Day** — Aug 1 flavored (“I’d choose you again”, “You make ordinary days feel special”)
- Mix of moods; ~10–14 defaults; owner can prune

### Partner viewer (`/v/<token>` or live demo)

1. Intro (names + privacy promise) — soft, ivory/gold Kyndl brand
2. Card-by-card prompts (tap answers; optional light swipe)
3. Submit → celebration → **Mirror reveal**
4. Finale: mutual matches as a mirror / polaroid stack; softMatches as “almost us”
5. Empty state if zero overlaps: gentle copy, not failure (“More to discover together”)

### Owner results

- Waiting state until a response exists
- Same reveal UI as partner
- Notification uses count-only summary (never labels)

---

## 4. Visual direction

| Do                                                 | Don’t                                |
| -------------------------------------------------- | ------------------------------------ |
| Ivory / cream / gold / soft rose (`lib/brand.ts`)  | Red Zone crimson, flames, heat chips |
| Syne headlines, hand-script accents on reveal      | Desire Deck typography               |
| Mirror / reflection motif on reveal                | AgeGate / 18+ consent chrome         |
| Mood chips: soft icons (heart, smile, moon, spark) | Fire / spice meters                  |

`occasion: "girlfriend-day"` → seal stamp + Aug 1 microcopy only (no separate renderer).

---

## 5. System architecture

```
Backend                          Frontend
────────                         ────────
experiences/types/mirror_match.py
  ContentSerializer              features/mirror-match/
  AnswerSerializer                 config.ts (types, packs, mood meta)
  build_reveal / redact            lib/reveal.ts  ↔ mirrors backend
  summarize_response               store/builder.store.ts
  register(ExperienceType)         components/builder/*
                                   components/mirror-experience.tsx
payment.Product code=mirror-match  components/reveal-view.tsx
                                   components/results/owner-results.tsx
                                   hooks/use-mirror-match-sync.ts

Wiring: experiences.ts · taxonomy · BUILDABLE_TYPES · ROUTES
        public-viewer/registry · dashboard builder-registry
        catalog.manifest · marketing pages · types/creation.ts
        creation.service submit (reuse submitMatch or mirror-named alias)
```

**No new apps, endpoints, or models.** Uses existing Creation + respond +
`CreationResponse.payload` + notification path.

---

## 6. Registration checklist

### Backend

1. `experiences/types/mirror_match.py` — serializers + reveal/redact/summary + `register`
2. Import in `experiences/types/__init__.py`
3. Admin/`payment.Product` row `code=mirror-match` (price/free TBD)
4. Tests: `test_mirror_match.py` (schema + reveal), `test_mirror_match_respond.py` (HTTP)

### Frontend

5. `features/mirror-match/**` (feature module)
6. `hooks/use-mirror-match-sync.ts`
7. `lib/experiences.ts` entry — **`adult` false/omitted**, status `live` or `soon`
8. `constants/experience-taxonomy.ts` → shelf `"moment"`
9. `lib/creations.ts` → `BUILDABLE_TYPES`
10. `constants/routes.ts` → `/mirror-match`, `/build`, `/results`
11. `app/(marketing)/mirror-match/{page,build,results}/page.tsx`
12. `features/public-viewer/registry.tsx`
13. `features/dashboard/lib/builder-registry.tsx`
14. Types + service if needed (`MatcherAnswersPayload`-style or dedicated Mirror types)
15. `npm run catalog:manifest`

### Explicit non-goals (v1)

- No AgeGate / red-zone consent
- No heat / Desire Deck imports
- No collaboration contributor edits
- No chat/comments required (can enable later via Creation flags)
- No physical gift upsell required (optional later CTA on reveal)

---

## 7. Build order (roadmap)

### Phase A — Contract (0.5–1 day)

- [x] Backend type + register + unit tests for reveal/redact
- [x] Frontend `config.ts` + `lib/reveal.ts` + shared types
- [x] Confirm client/server reveal parity with identical fixtures

### Phase B — Builder + sync (1–1.5 days)

- [x] Zustand builder store + panel (meta, prompts, owner answers)
- [x] `use-mirror-match-sync` + dashboard registry + BUILDABLE_TYPES
- [x] Starter packs (Us + Girlfriend Day)

### Phase C — Partner experience + reveal (1.5–2 days)

- [x] `MirrorExperience` card flow + submit
- [x] `RevealView` (matches + softMatches + empty state)
- [x] Public viewer registry + marketing live page
- [x] Owner results page

### Phase D — Catalog + Girlfriend Day polish (0.5–1 day)

- [x] `lib/experiences.ts` + taxonomy + routes + catalog manifest
- [x] Product page copy for Aug 1
- [x] `occasion: girlfriend-day` seal + sample pack as default on that toggle
- [ ] Optional: landing banner / experiences shelf highlight (marketing only)

### Phase E — Hardening

- [ ] Respond integration tests
- [ ] Notification summary copy
- [ ] Mobile pass + empty/edge cases (0 items, all no, partial answers)
- [ ] Pricing decision in admin Product

**Target for Girlfriend Day:** Phases A–D done by ~Jul 28–29; E before Aug 1.

---

## 8. Sample prompts (Girlfriend Day pack — draft)

| Mood  | Label                                  |
| ----- | -------------------------------------- |
| us    | We feel like a team                    |
| sweet | Ordinary days feel special with you    |
| funny | We have jokes nobody else would get    |
| deep  | I’d choose you again                   |
| us    | Home is a person, not a place          |
| sweet | You notice the little things           |
| funny | Our weird habits somehow work          |
| deep  | I feel safe being myself with you      |
| us    | We make each other braver              |
| sweet | I’m proud to call you mine             |
| deep  | The future feels better with you in it |
| us    | Today is worth celebrating — us        |

Owner answers privately; she never sees his picks until the mirror opens.

---

## 9. Copy bank (defaults)

| Surface          | Copy                                                                            |
| ---------------- | ------------------------------------------------------------------------------- |
| Title            | Do we see us the same way?                                                      |
| Intro            | Answer honestly — your picks stay private. Kyndl only shows what you both feel. |
| Yes              | That’s us                                                                       |
| Maybe            | Kinda                                                                           |
| No               | Not really                                                                      |
| Reveal title     | Your mirror                                                                     |
| Matches subtitle | You both said yes                                                               |
| Soft subtitle    | Almost — worth talking about                                                    |
| Empty            | No perfect overlaps yet — that’s okay. You’ve got more to discover.             |
| Notify           | You mirrored on {n} and have {m} almosts — open results to see.                 |
| GF Day seal      | Opens for Girlfriend Day · Aug 1                                                |

---

## 10. Open questions (resolve before Phase D)

1. **Price** — free for Girlfriend Day launch, or paid like other Moments?
2. **Single response vs many** — Desire Matcher stores responses; confirm product rule (latest wins for results vs list all). Follow existing matcher behavior unless product wants otherwise.
3. **Certificate export** — shareable image of matches for Stories? Nice-to-have post-Aug-1, not blocking.
4. **Default occasion** — auto-set `girlfriend-day` when created between Jul 25–Aug 2, or explicit toggle only?

---

## 11. Success criteria

- Partner cannot read `ownerAnswers` on public GET
- Reveal never includes an item either side marked `no`
- No Red Zone routing, consent, or Desire Deck imports in the feature tree
- End-to-end: build → publish → `/v/token` → respond → owner results
- Girlfriend Day pack + seal feel seasonal without forking the type
