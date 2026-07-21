import type { HomeAssistant } from "../core/types";
import type { TodoistCommand } from "./todoist-commands";

export async function sendTodoistCommands(
  hass: HomeAssistant | undefined,
  commands: TodoistCommand[],
  entityId?: string
): Promise<void> {
  if (!hass || !commands.length) return;

  await hass.callService("rest_command", "todoist", {
    url: "sync",
    payload: `commands=${JSON.stringify(commands)}`,
  });

  if (entityId) {
    await hass.callService("homeassistant", "update_entity", {
      entity_id: entityId,
    });
  }
}

export async function sendTodoistAdds(
  hass: HomeAssistant | undefined,
  adds: string[]
): Promise<void> {
  if (!hass || !adds.length) return;

  await Promise.all(adds.map((item) =>
    hass.callService("rest_command", "todoist", {
      url: "quick/add",
      payload: `text=${item}`,
    })
  ));
}

export async function sendTodoistQuickTask(
  hass: HomeAssistant | undefined,
  text: string,
  entityId?: string
): Promise<void> {
  if (!hass || !text) return;

  await hass.callService("rest_command", "todoist", {
    url: "tasks/quick",
    payload: `text=${text}`,
  });

  if (entityId) {
    await hass.callService("homeassistant", "update_entity", {
      entity_id: entityId,
    });
  }
}

export async function triggerHomeAssistantService(
  hass: HomeAssistant | undefined,
  service: string | undefined,
  entityId?: string
): Promise<void> {
  if (!hass || !service) return;

  const isScript = service.includes("script.");
  await hass.callService(
    isScript ? "homeassistant" : "automation",
    isScript ? "turn_on" : "trigger",
    { entity_id: service }
  );

  if (entityId) {
    await hass.callService("homeassistant", "update_entity", {
      entity_id: entityId,
    });
  }
}
