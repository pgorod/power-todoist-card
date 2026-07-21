import type { HomeAssistant } from "../core/types";

export const RELATIVE_DAY_LABELS: Record<number, string> = {
  [-1]: "Ontem",
  [0]: "Hoje",
  [1]: "Amanhã",
  [2]: "Depois de amanhã",
};

export interface RelativeDayTitleOptions {
  entityId?: string;
  sourceToken?: unknown;
}

export function formatRelativeDayTitle(
  title: string,
  hass: HomeAssistant | undefined,
  options: RelativeDayTitleOptions = {}
): string {
  const offset = getDayOffsetFromSourceToken(options.sourceToken) ?? getDayOffset(title, hass, options.entityId);
  if (offset === undefined) return title;

  const label = RELATIVE_DAY_LABELS[offset] ?? `Daqui a ${offset} dias`;
  return `${title} (${label})`;
}

function getDayOffset(title: string, hass: HomeAssistant | undefined, entityId = "sensor.dow"): number | undefined {
  const days = getDaysFromSensor(hass, entityId);
  const normalizedTitle = normalizeDay(title);
  const index = days.findIndex((day) => normalizeDay(day) === normalizedTitle);

  if (index < 0) return undefined;
  return index - 1;
}

function getDayOffsetFromSourceToken(sourceToken: unknown): number | undefined {
  if (typeof sourceToken !== "string") return undefined;
  const match = sourceToken.match(/%dow(-?\d+)%/i);
  if (!match) return undefined;
  return Number(match[1]);
}

function getDaysFromSensor(hass: HomeAssistant | undefined, entityId: string): string[] {
  return hass?.states?.[entityId]?.state
    ?.split(", ")
    .map((day) => day.replaceAll("'", "").trim())
    .filter(Boolean) ?? [];
}

function normalizeDay(value: string): string {
  return value.trim().toLocaleLowerCase("pt-PT");
}
