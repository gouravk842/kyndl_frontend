/**
 * Connected-cluster bookkeeping via union-find. When two correctly-adjacent
 * pieces snap together they become one group and thereafter drag as a unit.
 * Kept tiny and pure: the store owns an instance and asks it who-is-with-whom.
 */

export class DisjointSet {
  private parent: number[];
  private rank: number[];

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i);
    this.rank = new Array(size).fill(0);
  }

  /** Root id of `x`'s cluster, with path compression. */
  find(x: number): number {
    let root = x;
    while (this.parent[root] !== root) root = this.parent[root]!;
    // Compress so repeated lookups during a drag stay O(1)-ish.
    while (this.parent[x] !== root) {
      const next = this.parent[x]!;
      this.parent[x] = root;
      x = next;
    }
    return root;
  }

  /** Merge two clusters. Returns the surviving root. */
  union(a: number, b: number): number {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return ra;
    if (this.rank[ra]! < this.rank[rb]!) {
      this.parent[ra] = rb;
      return rb;
    }
    if (this.rank[ra]! > this.rank[rb]!) {
      this.parent[rb] = ra;
      return ra;
    }
    this.parent[rb] = ra;
    this.rank[ra]!++;
    return ra;
  }

  connected(a: number, b: number): boolean {
    return this.find(a) === this.find(b);
  }

  /** All members sharing `x`'s cluster (including `x`). */
  members(x: number): number[] {
    const root = this.find(x);
    const out: number[] = [];
    for (let i = 0; i < this.parent.length; i++) {
      if (this.find(i) === root) out.push(i);
    }
    return out;
  }

  /** Number of distinct clusters remaining. */
  count(): number {
    let n = 0;
    for (let i = 0; i < this.parent.length; i++) {
      if (this.find(i) === i) n++;
    }
    return n;
  }
}
