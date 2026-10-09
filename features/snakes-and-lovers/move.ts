/**
 * The squares a roll visits, one step at a time.
 *
 * Passing 100 bounces back by the extra pips — the same square the old
 * single-jump formula landed on: `100 - (from + steps - 100)`.
 */
export type RollTravel = {
  path: number[];
  landed: number;
  bounced: boolean;
};

export function rollPath(
  from: number,
  steps: number,
  finish = 100,
): RollTravel {
  const path: number[] = [];
  let pos = from;
  let bounced = false;

  for (let i = 0; i < steps; i++) {
    if (bounced || pos >= finish) {
      bounced = true;
      pos -= 1;
    } else {
      pos += 1;
      if (pos === finish && i < steps - 1) bounced = true;
    }
    path.push(pos);
  }

  return { path, landed: path[path.length - 1] ?? from, bounced };
}

/** Where a roll used to jump in one move, including the bounce off 100. */
export function rollDestination(
  from: number,
  steps: number,
  finish = 100,
): number {
  const dest = from + steps;
  if (dest <= finish) return dest;
  return finish - (dest - finish);
}
