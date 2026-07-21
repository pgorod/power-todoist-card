import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";

function getArgValue(name) {
  const prefix = `--${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const DEST = getArgValue("dest") || process.env.HA_CARD_DEST;

if (!DEST) {
  console.error(
    "Usage: npm run watch:ha -- --dest /path/to/config/www/community/powertodoist-card/powertodoist-card.js"
  );
  console.error("Or set HA_CARD_DEST to the same destination path.");
  process.exit(1);
}

const fixLitExportsPlugin = {
  name: "fix-lit-exports",
  setup(build) {
    build.onResolve({ filter: /^lit\// }, async (args) => {
      if (args.path.endsWith(".js")) return null;

      const result = await build.resolve(`${args.path}.js`, {
        resolveDir: args.resolveDir,
        kind: args.kind,
      });

      return result.errors.length ? null : result;
    });
  },
};

const reportOutputPlugin = {
  name: "report-output",
  setup(build) {
    build.onEnd((result) => {
      if (result.errors.length) return;

      const stats = fs.statSync(DEST);
      console.log(
        `[watch:ha] wrote ${DEST} (${stats.size} bytes, ${stats.mtime.toLocaleString()})`
      );
    });
  },
};

fs.mkdirSync(path.dirname(DEST), { recursive: true });

const ctx = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  format: "esm",
  target: "es2022",
  outfile: DEST,
  plugins: [fixLitExportsPlugin, reportOutputPlugin],
  logLevel: "info",
});

await ctx.watch();
console.log(`[watch:ha] watching src/main.ts -> ${DEST}`);
