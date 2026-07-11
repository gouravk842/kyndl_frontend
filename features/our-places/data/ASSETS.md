# Our Places — assets

Photos for each place live under `public/our-places/` and are referenced from
`features/our-places/config.ts` via the `photo` field, e.g. `photo:
"/our-places/first-date.jpg"`.

Photos are optional — a place with no `photo` gets a mood-coloured gradient
placeholder with its category icon, so the experience works fully without any
images.

## Guidelines

- One image per place, named after the place `id` (e.g. `first-date.jpg`,
  `first-trip.jpg`).
- Optimise to **under 200 KB** each (the card shows them ~360×220).
- Landscape / 16:10-ish crops look best in the card header.
- Loaded lazily (only when a card opens), so adding more places is cheap.

## Expected files (match the seed `config.ts`)

| Place id        | Suggested file                  |
| --------------- | ------------------------------- |
| `first-date`    | `/our-places/first-date.jpg`    |
| `first-trip`    | `/our-places/first-trip.jpg`    |
| `our-cafe`      | `/our-places/our-cafe.jpg`      |
| `the-hard-week` | `/our-places/the-hard-week.jpg` |
| `your-birthday` | `/our-places/your-birthday.jpg` |
| `someday`       | `/our-places/someday.jpg`       |

> The seed config ships with no `photo` fields set, so it renders with
> placeholders out of the box. Add a `photo` path per place once you have images.
