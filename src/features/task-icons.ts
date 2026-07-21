import type { PowerTodoistConfig } from "../core/types";
import { getTodoistColor, isValidTodoistColor } from "../todoist/colors";
import type { TodoistTaskWithStatus } from "./task-labels";

export interface IconConfig {
  name: string;
  color?: string;
}

export const DEFAULT_ICONS = [
  "checkbox-marked-circle-outline:green",
  "circle-medium",
  "plus-outline:blue",
  "trash-can-outline:red",
  "checkbox-marked-circle-outline",
  "checkbox-blank-circle-outline",
];

export function getConfiguredIcon(config: PowerTodoistConfig, index: number): IconConfig {
  return getIcons(config)[index] ?? parseIcon(DEFAULT_ICONS[index] ?? DEFAULT_ICONS[0]);
}

export function getTaskIcon(task: TodoistTaskWithStatus, config: PowerTodoistConfig): IconConfig {
  const icons = getIcons(config);
  const hasStatusIcons =
    config.status_from_labels !== undefined &&
    task.statusFromLabelCriteria !== undefined &&
    icons.length >= 6;

  if (hasStatusIcons) return task.statusFromLabelCriteria ? icons[4] : icons[5];
  return icons[0];
}

export function getIcons(config: PowerTodoistConfig): IconConfig[] {
  const rawIcons = Array.isArray(config.icons) && config.icons.length >= 4
    ? config.icons
    : DEFAULT_ICONS;
  return rawIcons.map((icon) => parseIcon(icon));
}

function parseIcon(icon: unknown): IconConfig {
  if (typeof icon !== "string") return parseIcon(DEFAULT_ICONS[0]);

  const [rawName, ...colorParts] = icon.split(":");
  const name = rawName.trim() || parseIcon(DEFAULT_ICONS[0]).name;
  const color = colorParts.join(":").trim();
  return {
    name,
    color: resolveIconColor(color),
  };
}

function resolveIconColor(color: string): string | undefined {
  if (!color) return undefined;
  return isValidTodoistColor(color) ? getTodoistColor(color) : color;
}
