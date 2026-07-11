# Scrapbook assets

Drop real files into `public/scrapbook/` using these exact names. Until a file
exists, the matching element renders a clearly-marked placeholder slot (dashed
frame + label) — nothing breaks, and it's obvious where each asset goes.

Edit `features/scrapbook/data/story.ts` to change paths, captions, or copy.

## Images

| File                            | Used on           | Notes                                     |
| ------------------------------- | ----------------- | ----------------------------------------- |
| `cover.jpg`                     | Front cover       | Portrait-ish; sits behind the title.      |
| `how-we-met.jpg`                | How We Met        | Polaroid (square-ish framing reads best). |
| `first-date.jpg`                | First Date        | Single photo.                             |
| `memory-1.jpg` / `memory-2.jpg` | Favorite Memories | Overlapping collage pair.                 |
| `trip.jpg`                      | Trips Together    | Polaroid.                                 |
| `funny.jpg`                     | Funny Moments     | Single photo.                             |
| `funny-secret.jpg`              | Funny Moments     | Revealed under the scratch card.          |
| `future-poster.jpg`             | Future Dreams     | Poster frame for the video.               |

## Audio

| File             | Used on          | Notes                        |
| ---------------- | ---------------- | ---------------------------- |
| `voice-note.mp3` | Special Messages | Plays from the cassette.     |
| `our-song.mp3`   | Special Messages | Plays from the vinyl record. |

## Video

| File         | Used on       | Notes                              |
| ------------ | ------------- | ---------------------------------- |
| `future.mp4` | Future Dreams | Plays inside the vintage TV frame. |

Recommended: keep images ≤ 1600px on the long edge and use `.jpg`/`.webp`;
audio as `.mp3`; video as `.mp4` (H.264) for broad browser support.
