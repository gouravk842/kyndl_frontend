import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "assets/logo.svg"), "utf8");
const escaped = svg
  .replace(/\\/g, "\\\\")
  .replace(/`/g, "\\`")
  .replace(/\$\{/g, "\\${");

const output = `// Auto-synced from assets/logo.svg — run: npm run sync:logo
export const kyndlLogoSvg = \`${escaped}\`;
`;

writeFileSync(join(root, "lib/kyndl-logo-svg.ts"), output, "utf8");
console.log("Synced assets/logo.svg → lib/kyndl-logo-svg.ts");
