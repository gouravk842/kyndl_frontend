# Memory City — Unified Experience Implementation Plan

> **One experience to replace two.** `memory-lane` and `memory-city` collapse into a
> single, canonical **Memory City**: a believable, freely-roamable 3D city that
> **arranges and grows itself** as memories are added, rendered with real assets
> (not primitives). `memory-lane` is retired once the city absorbs its plumbing.

---

## 0. Decisions locked in

| Decision | Choice | Why |
|---|---|---|
| Which survives | **memory-city** is canonical; **memory-lane deleted** | City is a strict superset (a lane memory = a city node with a `message` reward, no gate) |
| Organizing principle | **Era / time** — districts are time periods, city grows outward chronologically | Most natural for memories; gives the city a walkable timeline spine |
| Positioning model | **Persist meaning, derive world.** No saved `[x,y,z]` | The only model that lets the city auto-arrange & grow |
| Rendering target | **"Believable place"** — real modular glTF assets + PBR + IBL + ambient life | Achievable on the web at city scale; see §3 for the honesty on "photoreal" |
| Platform | Stay **React Three Fiber / Next** | Shareable link, zero install — correct for a gift product |
| Nav modes | **Cinematic revolve** (default / mobile) + **free roam** (desktop) | Realism on phones without twitchy FPS controls |

---

## 1. The core architectural shift

Today `transform.position` is authored per node and saved to the backend. That is a
dead end for a growing city. The whole plan pivots on inverting it:

```
PERSIST (content, small)                 DERIVE at runtime (never saved)
─────────────────────────                ────────────────────────────────
memory {                                 layout(cityId, memories[]) → {
  id, date, people[], mood, tags[],        eras[], plots[], roads[],
  shell?, gate?, reward                     placedNodes[] { position, rotationY }
}                                         }
```

Two non-negotiable properties of the layout engine:

- **Deterministic** — every random call seeded off `cityId`. Same memories → identical
  city on every device, forever. No `Math.random()`, no wall-clock. (memory-lane's
  facade textures get this wrong — do not repeat it.)
- **Incrementally stable (append-only)** — adding memory _N+1_ must **not move**
  memories _1…N_. Growth extends the frontier; it never reshuffles the existing city.
  Design this in from line one; retrofitting it is painful.

---

## 2. System architecture

Nine subsystems. Build order is the roadmap in §4.

### A. Content & data model
- Promote `date` + `people[]` + `tags[]` to first-class node fields.
- Remove `transform.position` from persisted content (becomes engine output).
- Keep the existing `ModuleRef` gate/reward model — it's good. Add a **`photo` /
  `gallery` reward module** (the one thing lane can do that city can't yet).

### B. Layout engine (`lib/layout/`, pure, unit-tested, zero R3F)
1. **Bucket into eras by gaps, not calendar** — sort by date, cut a new era on a
   time gap > threshold or when an era exceeds max size. Dense years = dense districts.
2. **Place eras as expanding rings** — central plaza = entry hub; oldest era nearest
   center, **newest on the outer frontier** so growth is always visible at the edge.
3. **Pack plots** on a per-era block grid with seeded jitter (rotation/setback/height).
   Fill unused plots with **instanced non-interactive buildings** so a 5-memory era
   still reads as a populated neighborhood — yours are the ones that glow.
4. **Generate roads** — a ring road per era + radial spokes to the plaza.
5. **Version the engine** — pin a city to its engine version so an engine upgrade
   doesn't silently reshape a shared link.

### C. Asset system — the realism enabler (`lib/assets/`)
- Modular **glTF/GLB kit**: facade modules, roofs, props, roads, curbs, lamps, trees,
  benches, cars, people. The layout engine assembles blocks from this kit.
- **PBR materials** (albedo / normal / roughness / metallic / AO).
- Web delivery: **Draco** (geometry) + **KTX2/Basis** (GPU textures) + texture
  **atlasing** to cut draw calls. Preload + suspense.
- **This is the single biggest lever for "realistic" — and it's art, not code.** See §3.

### D. Rendering & lighting (`components/scene/`)
- PBR everywhere; **HDRI image-based lighting** for real ambient + reflections.
- One key **sun** with cascaded/large shadow frustum; **bake** static lightmaps/AO
  where possible; cap real-time point lights hard (bake the rest as emissive).
- **Time-of-day** (dusk hero look; optional day/night).
- Restrained post: keep N8AO + ACES tone mapping + subtle bloom + grade + vignette;
  drop heavy DoF on mobile.

### E. Streaming, chunking & LOD (`lib/world/`)
- A growing city is unbounded geometry — **InstancedMesh / merged geometry** per asset.
- **LOD**: full mesh near → impostor billboard far (drei `<Detailed>`).
- **Chunking**: tile the city; load/unload chunks around the player.
- `three-mesh-bvh` for cheap raycasts; `<AdaptiveDpr>` + `<PerformanceMonitor>` for
  automatic quality scaling. **Budget: 60fps desktop / 30fps mid phone at 100+ buildings.**

### F. Navigation & controls
- Keep **RevolveCamera** (on-rails cinematic) as the default and the mobile experience —
  looks great, no input friction, GPU headroom for fidelity.
- Keep **RoamPlayer** (Rapier capsule) for desktop free-roam; add real collision with
  the kit's building colliders.
- Add **touch controls** for roam on capable phones (drag-look already exists).

### G. Gamification layer
- **Discovery**: memory buildings glow/pulse (locked = holographic); the rest of the
  city is real but inert.
- **Collection & progression**: `solved` / `recalled` already exist — surface a
  "12 of 20 remembered" meter, district-complete moments, `requires`-gated reveals.
- **Growth loop** (the core hook): add a memory → the city visibly grows (§I). That
  reward-for-remembering loop is what makes people keep coming back.

### H. Authoring & persistence (port from lane, re-shaped)
- **Backend**: new `memory_city.py` experience type (nodes + modules + theme; no saved
  positions). Register in catalog/taxonomy.
- **Sync**: reuse `useCreationSync` (lane's `use-memory-lane-sync` pattern) → new
  `use-memory-city-sync`.
- **Builder**: **meaning-first, not coordinate-first.** Author enters date / people /
  mood / message / gate; the city auto-arranges. Throw away lane's drag-the-map builder
  — that's exactly the model we're leaving. A **live 2D preview** (§Phase 1) shows the
  arrangement; "Walk the city" mounts the real 3D.

### I. Growth choreography
- Layout is a pure function → **diff old vs new layout** = exactly what changed.
- Animate the diff: plot lights up → building rises from the ground → road extends →
  camera can fly there. This 3-second moment is the shareable payoff.

---

## 3. Honesty on "realistic" (read this before setting expectations)

**True photoreal (Unreal / Nanite) is not a browser walking-sim that grows unbounded and
runs on phones.** Chasing it will burn months and still stutter on a mid-range Android.

The achievable, **sellable** target is **stylized-realistic / believable place**: real
modeled & textured assets, PBR, real lighting, and — critically — **ambient life**
(traffic, pedestrians, birds, window lights, moving sky). A static "realistic" city reads
as dead; a stylized city that's *alive* reads as real. Optimize for *aliveness + material
honesty*, not polygon count.

**The realism bottleneck is assets, not code.** You need a modular city kit. Options:
- **License** a kit (Synty = stylized-realistic & cheap; KitBash3D = photoreal but heavy;
  Quaternius = free/low-poly). Fastest path.
- **Commission** a small bespoke kit matched to the dream-tech dusk theme. Best identity.
- **Hybrid** — license a base kit, reskin materials + add hero memory buildings.

Decide this early; it gates Phase 2 and it's a budget/timeline dependency, not a sprint task.

---

## 4. Phased roadmap

| Phase | Goal | Exit criteria |
|---|---|---|
| **0. Foundations** | Merge prep, asset decision, data model | Data model migrated; kit chosen; lane audited for saved data |
| **1. Layout engine** | Pure engine + 2D debug view | "Add memory" grows the city in 2D; existing buildings stay put |
| **2. Realistic block** | Asset pipeline + one beautiful block in 3D | One era renders from the kit at target fps, PBR + IBL |
| **3. Full city + scale** | Assemble whole city, streaming + LOD | 100+ buildings at 60/30 fps; chunks load around player |
| **4. Author + merge** | Backend type, sync, meaning-first builder; delete lane | Users author & save a city; lane removed; links migrated |
| **5. Life + growth** | Ambient life + growth choreography + gamification | Traffic/crowds; add-memory growth animation; progression HUD |
| **6. Mobile + a11y** | Quality tiers, touch, reduced-motion, fallback | Runs on mid phone; cinematic mobile mode; 2D gallery fallback |

### Phase detail

**Phase 0 — Foundations (small, do first)**
- New content model (§A); write the `Memory → node` migration mapping (seed-city already
  encodes it).
- **Answer: is `memory-lane` live with real user creations?** → decides migrate vs swap
  and whether to keep the `memory-lane` slug on the new renderer for old share links.
- Choose the asset kit (§3).

**Phase 1 — Layout engine + 2D debug (the vertical slice)**
- `lib/layout/` as a tested pure function: bucketing → rings → plots → roads.
- A **top-down 2D canvas** drawing eras/plots/roads/buildings, with an "add memory" button.
- **Prove growth feels right and existing buildings don't move — in 2D, in ~a day.** If it
  doesn't feel right here, you've spent a day, not a month. Wiring into 3D is mechanical after.

**Phase 2 — Realistic asset pipeline + one block**
- glTF loader + Draco + KTX2; instanced kit rendering; PBR + HDRI; one era block that
  looks genuinely good and hits fps. This de-risks the whole realism bet on a small surface.

**Phase 3 — Full city assembly + streaming/LOD**
- Feed the layout engine's output into the kit assembler; add chunking, LOD, instancing,
  culling, adaptive dpr. Roam + revolve over the full city.

**Phase 4 — Authoring, persistence, and the merge/delete**
- `memory_city.py` + sync + meaning-first builder + catalog wiring.
- Migrate (or repoint) lane data; **delete `features/memory-lane/`, `memory_lane.py`,
  `use-memory-lane-sync.ts`, the build route, and lane registry entries.** One experience.

**Phase 5 — Ambient life + growth choreography + gamification**
- Instanced traffic on road splines, impostor crowds, birds, window lights, moving sky.
- Layout-diff growth animation. Progression HUD, collection meter, district-complete beats.

**Phase 6 — Mobile, performance tiers, accessibility**
- Device-tiered quality; touch roam; `prefers-reduced-motion`; a **flat 2D gallery
  fallback** for low-end/motion-sensitive recipients so no one gets a frozen screen.

---

## 5. Tech stack additions
- `@react-three/drei` — `<Instances>`, `<Merged>`, `<Detailed>` (LOD), `<Environment>`,
  `<AdaptiveDpr>`, `<PerformanceMonitor>`.
- `three-mesh-bvh` — fast raycasting for interaction/collision at scale.
- glTF toolchain — **Draco** + **KTX2/Basis** loaders; `gltf-transform` for
  compression/atlasing in the asset build step.
- Keep `@react-three/rapier` (roam physics) and `@react-three/postprocessing`.
- A **seeded PRNG** util (e.g. mulberry32) — determinism everywhere.

## 6. Risks & mitigations
| Risk | Mitigation |
|---|---|
| "Realistic" scope-creeps into photoreal | Lock the "believable place" target (§3); optimize aliveness not polys |
| Asset cost/timeline underestimated | Decide kit in Phase 0; treat as a budget dependency, not a task |
| Perf collapse at city scale | Instancing + LOD + chunking designed in from Phase 3, not bolted on |
| Layout reshuffles on add | Append-only placement, enforced with a test in Phase 1 |
| Mobile recipients get a dead experience | Cinematic mobile mode + 2D fallback (Phase 6) |
| Breaking existing share links | Version the layout engine; keep lane slug if data exists |

## 7. Open decisions for you
1. **Is `memory-lane` launched with real saved creations?** (migrate + keep slug, or swap)
2. **Asset kit: license, commission, or hybrid?** (gates Phase 2, has a budget)
3. **How real is "realistic" for you** — stylized-believable (recommended) vs pushing toward photoreal (much costlier)?

---

**Recommended next action:** build **Phase 1** — the pure layout engine + 2D debug view —
so you can watch your city arrange and grow before investing a rupee in 3D art.
