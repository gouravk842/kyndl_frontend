/**
 * Seed city — now **meaning-only**. Each memory carries a date, a mood, and its
 * words (plus the occasional gate/reward override); it carries **no coordinates**.
 * `buildCityConfig` runs the layout engine over the ordered list to derive the
 * entire world — positions, eras/districts, the camera path, roads, and the
 * filler skyline. Add a memory to this list and the city re-arranges and grows.
 *
 * This is the shape the builder and backend will store; the seed is just the
 * default document a fresh city starts from.
 */

import { buildCityConfig, type CityDoc } from "../lib/city-from-memories";
import type { CityConfig } from "../types";

export const SEED_DOC: CityDoc = {
  id: "seed",
  title: "Our City of Years",
  from: "Us",
  to: "You",
  memories: [
    {
      id: "first-light",
      date: "2019-04-06",
      title: "The morning we moved in",
      body: "Boxes everywhere, no curtains, coffee from a paper cup. We sat on the floor and called it home.",
      person: "Us",
      mood: "joyful",
      shellKind: "lantern",
    },
    {
      id: "rooftop",
      date: "2019-08-22",
      title: "Rooftop, late summer",
      body: "We stayed up there until the city went quiet. You said you wanted to remember it exactly like this.",
      person: "You & me",
      mood: "nostalgic",
      shellKind: "pavilion",
      gate: {
        type: "question",
        config: {
          prompt: "Where did we stay up until the city went quiet?",
          answers: ["rooftop", "the rooftop", "roof"],
          hint: "Look up.",
        },
      },
    },
    {
      id: "the-letter",
      date: "2020-02-14",
      title: "The letter I almost didn't send",
      body: "Three drafts in the bin. I'm glad the fourth one made it to your door.",
      mood: "bittersweet",
      shellKind: "vault",
      reward: {
        type: "mystery-box",
        config: {
          title: "The letter I almost didn't send",
          body: "Three drafts in the bin. I'm glad the fourth one made it to your door.",
          mood: "bittersweet",
          teaser: "Tap to open what I almost never sent",
        },
      },
    },
    {
      id: "summit",
      date: "2021-07-09",
      title: "Top of the ridge",
      body: "Six hours up, legs shaking, and then the whole valley opened beneath us. Worth every step.",
      person: "The whole crew",
      mood: "epic",
      shellKind: "tower",
      gate: {
        type: "question",
        config: {
          prompt: "How long was the climb to the top of the ridge?",
          answers: ["six hours", "6 hours"],
          choices: ["Two hours", "Six hours", "A full day"],
        },
      },
    },
    {
      id: "rain-window",
      date: "2021-11-30",
      title: "Rain on the kitchen window",
      body: "Nothing happened that day. That's exactly why I kept it.",
      mood: "quiet",
      shellKind: "lantern",
      gate: {
        type: "image-puzzle",
        config: { size: 3, prompt: "Piece the rainy window back together." },
      },
    },
    {
      id: "first-snow",
      date: "2022-12-18",
      title: "First snow, last train",
      body: "We ran for the 11:40 and missed it on purpose. The platform was ours and the snow kept falling.",
      person: "You & me",
      mood: "nostalgic",
      shellKind: "pavilion",
      gate: {
        type: "crossword",
        config: {
          size: 4,
          entries: [
            { answer: "SNOW", clue: "What kept falling on the platform", row: 0, col: 0, dir: "across" },
            { answer: "STAR", clue: "What you wish on, above the last train", row: 0, col: 0, dir: "down" },
          ],
        },
      },
    },
    {
      id: "the-bench",
      date: "2023-05-02",
      title: "Where the lane ends",
      body: "Same bench, same light. We come back here when we need to feel like ourselves again.",
      person: "Us",
      mood: "joyful",
      shellKind: "vault",
    },
  ],
};

/** The seed city, fully derived from the meaning-only document above. */
export const SEED_CITY: CityConfig = buildCityConfig(SEED_DOC);
