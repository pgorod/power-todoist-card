export const todoistColors = {
  berry_red: "rgb(184, 37, 111)",
  red: "rgb(219, 64, 53)",
  orange: "rgb(255, 153, 51)",
  yellow: "rgb(250, 208, 0)",
  olive_green: "rgb(175, 184, 59)",
  lime_green: "rgb(126, 204, 73)",
  green: "rgb(41, 148, 56)",
  mint_green: "rgb(106, 204, 188)",
  teal: "rgb(21, 143, 173)",
  sky_blue: "rgb(20, 170, 245)",
  light_blue: "rgb(150, 195, 235)",
  blue: "rgb(64, 115, 255)",
  grape: "rgb(136, 77, 255)",
  violet: "rgb(175, 56, 235)",
  lavender: "rgb(235, 150, 235)",
  magenta: "rgb(224, 81, 148)",
  salmon: "rgb(255, 141, 133)",
  charcoal: "rgb(128, 128, 128)",
  grey: "rgb(184, 184, 184)",
  taupe: "rgb(204, 172, 147)",
  black: "rgb(0, 0, 0)",
  white: "rgb(255, 255, 255)",
} as const;

export type TodoistColorName = keyof typeof todoistColors;

export function getTodoistColor(key: string | undefined, fallback: TodoistColorName = "grey"): string {
  if (key && isValidTodoistColor(key)) return todoistColors[key];
  return todoistColors[fallback];
}

export function isValidTodoistColor(value: unknown): value is TodoistColorName {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(todoistColors, value)
  );
}
