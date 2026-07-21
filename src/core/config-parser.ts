import type { HomeAssistant, PowerTodoistConfig } from "./types";
import { getProjectNotes } from "./hass-entities";
import { replaceMultiple } from "./utils";

export function parsePowerTodoistConfig(
  config: PowerTodoistConfig,
  hass: HomeAssistant | undefined
): PowerTodoistConfig {
  const replacements = getConfigReplacements(config, hass);

  Object.keys(replacements).forEach((key) => {
    const value = replacements[key];
    if (/%[a-zA-Z0-9_-]+%/.test(value)) {
      replacements[key] = replaceMultiple(value, replacements) as string;
    }
  });

  const json = replaceMultiple(JSON.stringify(config), escapeJsonReplacements(replacements));
  if (typeof json !== "string") return config;

  try {
    return JSON.parse(json) as PowerTodoistConfig;
  } catch {
    return config;
  }
}

function getConfigReplacements(
  config: PowerTodoistConfig,
  hass: HomeAssistant | undefined
): Record<string, string> {
  const replacements: Record<string, string> = {
    "%user%": hass?.user?.name ?? "",
    "%section%": config.filter_section ?? "",
    "%date%": new Date().toISOString(),
    "%project_notes%": "",
  };

  getProjectNotes(hass, config).forEach((note, index) => {
    replacements[`%project_notes_${index}%`] = note.content;
    if (index === 0) replacements["%project_notes%"] = note.content;
  });

  const dayEntity = config.relative_day_entity ?? "sensor.dow";
  const days = hass?.states?.[dayEntity]?.state?.split(", ") ?? [];
  days.forEach((day, index) => {
    replacements[`%dow${index - 1}%`] = day?.replaceAll("'", "") ?? "";
  });

  return replacements;
}

function escapeJsonReplacements(replacements: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(replacements).map(([key, value]) => [key, JSON.stringify(value).slice(1, -1)])
  );
}
