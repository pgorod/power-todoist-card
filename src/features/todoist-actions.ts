import type {
  HomeAssistant,
  PowerTodoistActionDefinition,
  PowerTodoistConfig,
  TodoistSection,
  TodoistTask,
} from "../core/types";
import { getEntitySections } from "../core/hass-entities";
import { getUUID, replaceMultiple } from "../core/utils";
import { TODOIST_COMMANDS, type TodoistCommand } from "../todoist/todoist-commands";

export interface BuiltTodoistAction {
  commands: TodoistCommand[];
  adds: string[];
  followUpActions: string[];
  optimisticTask?: TodoistTask;
  toast?: string;
  confirm?: string;
  service?: string;
  emphasis?: string[];
}

export interface BuildTodoistActionOptions {
  prompt?: (question: string, defaultValue: string) => string | null;
}

const UPDATE_FIELDS = new Set([
  "content",
  "description",
  "due",
  "priority",
  "collapsed",
  "assigned_by_uid",
  "responsible_uid",
  "day_order",
]);

export function buildTodoistAction(
  task: TodoistTask,
  config: PowerTodoistConfig,
  hass: HomeAssistant | undefined,
  actionKey = "actions_close",
  options: BuildTodoistActionOptions = {}
): BuiltTodoistAction {
  const actions = normalizeActions(config[actionKey]);
  const labelChanges = extractActionArray(actions, "label");
  const updates = extractActionUpdates(actions);
  const allow = extractActionArray(actions, "allow");
  const adds = extractActionArray(actions, "add").map((add) => resolveActionString(add, task, hass, ""));
  const matches = extractMatches(actions);
  const toast = extractActionValue(actions, "toast");
  const confirm = extractActionValue(actions, "confirm");
  const service = extractActionValue(actions, "service");
  const promptTexts = extractActionValue(actions, "prompt_texts");
  const emphasis = extractActionArray(actions, "emphasis");
  const user = hass?.user?.name ?? "";

  if (allow.length && !allow.includes(user)) {
    return { commands: [], adds: [], followUpActions: [], toast, confirm };
  }

  const input = getActionInput(task, actionKey, actions, updates, promptTexts, options.prompt);
  const commands = buildDefaultCommands(actions, actionKey, task);
  const defaultUpdate = buildDefaultUpdateCommand(actionKey, task, input);
  if (!actions.length && defaultUpdate) commands.push(defaultUpdate);

  if (updates.length || labelChanges.length) {
    const labels = applyLabelChanges(task.labels ?? [], labelChanges, user);
    const args: Record<string, unknown> = {
      id: task.id,
      labels,
      ...buildUpdateArgs(updates, task, hass, input),
    };

    commands.unshift(buildCommand(TODOIST_COMMANDS.ITEM_UPDATE, args));
    appendMoveCommand(commands, actions, task, config, hass);

    return {
      commands,
      adds,
      followUpActions: getFollowUpActions(matches, task, hass),
      optimisticTask: getOptimisticTaskFromCommands(task, commands),
      toast,
      confirm,
      service,
      emphasis,
    };
  }

  appendMoveCommand(commands, actions, task, config, hass);

  return {
    commands,
    adds,
    followUpActions: getFollowUpActions(matches, task, hass),
    optimisticTask: getOptimisticTaskFromCommands(task, commands),
    toast,
    confirm,
    service,
    emphasis,
  };
}

export function applyLabelChanges(
  currentLabels: string[],
  labelChanges: string[],
  user: string
): string[] {
  let labels = [...currentLabels];

  if (labelChanges.includes("!*")) labels = [];
  if (labelChanges.includes("!_")) labels = labels.filter((label) => !label.startsWith("_"));
  if (labelChanges.includes("!!")) labels = labels.filter((label) => label.startsWith("_"));

  labelChanges.forEach((change) => {
    if (["!*", "!_", "!!"].includes(change)) return;

    const resolved = replaceMultiple(change, { "%user%": user }) as string;

    if (change.startsWith("!")) {
      labels = labels.filter((label) => label !== resolved.slice(1));
      return;
    }

    if (change.startsWith(":")) {
      const label = resolved.slice(1);
      labels = labels.includes(label)
        ? labels.filter((existing) => existing !== label)
        : [...labels, label];
      return;
    }

    if (!labels.includes(resolved)) labels = [...labels, resolved];
  });

  return [...new Set(labels)];
}

function normalizeActions(value: unknown): PowerTodoistActionDefinition[] {
  if (!value) return [];
  return Array.isArray(value) ? value as PowerTodoistActionDefinition[] : [value as PowerTodoistActionDefinition];
}

function extractActionArray(
  actions: PowerTodoistActionDefinition[],
  key: "label" | "allow" | "add" | "emphasis"
): string[] {
  const entry = actions.find((action) => typeof action === "object" && action[key] !== undefined);
  if (typeof entry !== "object") return [];
  const value = entry[key];
  if (Array.isArray(value)) return value.map(String);
  return typeof value === "string" ? [value] : [];
}

function extractActionValue(
  actions: PowerTodoistActionDefinition[],
  key: "toast" | "confirm" | "service" | "prompt_texts"
): string | undefined {
  const entry = actions.find((action) => typeof action === "object" && action[key] !== undefined);
  if (typeof entry !== "object") return undefined;
  const value = entry[key];
  return Array.isArray(value) ? value.join(" ") : value;
}

function extractActionUpdates(actions: PowerTodoistActionDefinition[]): Record<string, unknown>[] {
  const entry = actions.find((action) => typeof action === "object" && Array.isArray(action.update));
  return typeof entry === "object" && Array.isArray(entry.update) ? entry.update : [];
}

function extractMatches(actions: PowerTodoistActionDefinition[]): unknown[] {
  const entry = actions.find((action) => typeof action === "object" && Array.isArray(action.match));
  return typeof entry === "object" && Array.isArray(entry.match) ? entry.match : [];
}

function buildDefaultCommands(
  actions: PowerTodoistActionDefinition[],
  actionKey: string,
  task: TodoistTask
): TodoistCommand[] {
  const commands: TodoistCommand[] = [];
  const defaultAction = getDefaultCommandType(actionKey);

  if (!actions.length && defaultAction) {
    commands.push(buildCommand(defaultAction, { id: task.id }));
  }

  actions.forEach((action) => {
    if (typeof action !== "string") return;
    const commandType = getDefaultCommandType(`actions_${action}`);
    if (commandType) commands.push(buildCommand(commandType, { id: task.id }));
  });

  return commands;
}

function getDefaultCommandType(actionKey: string): TodoistCommand["type"] | undefined {
  if (actionKey === "actions_close") return TODOIST_COMMANDS.ITEM_COMPLETE;
  if (actionKey === "actions_delete") return TODOIST_COMMANDS.ITEM_DELETE;
  if (actionKey === "actions_uncomplete") return TODOIST_COMMANDS.ITEM_UNCOMPLETE;
  return undefined;
}

function buildDefaultUpdateCommand(
  actionKey: string,
  task: TodoistTask,
  input: string
): TodoistCommand | undefined {
  if (actionKey === "actions_content") {
    return buildCommand(TODOIST_COMMANDS.ITEM_UPDATE, { id: task.id, content: input });
  }

  if (actionKey === "actions_description") {
    return buildCommand(TODOIST_COMMANDS.ITEM_UPDATE, { id: task.id, description: input });
  }

  return undefined;
}

function buildUpdateArgs(
  updates: Record<string, unknown>[],
  task: TodoistTask,
  hass: HomeAssistant | undefined,
  input: string
): Record<string, unknown> {
  return updates.reduce<Record<string, unknown>>((args, update) => {
    Object.entries(update).forEach(([key, value]) => {
      if (!UPDATE_FIELDS.has(key)) return;
      args[key] = resolveActionValue(value, task, hass, input, task[key]);
    });
    return args;
  }, {});
}

function resolveActionValue(
  value: unknown,
  task: TodoistTask,
  hass: HomeAssistant | undefined,
  input: string,
  was: unknown = ""
): unknown {
  if (typeof value !== "string") return value;
  return resolveActionString(value, task, hass, input, was);
}

function resolveActionString(
  value: string,
  task: TodoistTask,
  hass: HomeAssistant | undefined,
  input: string,
  was: unknown = ""
): string {
  const replacements = Object.entries(task).reduce<Record<string, string>>((all, [key, taskValue]) => {
    if (typeof taskValue === "string" || typeof taskValue === "number" || typeof taskValue === "boolean") {
      all[`%${key}%`] = String(taskValue);
    }
    return all;
  }, {
    "%user%": hass?.user?.name ?? "",
    "%input%": input,
    "%line%": "\n",
    "%str_labels%": JSON.stringify(task.labels ?? []),
    "%date%": new Date().toISOString(),
  });

  return replaceMultiple(value, replacements, String(was ?? ""), input) as string;
}

function getActionInput(
  task: TodoistTask,
  actionKey: string,
  actions: PowerTodoistActionDefinition[],
  updates: Record<string, unknown>[],
  promptTexts: string | undefined,
  prompt: BuildTodoistActionOptions["prompt"]
): string {
  const needsPrompt =
    Boolean(promptTexts) ||
    JSON.stringify(updates).includes("%input%") ||
    (!actions.length && ["actions_content", "actions_description"].includes(actionKey));

  if (!needsPrompt || !prompt) return "";

  const field = actionKey.replace(/^actions_/, "");
  let question = `Please enter a new value for ${field}:`;
  let defaultValue = String(task[field] ?? "");

  if (promptTexts) {
    const [customQuestion, customDefault = ""] = promptTexts.split("|");
    question = customQuestion;
    defaultValue = customDefault;
  }

  defaultValue = resolveActionString(defaultValue, task, undefined, "");
  return prompt(question, defaultValue) ?? "";
}

function appendMoveCommand(
  commands: TodoistCommand[],
  actions: PowerTodoistActionDefinition[],
  task: TodoistTask,
  config: PowerTodoistConfig,
  hass: HomeAssistant | undefined
): void {
  if (!actions.includes("move")) return;
  const moveArgs = getMoveArgs(task, getSections(config, hass));
  if (moveArgs) commands.push(buildCommand(TODOIST_COMMANDS.ITEM_MOVE, moveArgs));
}

function getSections(config: PowerTodoistConfig, hass: HomeAssistant | undefined): TodoistSection[] {
  return getEntitySections(hass?.states?.[config.entity]);
}

function getMoveArgs(task: TodoistTask, sections: TodoistSection[]): Record<string, unknown> | undefined {
  const targetId = getNextSectionId(task, sections);
  if (!targetId) return undefined;

  return {
    id: task.id,
    [targetId === task.project_id ? "project_id" : "section_id"]: targetId,
  };
}

function getNextSectionId(task: TodoistTask, sections: TodoistSection[]): string | undefined {
  const orderedSections = [...sections].sort((left, right) => getSectionOrder(left) - getSectionOrder(right));
  if (!orderedSections.length) return task.project_id;

  const currentIndex = orderedSections.findIndex((section) => String(section.id) === String(task.section_id ?? ""));
  const nextSection = currentIndex < 0 ? orderedSections[0] : orderedSections[currentIndex + 1];

  return nextSection?.id ?? task.project_id;
}

function getSectionOrder(section: TodoistSection): number {
  return (section.section_order ?? section.order ?? Number(section.id)) || 0;
}

function getFollowUpActions(
  matches: unknown[],
  task: TodoistTask,
  hass: HomeAssistant | undefined
): string[] {
  return matches.flatMap((match): string[] => {
    if (!Array.isArray(match)) return [];
    const [field, value, actionName, elseActionName] = match;
    if (typeof field !== "string") return [];

    const matched = field.includes(".")
      ? getHassMatchValue(field, hass) === value
      : taskFieldMatches(task[field], value);
    const chosen = matched ? actionName : elseActionName;

    return typeof chosen === "string" && chosen.length ? [normalizeActionName(chosen)] : [];
  });
}

function getHassMatchValue(field: string, hass: HomeAssistant | undefined): unknown {
  const [entityId, attributeName] = field.split("#");
  const entity = hass?.states?.[entityId];
  return attributeName ? entity?.attributes?.[attributeName] : entity?.state;
}

function taskFieldMatches(value: unknown, expected: unknown): boolean {
  if (Array.isArray(value)) return value.includes(expected);
  return value === expected;
}

function normalizeActionName(actionName: string): string {
  return actionName.startsWith("actions_") ? actionName.slice("actions_".length) : actionName;
}

function buildCommand(type: TodoistCommand["type"], args: Record<string, unknown>): TodoistCommand {
  return {
    type,
    uuid: getUUID(),
    args,
  };
}

function getOptimisticTaskFromCommands(
  task: TodoistTask,
  commands: TodoistCommand[]
): TodoistTask | undefined {
  return commands.reduce<TodoistTask | undefined>((optimisticTask, command) => {
    const current = optimisticTask ?? task;

    if (command.type === TODOIST_COMMANDS.ITEM_UPDATE) {
      return {
        ...current,
        ...command.args,
        id: task.id,
      };
    }

    if (command.type === TODOIST_COMMANDS.ITEM_MOVE) {
      const movedTask = { ...current };
      if (typeof command.args.section_id === "string") movedTask.section_id = command.args.section_id;
      if (typeof command.args.project_id === "string") {
        movedTask.project_id = command.args.project_id;
        movedTask.section_id = null;
      }
      return movedTask;
    }

    return optimisticTask;
  }, undefined);
}
