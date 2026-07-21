# Development

## Setup

```bash
npm install
```

## Common Commands

```bash
npm run typecheck
npm run build
npm run dev
```

`npm run build` generates `dist/powertodoist-card.js` and then copies it to `powertodoist-card.js` in the project root. The root bundle is the file used by HACS/manual installs.

`npm run dev` starts the Vite development harness. It loads `src/main.ts` directly.

## Watch Into A Home Assistant Config Folder

Use `watch:ha` when you want each source change to rebuild directly into a Home Assistant `www` folder.

Set the destination explicitly:

```bash
npm run watch:ha -- --dest /config/www/community/powertodoist-card/powertodoist-card.js
```

Or use an environment variable:

```bash
HA_CARD_DEST=/config/www/community/powertodoist-card/powertodoist-card.js npm run watch:ha
```

On Windows PowerShell:

```powershell
$env:HA_CARD_DEST = "\\homeassistant\config\www\community\powertodoist-card\powertodoist-card.js"
npm run watch:ha
```

The script intentionally has no hardcoded Home Assistant path.
