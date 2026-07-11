# String Frame — "Nature Unfolding" image assets

Drop the exported renders here with these EXACT filenames. Transparent PNG where
noted; the app composites them and overlays the dynamic name + the recipient's
photos, so leave those OUT of the art where possible.

| filename           | required | format            | what it is                                                                 |
| ------------------ | -------- | ----------------- | -------------------------------------------------------------------------- |
| `background.jpg`   | ✅       | JPG, ~1600×760    | The out-of-focus forest scene ONLY — no box, no frame on it.               |
| `box-closed.png`   | ✅       | PNG, transparent  | The stone/wood gift box on its river-stone pedestal, closed, seal showing. |
| `box-open.png`     | ✅       | PNG, transparent  | The same box, lid open (glow optional).                                    |
| `frame.png`        | ✅       | PNG, transparent  | The driftwood branch + leaf cluster + empty hanging leaf photo-slots.      |
|                    |          |                   | NO name text, NO photos baked in — those are overlaid by the app.          |
| `bird.png`         | optional | PNG, transparent  | The green ethereal bird / leaf-swirl that flies out on open.               |

Notes
- If you only have the fully-baked "Rodrick" composite (name + photos on it),
  drop it in as `frame.png` anyway and tell me — I'll switch to overlaying on
  top of the existing slots instead of empty ones.
- Photo-slot positions are tuned in `features/string-frame/nature-layout.ts`
  (percent coords over `frame.png`); I'll dial them to your exact art once it's
  here.
- Keep the box art on a transparent background so it can crossfade to open and
  blur away over the forest plate.
