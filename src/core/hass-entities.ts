import type { HassEntity, HomeAssistant, PowerTodoistConfig, TodoistComment, TodoistSection, TodoistTask } from "./types";

export function getEntityState(hass: HomeAssistant | undefined, entityId: string): HassEntity {
  const entity = hass?.states?.[entityId];
  if (!entity) throw new Error(`PowerTodoistCard: entity "${entityId}" not found`);
  return entity;
}

export function getEntityTasks(entity: HassEntity | undefined): TodoistTask[] {
  const attributes = entity?.attributes;
  const nested = getNestedAttributes(attributes);
  const taskCandidates = [
    attributes?.tasks,
    attributes?.items,
    attributes?.results,
    attributes?.result,
    attributes?.data,
    nested?.tasks,
    nested?.items,
  ];
  return getFirstUsefulArray<TodoistTask>(taskCandidates);
}

export function getEntitySections(entity: HassEntity | undefined): TodoistSection[] {
  const attributes = entity?.attributes;
  const nested = getNestedAttributes(attributes);
  const sectionCandidates = [
    attributes?.sections,
    nested?.sections,
    attributes?.project_sections,
    nested?.project_sections,
  ];
  return getFirstUsefulArray<TodoistSection>(sectionCandidates);
}

export function getProjectNotes(
  hass: HomeAssistant | undefined,
  config: PowerTodoistConfig
): TodoistComment[] {
  const commentsEntity = config.comments_entity ? hass?.states?.[config.comments_entity] : undefined;
  const todoistEntity = hass?.states?.[config.entity];
  const rawNotes = commentsEntity
    ? commentsEntity.attributes.results ?? commentsEntity.attributes.comments ?? commentsEntity.attributes.items
    : todoistEntity?.attributes.project_notes;

  return normalizeProjectNotes(rawNotes);
}

export function getLabelColors(hass: HomeAssistant | undefined): unknown[] {
  const sensor = hass?.states?.["sensor.label_colors"];
  if (!sensor) throw new Error("PowerTodoistCard: sensor.label_colors not found");

  const labelColors = sensor.attributes.label_colors;
  return Array.isArray(labelColors) ? labelColors : [];
}

function getNestedAttributes(attributes: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  const candidates = [
    attributes?.results,
    attributes?.result,
    attributes?.data,
  ];

  return candidates.find(
    (candidate): candidate is Record<string, unknown> =>
      Boolean(candidate) && typeof candidate === "object" && !Array.isArray(candidate)
  );
}

function getFirstUsefulArray<T>(values: unknown[]): T[] {
  const arrays = values.map(getArrayCandidate).filter(Array.isArray) as T[][];
  return arrays.find((value) => value.length > 0) ?? arrays[0] ?? [];
}

function getArrayCandidate(value: unknown): unknown[] | undefined {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return undefined;

  const candidate = value as Record<string, unknown>;
  const nestedValues = [
    candidate.tasks,
    candidate.items,
    candidate.results,
    candidate.result,
    candidate.data,
    candidate.sections,
    candidate.project_sections,
  ];

  return nestedValues.find(Array.isArray) as unknown[] | undefined;
}

function normalizeProjectNotes(value: unknown): TodoistComment[] {
  if (Array.isArray(value)) {
    return value
      .map(toTodoistComment)
      .filter((comment): comment is TodoistComment => Boolean(comment));
  }

  const comment = toTodoistComment(value);
  return comment ? [comment] : [];
}

function toTodoistComment(value: unknown): TodoistComment | undefined {
  if (typeof value === "string") return { content: value };
  if (!value || typeof value !== "object") return undefined;

  const candidate = value as { id?: unknown; content?: unknown };
  if (typeof candidate.content !== "string") return undefined;

  return {
    id: typeof candidate.id === "string" ? candidate.id : undefined,
    content: candidate.content,
  };
}
