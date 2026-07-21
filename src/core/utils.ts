export function replaceMultiple(
  value: unknown,
  replacements: Record<string, string>,
  was = "",
  input = ""
): unknown {
  if (typeof value !== "string") return value;

  const map: Record<string, string> = {
    ...Object.fromEntries(
      Object.entries(replacements).map(([key, replacement]) => [key.toLowerCase(), replacement])
    ),
    "%was%": was,
    "%input%": input,
    "%line%": "\n",
  };

  const pattern = new RegExp(Object.keys(map).join("|"), "gi");
  return value.replace(pattern, (matched) => map[matched.toLowerCase()] ?? matched);
}

export function getTemporaryId(prefix = "temp"): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function getUUID(): string {
  const date = new Date();
  return `${Math.floor(Math.random() * 99 + 1)}-${Number(date)}-${date.getMilliseconds()}`;
}
