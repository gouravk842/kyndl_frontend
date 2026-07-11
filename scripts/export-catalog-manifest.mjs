// Generates catalog.manifest.json from lib/experiences.ts — the contract the
// backend `manage.py sync_catalog` command reconciles the Product catalog against.
//
// Run: npm run catalog:manifest   (re-run whenever experiences.ts changes; the
// prebuild step does this automatically).
//
// The manifest is a deliberate *projection*: only the fields the backend catalog
// needs. Presentation (copy, icons, gradients, highlights) stays in the frontend,
// and PRICE is intentionally omitted — pricing is backend-owned, so the sync must
// never dictate it.
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { experiences } from "../lib/experiences.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const manifest = experiences.map((exp, index) => ({
  code: exp.slug, // the join key: frontend slug === backend Product.code
  name: exp.name,
  description: exp.description,
  status: exp.status, // seeds NEW rows only; the admin owns it thereafter
  display_order: index + 1, // default order; the admin can override
}));

const out = join(root, "catalog.manifest.json");
writeFileSync(out, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(`Wrote ${manifest.length} products → catalog.manifest.json`);
