import { PowerTodoistCard } from "./power-todoist-card";
import { PowerTodoistCardEditor } from "./power-todoist-card-editor";

const CARD_TYPE = "powertodoist-card";
const EDITOR_TYPE = "powertodoist-card-editor";
const REGISTRY_FLAG = "__powerTodoistCardRegistered";

declare global {
  interface Window {
    customCards?: Array<{
      preview: boolean;
      type: string;
      name: string;
      description: string;
    }>;
    [REGISTRY_FLAG]?: boolean;
  }
}

export function registerPowerTodoistCard(): void {
  if (!customElements.get(EDITOR_TYPE)) {
    customElements.define(EDITOR_TYPE, PowerTodoistCardEditor);
  }

  if (!customElements.get(CARD_TYPE)) {
    customElements.define(CARD_TYPE, PowerTodoistCard);
  }

  if (!window[REGISTRY_FLAG]) {
    window.customCards = window.customCards || [];
    window.customCards.push({
      preview: true,
      type: CARD_TYPE,
      name: "PowerTodoist Card",
      description: "Todoist card for Home Assistant.",
    });
    window[REGISTRY_FLAG] = true;
  }

  console.info(
    "%c POWERTODOIST-CARD ",
    "color: white; background: #007d8f; font-weight: 700"
  );
}
