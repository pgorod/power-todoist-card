import type { PowerTodoistConfig, TodoistTask } from "../core/types";

type TaskWithDuration = TodoistTask & {
  duration?: {
    amount: number;
    unit: "day" | "minute" | string;
  };
};

export function filterTasks(items: TodoistTask[], config: PowerTodoistConfig): TodoistTask[] {
  return filterByPriority(filterByDueDate([...items] as TaskWithDuration[], config), config);
}

export function filterByDueDate(
  items: TaskWithDuration[],
  config: PowerTodoistConfig
): TaskWithDuration[] {
  if (config.sort_by_due_date !== undefined && config.sort_by_due_date !== false) {
    items.sort((a, b) => {
      if (!(a.due && b.due)) return 0;
      return config.sort_by_due_date === "ascending"
        ? new Date(a.due.date).getTime() - new Date(b.due.date).getTime()
        : new Date(b.due.date).getTime() - new Date(a.due.date).getTime();
    });
  }

  if (config.filter_show_dates_starting === undefined && config.filter_show_dates_ending === undefined) {
    return items;
  }

  let startCompare = Number(config.filter_show_dates_starting);
  let endCompare = Number(config.filter_show_dates_ending);

  if (typeof config.filter_show_dates_starting === "string" && !Number.isNaN(startCompare)) {
    startCompare = new Date().setHours(0, 0, 0, 0) + startCompare * 24 * 60 * 60 * 1000;
  } else {
    startCompare = Date.now() + startCompare * 60 * 60 * 1000;
  }

  if (typeof config.filter_show_dates_ending === "string" && !Number.isNaN(endCompare)) {
    endCompare = new Date().setHours(23, 59, 59, 999) + endCompare * 24 * 60 * 60 * 1000;
  } else {
    endCompare = Date.now() + endCompare * 60 * 60 * 1000;
  }

  return items.filter((item) => {
    if (!item.due) return config.filter_show_dates_empty !== false;

    const duration = getDurationMs(item);
    const [itemStart, itemEnd] = getDueDateWindow(item.due.date);

    if (Number.isNaN(endCompare) && duration) {
      startCompare -= duration;
      endCompare = Date.now();
    }

    const passStart = Number.isNaN(startCompare) || startCompare <= itemEnd;
    const passEnd = Number.isNaN(endCompare) || endCompare >= itemStart;
    return passStart && passEnd;
  });
}

export function filterByPriority<T extends TodoistTask>(items: T[], config: PowerTodoistConfig): T[] {
  if (config.sort_by_priority !== undefined && config.sort_by_priority !== false) {
    items.sort((a, b) => {
      if (!(a.priority && b.priority)) return 0;
      return config.sort_by_priority === "ascending"
        ? a.priority - b.priority
        : b.priority - a.priority;
    });
  }
  return items;
}

function getDurationMs(item: TaskWithDuration): number {
  if (!item.duration) return 0;
  return item.duration.unit === "day"
    ? item.duration.amount * 24 * 60 * 60 * 1000
    : item.duration.amount * 60 * 1000;
}

function getDueDateWindow(date: string): [number, number] {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return [
      new Date(`${date}T00:00:00`).getTime(),
      new Date(`${date}T23:59:59`).getTime(),
    ];
  }

  const timestamp = new Date(date).getTime();
  return [timestamp, timestamp];
}
