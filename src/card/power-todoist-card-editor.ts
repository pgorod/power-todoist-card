import { LitElement, html } from "lit";
import type { HomeAssistant, PowerTodoistConfig } from "../core/types";

type HaFormSchema = Record<string, unknown>;

const COMPLETED_COUNT_OPTIONS = Array.from({ length: 16 }, (_value, index) => ({
  value: index,
  label: String(index),
}));

const SORT_OPTIONS = [
  { value: "ascending", label: "Ascending" },
  { value: "descending", label: "Descending" },
];

export const POWER_TODOIST_EDITOR_SCHEMA: HaFormSchema[] = [
  { name: "entity", label: "Entity (required)", required: true, selector: { entity: { domain: "sensor" } } },
  { name: "comments_entity", label: "Comments entity", selector: { entity: { domain: "sensor" } } },
  { name: "name", label: "Name", selector: { text: {} } },
  { name: "friendly_name", label: "Friendly name", selector: { text: {} } },

  { name: "show_header", label: "Show header", selector: { boolean: {} } },
  {
    name: "show_completed",
    label: "Completed tasks shown at bottom",
    selector: { select: { options: COMPLETED_COUNT_OPTIONS, mode: "dropdown" } },
  },
  { name: "show_item_add", label: "Show add-task input", selector: { boolean: {} } },
  { name: "use_quick_add", label: "Use Todoist Quick Add", selector: { boolean: {} } },
  { name: "show_item_close", label: "Show complete/uncomplete buttons", selector: { boolean: {} } },
  { name: "show_item_delete", label: "Show delete buttons", selector: { boolean: {} } },
  { name: "show_item_description", label: "Show item descriptions", selector: { boolean: {} } },
  { name: "show_item_labels", label: "Show item labels", selector: { boolean: {} } },
  { name: "show_card_labels", label: "Show card labels", selector: { boolean: {} } },

  { name: "filter_section", label: "Filter section", selector: { text: {} } },
  { name: "filter_section_id", label: "Filter section id", selector: { text: {} } },
  { name: "filter_labels", label: "Filter labels", selector: { object: {} } },
  { name: "filter_show_dates_starting", label: "Date filter start", selector: { text: {} } },
  { name: "filter_show_dates_ending", label: "Date filter end", selector: { text: {} } },
  { name: "filter_show_dates_empty", label: "Show tasks without due date", selector: { boolean: {} } },
  { name: "sort_by_due_date", label: "Sort by due date", selector: { select: { options: SORT_OPTIONS } } },
  { name: "sort_by_priority", label: "Sort by priority", selector: { select: { options: SORT_OPTIONS } } },

  { name: "show_dates", label: "Show due dates", selector: { boolean: {} } },
  { name: "date_format", label: "Date format", selector: { text: {} } },
  { name: "show_relative_day", label: "Show relative day title", selector: { boolean: {} } },
  { name: "relative_day_entity", label: "Relative day entity", selector: { entity: { domain: "sensor" } } },

  { name: "extra_labels", label: "Extra labels", selector: { object: {} } },
  { name: "status_from_labels", label: "Status from labels", selector: { object: {} } },
  { name: "icons", label: "Icons", selector: { object: {} } },

  { name: "markdown_top_content", label: "Top markdown", selector: { text: { multiline: true } } },
  { name: "markdown_bottom_content", label: "Bottom markdown", selector: { text: { multiline: true } } },
  { name: "accent", label: "Accent color", selector: { text: {} } },
  { name: "style", label: "Custom CSS", selector: { text: { multiline: true } } },

  { name: "line_size", label: "Line size", selector: { number: { min: 16, max: 120, mode: "box" } } },
  { name: "font_size", label: "Font size", selector: { number: { min: 8, max: 48, mode: "box" } } },
  { name: "icon_size", label: "Icon size", selector: { number: { min: 8, max: 64, mode: "box" } } },
  { name: "line_padding_top", label: "Line padding top", selector: { number: { min: 0, max: 48, mode: "box" } } },
  { name: "line_padding_bottom", label: "Line padding bottom", selector: { number: { min: 0, max: 48, mode: "box" } } },

  { name: "actions_close", label: "Actions: close", selector: { object: {} } },
  { name: "actions_dbl_close", label: "Actions: double close", selector: { object: {} } },
  { name: "actions_longpress_close", label: "Actions: longpress close", selector: { object: {} } },
  { name: "actions_content", label: "Actions: content", selector: { object: {} } },
  { name: "actions_description", label: "Actions: description", selector: { object: {} } },
  { name: "actions_label", label: "Actions: label", selector: { object: {} } },
  { name: "actions_delete", label: "Actions: delete", selector: { object: {} } },
  { name: "actions_uncomplete", label: "Actions: uncomplete", selector: { object: {} } },
];

const KEEP_EMPTY_FIELDS = new Set(["entity", "show_completed"]);

export class PowerTodoistCardEditor extends LitElement {
  static readonly properties = {
    hass: { attribute: false },
    config: { state: true },
  };

  hass?: HomeAssistant;
  private config?: PowerTodoistConfig;

  setConfig(config: PowerTodoistConfig): void {
    this.config = config;
  }

  protected render() {
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${POWER_TODOIST_EDITOR_SCHEMA}
        @value-changed=${this.handleValueChanged}
      ></ha-form>
    `;
  }

  private handleValueChanged(event: CustomEvent): void {
    this.config = normalizeEditorConfig(event.detail.value);
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this.config },
        bubbles: true,
        composed: true,
      })
    );
  }
}

export function normalizeEditorConfig(config: PowerTodoistConfig): PowerTodoistConfig {
  return Object.fromEntries(
    Object.entries(config).filter(([key, value]) =>
      KEEP_EMPTY_FIELDS.has(key) || value !== ""
    )
  ) as PowerTodoistConfig;
}
