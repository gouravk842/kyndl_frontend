# 24 Reasons — Implementation Plan

> A living Girlfriend Day keepsake: **24 short reasons** that unlock across the
> day — not a dump of text, a drip of feeling. Mix of text, photo, and voice.
> Builds on Time Capsule clocks + Memory Jar item/media patterns. **Not** an
> unlocks-module host and **not** a Moment that responds.

Slug: `twenty-four-reasons` · Display: **24 Reasons** · Shelf: **Keepsakes**  
Pattern: timed keepsake (client clock, like Time Capsule)

---

## 0. Decisions locked in

| Decision                       | Choice                                                                                                           | Why                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| New type vs fork Jar / Capsule | **New slug** `twenty-four-reasons`                                                                               | Own catalog row, schedule UX, GF Day packaging                 |
| Shelf                          | **Keepsakes**                                                                                                    | She returns all day; not a one-shot Moment ask                 |
| Count                          | **Exactly 24** in v1 (soft max; allow 1–24 in builder, pack fills 24)                                            | Product name is the promise; shorter drafts OK before publish  |
| Schedule model                 | **Anchor + interval → stored `unlockAt` per reason**                                                             | Builder-simple; content self-describing like capsule           |
| Default interval               | **1 hour** from `anchorAt`                                                                                       | Classic “24 hours of reasons”; owner can edit individual times |
| Unlock enforcement (v1)        | **Client presentation only**                                                                                     | Matches Time Capsule / Countdown honesty; ship for Aug 1       |
| Anti-peek (v1)                 | Document as keepsake surprise, not vault                                                                         | Server `public_redact` deferred to Phase E if needed           |
| Catch-up                       | **All past-due unlock at once** when she opens                                                                   | Missed hours aren’t lost; no “one per visit” friction          |
| Order                          | Reasons unlock by `unlockAt`, not forced sequential gates                                                        | Time is the gate; Constellation `requires` not needed          |
| Media                          | Per reason: `message` + optional `image: {fileId}` + optional `audio: {fileId}`                                  | Jar pattern + files audio policy — never raw URLs              |
| Response                       | **`accepts_response: false`**                                                                                    | Pure gift; no answer-back in v1                                |
| Girlfriend Day                 | `occasion` + default anchor Aug 1 local midnight + starter pack                                                  | Seasonal packaging, reusable year-round                        |
| Payment                        | `product_code: "twenty-four-reasons"` · **free for launch**                                                      | Flip in admin later                                            |
| Feature folder                 | `features/twenty-four-reasons/`                                                                                  | Valid JS/Python module names (not `24-reasons/`)               |
| Code reuse                     | Copy Capsule clock helpers + Jar media/fileId patterns; **don’t** wire Memory City unlocks registry as the shell | Unlocks = mini-games for hosts; this _is_ the experience       |

---

## 1. Product concept

**Pitch:** Twenty-four reasons I love you — one for each hour of her day.
She opens the link and finds a **gallery of sealed notes**. As the clock turns,
seals break. By midnight, the full set is hers to keep.

**Girlfriend Day hook:** Anchor at Aug 1 00:00 (her local, set in builder).
All day = a living gift, not a single card.

**Core loop**

```
Owner writes / packs 24 reasons (+ optional photo/voice)
  → sets anchor day + interval (or fine-tunes each unlockAt)
  → publish → /v/<token>
Recipient sees sealed grid + “next unlock” countdown
  → past unlockAt → open note (text / photo / voice)
  → end of day → complete keepsake (all 24 open)
```

---

## 2. Content schema (v1)

### Creation.content

| Field           | Type                           | Notes                                                   |
| --------------- | ------------------------------ | ------------------------------------------------------- |
| `recipientName` | string                         | Her name                                                |
| `ownerName`     | string                         | His name (shown on seals / finale)                      |
| `title`         | string                         | Default: `"24 Reasons"`                                 |
| `intro`         | string                         | Shown above the sealed gallery                          |
| `occasion`      | `"none"` \| `"girlfriend-day"` | Seasonal skin                                           |
| `anchorAt`      | ISO string                     | Schedule start (builder primary control)                |
| `intervalHours` | number                         | Default `1`; used to _derive_ times; stored for re-edit |
| `timezoneLabel` | string                         | Display-only hint e.g. `"IST"` — not used for math      |
| `reasons[]`     | Reason                         | Ordered list; each carries its own `unlockAt`           |

### Reason

| Field      | Type         | Notes                                                           |
| ---------- | ------------ | --------------------------------------------------------------- |
| `id`       | string       | Client-minted (`r1`…)                                           |
| `n`        | number       | 1–24 display index (stable for UI “Reason 07”)                  |
| `label`    | string       | Short eyebrow optional (“Morning”, “Why I stay”) — may be empty |
| `message`  | string       | The reason body (required for publish if no media)              |
| `image?`   | `{ fileId }` | Optional photo                                                  |
| `audio?`   | `{ fileId }` | Optional voice note                                             |
| `unlockAt` | ISO string   | **Source of truth** for lock state                              |
| `teaser?`  | string       | Optional locked-state hint (“Opens at 3pm”)                     |

### Validation rules (backend serializer)

- `1 ≤ len(reasons) ≤ 24`
- Each `unlockAt` must be a parseable ISO datetime string (same style as Time Capsule)
- `message` max length ~800; `label` ~80; `teaser` ~120
- At least one of `message` | `image` | `audio` per reason
- `max_media: 48` (up to 24 images + 24 audio)
- `intervalHours` in `{0.5, 1, 2, 3, 4, 6, 8, 12, 24}` or free positive number capped

### Derived schedule (builder helper, not a second source of truth)

```
reasons[i].unlockAt = anchorAt + i * intervalHours
```

Owner may override individual `unlockAt` after derive. Re-running “Apply schedule”
overwrites all times from current `anchorAt` + `intervalHours`.

### Public read (v1)

Full content ships (including future messages) — **UI locks** sealed reasons.
Document in backend module docstring exactly like Time Capsule.

### Public read (Phase E — optional)

`public_redact`: for each reason with `unlockAt > server_now`, strip `message`,
`image`, `audio`; keep `id`, `n`, `label`, `unlockAt`, `teaser`. Do not resolve
stripped fileIds into `assets` URLs.

---

## 3. UX flows

### Builder (owner)

1. **Meta** — names, title, intro, Girlfriend Day toggle
2. **Schedule** — date/time picker for `anchorAt`, interval chips (1h default), timezone label, “Apply schedule”
3. **Timeline preview** — vertical list of 24 slots with unlock clock times
4. **Edit reason** — message, optional photo upload, optional voice upload, optional teaser; override unlock time
5. **Starter pack** — 24 GF Day / Us prompts (text only; owner personalizes)
6. **Live preview** — recipient gallery with simulated “now” scrubber (dev/preview: slide time forward)
7. Save → Publish → share `/v/<token>`

Publish soft-check: warn if `< 12` reasons (“A shorter day still works”) but allow; warn if any reason empty.

### Recipient viewer (`/v/<token>` + marketing demo)

1. **Hero** — title, from `ownerName`, intro, Girlfriend Day seal if set
2. **Next unlock** — prominent countdown to the soonest still-locked reason
3. **Gallery** — 24 tiles in a soft grid (4×6 / responsive):
   - **Locked** — wax/seal motif, reason number, unlock time, teaser
   - **Open** — tap to expand letter / photo / play voice
4. **Catch-up** — all due reasons show as open (gentle “new” sparkle on ones that unlocked since last visit — localStorage)
5. **Finale** — when all 24 open: short closing line + optional “keep forever” archive view (same page, all open)

### Preview scrubber (builder only)

`?previewNow=` or in-panel slider overrides `Date.now()` so owners can demo noon / evening without waiting.

---

## 4. Visual direction

| Do                                                       | Don’t                                                  |
| -------------------------------------------------------- | ------------------------------------------------------ |
| Sealed notes / wax seals / soft envelope or letter stack | Red Zone / flame / AgeGate                             |
| Ivory · gold · deep Kyndl red accents                    | Purple SaaS gradients; flat single cream with no motif |
| Hand / cursive for “Reason 07”, display for title        | Generic Inter-looking UI                               |
| Motion: seal crack, letter unfold, countdown breathe     | Busy particle spam                                     |
| Grid of 24 as the hero visual                            | Dashboard of stats / progress bars as the first read   |

Motif name: **“Hourglass letters”** — each tile a small sealed note; open = unfolded letter.

---

## 5. System architecture

```
Backend                                 Frontend
────────                                ────────
experiences/types/twenty_four_reasons.py
  ContentSerializer                     features/twenty-four-reasons/
  (optional later: public_redact)         config.ts
  register(ExperienceType)                lib/schedule.ts   (derive unlockAt)
                                          lib/unlock.ts     (isOpen, nextUnlock, remaining)
                                          lib/time.ts       (or reuse countdown/lib/time)
                                          store/builder.store.ts
                                          components/builder/*
                                          components/reasons-experience.tsx
                                          components/reason-tile.tsx
                                          components/reason-letter.tsx
payment.Product code=twenty-four-reasons  hooks/use-twenty-four-reasons-sync.ts

No new HTTP endpoints in v1.
Media via existing files API → fileId in content → assets map on read.
```

**Clock:** `Date.now()` vs `Date.parse(unlockAt)` — same contract as
`features/countdown/lib/time.ts` / Time Capsule. Prefer extracting a tiny shared
`lib/remaining.ts` only if copy-paste hurts; otherwise local `lib/unlock.ts`.

---

## 6. Registration checklist

### Backend

1. `experiences/types/twenty_four_reasons.py` + `register`
2. Import in `experiences/types/__init__.py`
3. Payment migration seed Product `twenty-four-reasons` (free, live, visible)
4. Tests: schema bounds, ISO unlockAt, media shape, default content

### Frontend

5. `features/twenty-four-reasons/**`
6. `hooks/use-twenty-four-reasons-sync.ts`
7. `lib/experiences.ts` — not adult; status `live` or `soon`
8. `constants/experience-taxonomy.ts` → `"keepsake"`
9. `lib/creations.ts` → `BUILDABLE_TYPES`
10. `constants/routes.ts` + `PUBLIC_ROUTES`
11. `app/(marketing)/twenty-four-reasons/{page,build}/page.tsx`
12. `features/public-viewer/registry.tsx`
13. `features/dashboard/lib/builder-registry.tsx`
14. `npm run catalog:manifest`

### Explicit non-goals (v1)

- No partner respond / mirror / match
- No server redact (unless Phase E pulled forward)
- No Constellation-style `requires` chain
- No Memory City unlocks module hosting
- No push notifications per hourly unlock (email on publish invite only)

---

## 7. Build order (roadmap)

### Phase A — Contract (0.5–1 day)

- [x] Backend type + register + schema tests
- [x] Frontend `config.ts` + `lib/schedule.ts` + `lib/unlock.ts`
- [x] Parity fixtures: given `anchorAt` + interval → expected `unlockAt`s; given `now` → open/locked sets

### Phase B — Builder + sync (1.5–2 days)

- [x] Zustand store (meta, schedule apply, CRUD reasons, media ids)
- [x] Builder panel: schedule + timeline + reason editor (photo/voice upload via files service)
- [x] Starter pack (24 lines)
- [x] `use-twenty-four-reasons-sync` + dashboard registry + BUILDABLE_TYPES
- [x] Preview time scrubber

### Phase C — Recipient experience (1.5–2 days)

- [x] Sealed gallery + next-unlock countdown
- [x] Open letter / photo / voice player
- [x] Catch-up + “newly opened” sparkle (localStorage)
- [x] Finale when 24/24 open
- [x] Public viewer + marketing live page

### Phase D — Catalog + Girlfriend Day (0.5–1 day)

- [x] `lib/experiences.ts` + taxonomy + routes + manifest
- [x] Product seed migration
- [x] Occasion seal + Aug 1 default pack/anchor helper
- [ ] Optional homepage / experiences shelf highlight

### Phase E — Hardening / secrecy (stretch)

- [ ] Server `public_redact` for future-locked bodies + skip asset resolve
- [ ] Timezone UX polish (explicit zone picker)
- [ ] Notify owner when she opens first reason? (optional analytics event only)
- [ ] Edge cases: DST, empty reasons, all unlockAts in the past on publish

**Aug 1 target:** A–D done ~Jul 29–30; E only if secrecy becomes a hard requirement.

---

## 8. Sample starter pack (Girlfriend Day — draft)

Short lines owner can edit; `n` = 1…24, schedule applied from midnight.

1. You make ordinary mornings feel like a beginning
2. I love how you laugh at your own jokes
3. Home is whichever room you’re in
4. You notice the things I forget to say
5. We’re a team — even in the silly fights
6. Your voice on a bad day still steadies me
7. I’d choose this story again
8. You make me braver than I feel
9. The little routines with you are my favorites
10. Proud doesn’t cover it — I’m lucky
11. You remember the details that matter
12. Soft nights. Loud love. That’s us.
13. Thank you for staying when it’s hard
14. Your weird and my weird fit
15. Future-me already knows: it’s you
16. You turn errands into something I look forward to
17. I fall for you in quiet ways, all day
18. Safe is a person — it’s you
19. Still my favorite notification
20. You make generosity look easy
21. I’d rewrite the dull days just to keep you in them
22. Loving you is the least complicated true thing I know
23. Today is for you — loudly
24. Reason 24: always you. Happy Girlfriend Day.

---

## 9. Copy bank (defaults)

| Surface       | Copy                                                            |
| ------------- | --------------------------------------------------------------- |
| Title         | 24 Reasons                                                      |
| Intro         | One reason for every hour of your day. Sealed until their time. |
| Locked tile   | Opens at {time}                                                 |
| Next unlock   | Next reason unlocks in                                          |
| Open CTA      | Open reason {n}                                                 |
| Catch-up      | {k} new reasons unlocked while you were away                    |
| Finale        | All 24 — yours to keep                                          |
| GF Day seal   | Girlfriend Day · Aug 1 · all day long                           |
| Empty builder | Load the starter pack to begin your day of reasons              |
| Publish warn  | Fewer than 12 reasons — still publish?                          |

---

## 10. Open questions (resolve before Phase D)

1. **Strict secrecy** — is client-only lock OK for launch, or must Phase E redact ship with v1?
2. **Timezone** — builder stores owner-local ISO (Capsule style) vs force “her city” picker?
3. **Fewer than 24** — allow publish of partial sets, or require exactly 24? _(Plan default: allow 1–24.)_
4. **Voice-first reasons** — allow audio-only with empty message? _(Plan default: yes.)_
5. **Homepage banner** — shared Girlfriend Day strip with Mirror Match, or separate?

---

## 11. Success criteria

- Reason _N_ is UI-locked while `now < unlockAt`, open otherwise
- Catch-up opens all due reasons in one visit
- Media only via `fileId` → files API; never embedded bytes/URLs in content
- Builder can derive and re-apply a full-day schedule in one action
- End-to-end: build → publish → `/v/token` → unlock progression
- No Red Zone / adult flags; sits on Keepsakes shelf
- Girlfriend Day occasion is packaging, not a second type

---

## Quick agent playbook

| Task                 | Start                                                      |
| -------------------- | ---------------------------------------------------------- |
| Schema / register    | `experiences/types/twenty_four_reasons.py`                 |
| Schedule math        | `features/twenty-four-reasons/lib/schedule.ts`             |
| Lock state           | `features/twenty-four-reasons/lib/unlock.ts`               |
| Clock UX reference   | `features/countdown/lib/time.ts`, `features/time-capsule/` |
| Media item reference | `features/memory-jar/config.ts`                            |
| Wiring checklist     | Mirror Match §6 / this §6                                  |
