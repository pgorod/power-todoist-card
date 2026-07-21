import type { PowerTodoistConfig, TodoistTask } from "../core/types";

const DATE_LABEL_PREFIX = "🗓";

const DATE_FORMAT_MASKS: Record<string, string> = {
  default: "ddd mmm dd yyyy HH:MM:ss",
  shortDate: "m/d/yy",
  mediumDate: "mmm d, yyyy",
  longDate: "mmmm d, yyyy",
  fullDate: "dddd, mmmm d, yyyy",
  shortTime: "h:MM TT",
  mediumTime: "h:MM:ss TT",
  longTime: "h:MM:ss TT Z",
  isoDate: "yyyy-mm-dd",
  isoTime: "HH:MM:ss",
  isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
  isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",
};

const DAY_NAMES = [
  "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DATE_FORMAT_TOKEN =
  /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g;

export function getDueDateLabel(
  task: TodoistTask,
  config: PowerTodoistConfig
): string | undefined {
  if (!config.show_dates || !task.due) return undefined;
  return formatDueDate(task.due.datetime ?? task.due.date, config.date_format);
}

export function isDueDateLabel(label: string): boolean {
  return label.startsWith(DATE_LABEL_PREFIX);
}

export function formatDueDate(
  dueDate: string,
  configFormat?: string
): string {
  const mask = configFormat || "dd-mmm H'h'MM";
  return `${DATE_LABEL_PREFIX}${formatDate(dueDate, mask)}`;
}

export function formatDate(
  dateValue: string | Date,
  mask: string,
  utc = false
): string {
  let resolvedMask = DATE_FORMAT_MASKS[mask] || mask || DATE_FORMAT_MASKS.default;
  if (resolvedMask.startsWith("UTC:")) {
    resolvedMask = resolvedMask.slice(4);
    utc = true;
  }

  const date = parseDate(dateValue);
  if (Number.isNaN(date.getTime())) throw new SyntaxError("invalid date");

  const getter = utc ? "getUTC" : "get";
  const dayOfMonth = date[`${getter}Date`]();
  const dayOfWeek = date[`${getter}Day`]();
  const month = date[`${getter}Month`]();
  const year = date[`${getter}FullYear`]();
  const hours = date[`${getter}Hours`]();
  const minutes = date[`${getter}Minutes`]();
  const seconds = date[`${getter}Seconds`]();
  const milliseconds = date[`${getter}Milliseconds`]();
  const offset = utc ? 0 : date.getTimezoneOffset();

  const flags: Record<string, string | number> = {
    d: dayOfMonth,
    dd: pad(dayOfMonth),
    ddd: DAY_NAMES[dayOfWeek],
    dddd: DAY_NAMES[dayOfWeek + 7],
    m: month + 1,
    mm: pad(month + 1),
    mmm: MONTH_NAMES[month],
    mmmm: MONTH_NAMES[month + 12],
    yy: String(year).slice(2),
    yyyy: year,
    h: hours % 12 || 12,
    hh: pad(hours % 12 || 12),
    H: hours,
    HH: pad(hours),
    M: minutes,
    MM: pad(minutes),
    s: seconds,
    ss: pad(seconds),
    l: pad(milliseconds, 3),
    L: pad(milliseconds > 99 ? Math.round(milliseconds / 10) : milliseconds),
    t: hours < 12 ? "a" : "p",
    tt: hours < 12 ? "am" : "pm",
    T: hours < 12 ? "A" : "P",
    TT: hours < 12 ? "AM" : "PM",
    Z: utc ? "UTC" : getTimezoneName(date),
    o: `${offset > 0 ? "-" : "+"}${pad(Math.floor(Math.abs(offset) / 60) * 100 + Math.abs(offset) % 60, 4)}`,
    S: ["th", "st", "nd", "rd"][
      dayOfMonth % 10 > 3 ? 0 : Number((dayOfMonth % 100) - (dayOfMonth % 10) !== 10) * (dayOfMonth % 10)
    ],
  };

  return resolvedMask.replace(DATE_FORMAT_TOKEN, (token) =>
    token in flags ? String(flags[token]) : token.slice(1, token.length - 1)
  );
}

function parseDate(dateValue: string | Date): Date {
  if (dateValue instanceof Date) return dateValue;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return new Date(`${dateValue}T00:00:00`);
  return new Date(dateValue);
}

function pad(value: string | number, length = 2): string {
  let result = String(value);
  while (result.length < length) result = `0${result}`;
  return result;
}

function getTimezoneName(date: Date): string {
  return (String(date).match(/\b(?:GMT|UTC)(?:[-+]\d{4})?\b/g) || [""]).pop()?.replace(/[^-+\dA-Z]/g, "") ?? "";
}
