import type { HassEntity, PowerTodoistConfig, TodoistTask } from "../core/types";
import { getEntitySections } from "../core/hass-entities";

export function getSectionId(config: PowerTodoistConfig, entity: HassEntity): string | number | undefined {
  if (config.filter_section_id) return config.filter_section_id;

  const sectionName = config.filter_section;
  if (!sectionName || sectionName === "!*") return undefined;

  const normalizedSectionName = normalizeSectionName(sectionName);
  return getEntitySections(entity).find((section) => normalizeSectionName(section.name) === normalizedSectionName)?.id;
}

export function filterBySection(
  items: TodoistTask[],
  config: PowerTodoistConfig,
  sectionId: string | number | undefined
): TodoistTask[] {
  if (config.filter_section === "!*") {
    return items.filter((item) => !getTaskSectionId(item) && !getTaskSectionName(item));
  }

  if (!sectionId) return items;
  return items.filter((item) =>
    normalizeId(getTaskSectionId(item)) === normalizeId(sectionId) ||
    normalizeSectionName(getTaskSectionName(item) ?? "") === normalizeSectionName(config.filter_section ?? "")
  );
}

export function extractCardLabels(config: PowerTodoistConfig, items: TodoistTask[]): string[] {
  const cardLabels: string[] = [];
  if (!config.filter_labels) return cardLabels;

  items.forEach((item) => {
    const itemLabels = item.labels ?? [];
    config.filter_labels?.forEach((label) => {
      if (!label.startsWith("!") && (itemLabels.includes(label) || label === "*")) {
        if (!cardLabels.includes(label)) cardLabels.push(label);
      }
    });
  });

  return cardLabels;
}

export function getCardName(
  config: PowerTodoistConfig,
  entity: HassEntity,
  sectionId: string | number | undefined
): string {
  return (
    config.name as string ||
    config.friendly_name ||
    getEntitySections(entity).find((section) => normalizeId(section.id) === normalizeId(sectionId))?.name ||
    config.filter_section ||
    "ToDoist"
  );
}

function normalizeId(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

function getTaskSectionId(item: TodoistTask): unknown {
  const task = item as TodoistTask & {
    sectionId?: unknown;
    section?: { id?: unknown } | string;
  };

  if (task.section_id !== undefined && task.section_id !== null) return task.section_id;
  if (task.sectionId !== undefined && task.sectionId !== null) return task.sectionId;
  if (task.section && typeof task.section === "object") return task.section.id;
  return undefined;
}

function getTaskSectionName(item: TodoistTask): string | undefined {
  const task = item as TodoistTask & {
    section_name?: unknown;
    sectionName?: unknown;
    section?: { name?: unknown } | string;
  };

  if (typeof task.section_name === "string") return task.section_name;
  if (typeof task.sectionName === "string") return task.sectionName;
  if (typeof task.section === "string") return task.section;
  if (task.section && typeof task.section === "object" && typeof task.section.name === "string") {
    return task.section.name;
  }
  return undefined;
}

function normalizeSectionName(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("pt-PT");
}
