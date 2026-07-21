import type { PowerTodoistConfig, TodoistLabelColor, TodoistTask } from "../core/types";
import { getDueDateLabel } from "./due-dates";

const EXTRA_LABEL_COLOR_SEPARATOR = "||pt-color:";

export type TodoistTaskWithStatus = TodoistTask & {
  statusFromLabelCriteria?: boolean;
};

export interface ParsedDisplayLabel {
  text: string;
  color?: string;
  isOutline: boolean;
}

export function matchesLabelCriteria(
  task: TodoistTask,
  criteria: string[] | undefined,
  defaultIfNoCriteria: boolean,
  cardLabels?: string[]
): boolean {
  if (!criteria) return defaultIfNoCriteria;

  const labels = task.labels ?? [];
  let includes = 0;
  let excludes = 0;

  criteria.forEach((criterion) => {
    if (criterion.startsWith("!")) {
      excludes += labels.includes(criterion.slice(1)) ? 1 : 0;
      return;
    }

    includes += labels.includes(criterion) || criterion === "*" ? 1 : 0;
    includes += criterion === "!*" && labels.length === 0 ? 1 : 0;

    if (cardLabels && !cardLabels.includes(criterion)) {
      cardLabels.push(criterion);
    }
  });

  return excludes === 0 && includes > 0;
}

export function applyStatusFromLabels(
  tasks: TodoistTask[],
  config: PowerTodoistConfig
): TodoistTaskWithStatus[] {
  return tasks.map((task) => ({
    ...task,
    statusFromLabelCriteria: matchesLabelCriteria(task, config.status_from_labels, false),
  }));
}

export function getDisplayLabels(
  task: TodoistTask,
  config: PowerTodoistConfig,
  cardLabels: string[],
  labelColors: TodoistLabelColor[]
): string[] {
  const labels = task.labels ?? [];
  const dueDateLabel = getDueDateLabel(task, config);
  const generatedExtraLabels = generateExtraLabels(labels, config, labelColors);
  if (config.show_item_labels === false) return [dueDateLabel, ...generatedExtraLabels].filter(isString);

  const allLabels = [dueDateLabel, ...labels, ...generatedExtraLabels].filter(isString);
  const exclusions = new Set([
    ...(cardLabels.length === 1 ? cardLabels : []),
    ...allLabels.filter((label) => label.startsWith("_") && !label.endsWith("_outline")),
  ]);

  return allLabels.filter((label) => !exclusions.has(label));
}

function isString(value: string | undefined): value is string {
  return typeof value === "string" && value.length > 0;
}

export function generateExtraLabels(
  labels: string[],
  config: PowerTodoistConfig,
  labelColors: TodoistLabelColor[]
): string[] {
  const extraLabels: string[] = [];

  config.extra_labels?.forEach((rule) => {
    const conditionalDisplayLabel = getConditionalDisplayLabel(rule, labels);
    if (conditionalDisplayLabel) {
      extraLabels.push(conditionalDisplayLabel);
      return;
    }

    const parts = rule.split(/[:+]/).map((part) => part.trim()).filter(Boolean);
    const firstPart = parts[0];
    if (!firstPart) return;

    const mainParts = rule.split(":").map((part) => part.trim());
    let filteredParts = parts.slice(1).filter((part) => labels.includes(part));

    if (mainParts.length > 1 && mainParts[1].startsWith("+")) {
      filteredParts = filteredParts.length > 0 ? [String(filteredParts.length)] : [];
    }

    if (!filteredParts.length && rule.includes(":")) return;

    const hasOutlineColor = labelColors.some((labelColor) => labelColor.name === `${firstPart}_outline`);
    extraLabels.push(`${firstPart}: ${filteredParts.join("+")}${hasOutlineColor ? "_outline" : ""}`);
  });

  return extraLabels;
}

export function parseDisplayLabel(label: string): ParsedDisplayLabel {
  const isOutline = label.endsWith("_outline");
  const cleanLabel = isOutline ? label.slice(0, -"_outline".length) : label;
  const colorSeparatorIndex = cleanLabel.indexOf(EXTRA_LABEL_COLOR_SEPARATOR);

  if (colorSeparatorIndex < 0) {
    return {
      text: cleanLabel,
      isOutline,
    };
  }

  return {
    text: cleanLabel.slice(0, colorSeparatorIndex),
    color: cleanLabel.slice(colorSeparatorIndex + EXTRA_LABEL_COLOR_SEPARATOR.length),
    isOutline,
  };
}

function getConditionalDisplayLabel(rule: string, labels: string[]): string | undefined {
  const ruleParts = splitConditionalDisplayRule(rule);
  if (!ruleParts) return undefined;

  const { color, criteria, text } = ruleParts;
  if (!criteria.some((criterion) => labels.includes(criterion))) return undefined;

  return color ? `${text}${EXTRA_LABEL_COLOR_SEPARATOR}${color}` : text;
}

function splitConditionalDisplayRule(rule: string): {
  color?: string;
  criteria: string[];
  text: string;
} | undefined {
  const separatorIndex = rule.indexOf(":");
  if (separatorIndex < 0) return undefined;

  const text = rule.slice(0, separatorIndex).trim();
  const detail = rule.slice(separatorIndex + 1).trim();
  const conditionIndex = detail.indexOf("=");
  if (!text || conditionIndex < 0) return undefined;

  const color = detail.slice(0, conditionIndex).trim();
  const criteria = detail
    .slice(conditionIndex + 1)
    .split("+")
    .map((criterion) => criterion.trim())
    .filter(Boolean);

  if (!criteria.length) return undefined;

  return {
    text,
    color: color || undefined,
    criteria,
  };
}
