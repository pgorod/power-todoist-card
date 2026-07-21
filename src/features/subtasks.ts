import type { TodoistTask } from "../core/types";

export function getTaskDepths(tasks: TodoistTask[]): Map<string, number> {
  const tasksById = new Map(tasks.map((task) => [String(task.id), task]));
  const depths = new Map<string, number>();

  tasks.forEach((task) => {
    depths.set(String(task.id), computeTaskDepth(task, tasksById, depths, new Set()));
  });

  return depths;
}

export function getTaskDepth(task: TodoistTask, depths: Map<string, number>): number {
  return depths.get(String(task.id)) ?? (getParentId(task) ? 1 : 0);
}

export function getParentId(task: TodoistTask): string | undefined {
  const candidate = task as TodoistTask & {
    parent_id?: unknown;
    parentId?: unknown;
    parent?: { id?: unknown } | string;
  };

  const parentId = candidate.parent_id ?? candidate.parentId ??
    (typeof candidate.parent === "object" ? candidate.parent.id : candidate.parent);
  return parentId === undefined || parentId === null || parentId === "" ? undefined : String(parentId);
}

function computeTaskDepth(
  task: TodoistTask,
  tasksById: Map<string, TodoistTask>,
  depths: Map<string, number>,
  seen: Set<string>
): number {
  const id = String(task.id);
  const parentId = getParentId(task);
  if (!parentId) return 0;
  if (depths.has(id)) return depths.get(id) ?? 0;
  if (seen.has(id)) return 1;

  seen.add(id);
  const parent = tasksById.get(parentId);
  const depth = parent
    ? Math.min(computeTaskDepth(parent, tasksById, depths, seen) + 1, 6)
    : 1;
  depths.set(id, depth);
  return depth;
}
