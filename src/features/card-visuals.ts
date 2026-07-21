import type { PowerTodoistConfig } from "../core/types";

export function getCardClass(config: PowerTodoistConfig): string {
  return config.accent ? "left-accent" : "";
}

export function getCardStyle(config: PowerTodoistConfig): string {
  const lineSize = getNumberConfig(config.line_size, 40);
  const fontSize = getNumberConfig(config.font_size, 16);
  const iconSize = getNumberConfig(config.icon_size, 24);
  const computedLineSize = Math.max(lineSize, iconSize + 16);
  const paddingTop = getNumberConfig(config.line_padding_top, 0);
  const paddingBottom = getNumberConfig(config.line_padding_bottom, 0);

  return [
    `--pt-item-line-size: ${computedLineSize}px`,
    `--pt-item-font-size: ${fontSize}px`,
    `--pt-icon-size: ${iconSize}px`,
    `--pt-line-padding-top: ${paddingTop}px`,
    `--pt-line-padding-bottom: ${paddingBottom}px`,
    `--pt-accent-color: ${config.accent || "var(--primary-color, #149514)"}`,
  ].join("; ");
}

function getNumberConfig(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return fallback;
}
