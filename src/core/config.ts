export function getConfigValue<T>(
  config: Record<string, unknown> | undefined,
  key: string,
  defaultValue: T
): T {
  return config && config[key] !== undefined ? (config[key] as T) : defaultValue;
}

export function isNumeric(value: unknown): boolean {
  return !Number.isNaN(Number.parseFloat(String(value))) && Number.isFinite(Number(value));
}

