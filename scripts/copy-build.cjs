const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const source = path.join(root, "dist", "powertodoist-card.js");
const target = path.join(root, "powertodoist-card.js");

if (!fs.existsSync(source)) {
  throw new Error(`Build output not found: ${source}`);
}

fs.copyFileSync(source, target);
console.log(`Copied ${path.relative(root, source)} to ${path.relative(root, target)}`);
