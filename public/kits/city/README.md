# Memory City — CC0 asset kit

The city renders realistic buildings/props by assembling a **modular CC0 kit**.
Drop the `.glb`/`.gltf` files here and the layout engine places them.

## Recommended kit (best fit for the modular assembler)

**Kenney — City Kit** (CC0, public domain, no attribution required):

- City Kit (Commercial): https://kenney.nl/assets/city-kit-commercial
- City Kit (Suburban): https://kenney.nl/assets/city-kit-suburban
- City Kit (Roads): https://kenney.nl/assets/city-kit-roads

Why this kit: tiles are grid-aligned, uniformly scaled, and share one texture
atlas — ideal for instancing and snapping together, and it ships GLB directly.

### How to add it
1. Download the kit(s) above (the "Download" button → a `.zip`).
2. Unzip and copy the **GLB models** into this folder, keeping their filenames.
   (Kenney kits put models under `Models/GLB/*.glb`.)
3. Tell me it's done — I'll bind the real mesh names to the engine's slots
   (building sizes, roads, props) and flip the kit on.

## Slots the assembler will fill
Once the files are here I map them to these roles (a few `.glb`s per role is
plenty — the engine picks deterministically):

| Role            | Used for                                  |
|-----------------|-------------------------------------------|
| `building-small`| filler skyline, low blocks                |
| `building-tall` | filler skyline, downtown density          |
| `building-hero` | the memory buildings themselves (glowing) |
| `road-straight` | the spiral avenue segments                |
| `road-corner`   | avenue bends                              |
| `prop-tree`     | plaza + street greening                   |
| `prop-lamp`     | street lighting                           |
| `vehicle-car`   | instanced ambient traffic                 |
| `person`        | instanced ambient crowds                  |

Anything missing falls back to the current procedural geometry, so the city
never breaks — it just gets more real as you add assets.

## Alternatives (also CC0, if you prefer)
- **KayKit** (Kay Lousberg) — City Builder / stylized packs.
- **Quaternius** — Modular buildings, cars, "Ultimate Modular" crowds.
- **Poly Pizza** — per-model CC0 downloads.

Licensing: all of the above are CC0, so bundling in this repo is fine.
