export interface HomeAssistant {
  user: {
    name: string;
  };
  states: Record<string, HassEntity>;
  callService: (
    domain: string,
    service: string,
    data?: Record<string, unknown>
  ) => Promise<unknown>;
}

export interface HassEntity {
  entity_id?: string;
  state: string;
  attributes: Record<string, unknown>;
}

export interface PowerTodoistConfig {
  type?: string;
  entity: string;
  comments_entity?: string;
  name?: string;
  friendly_name?: string;

  show_header?: boolean;
  show_completed?: number;
  show_item_add?: boolean;
  show_item_close?: boolean;
  show_item_delete?: boolean;
  show_item_description?: boolean;
  show_item_labels?: boolean;
  show_card_labels?: boolean;
  show_dates?: boolean;
  show_relative_day?: boolean;
  relative_day_entity?: string;
  use_quick_add?: boolean;
  markdown_top_content?: string;
  markdown_bottom_content?: string;
  accent?: string;
  style?: string;

  line_size?: number;
  font_size?: number;
  icon_size?: number;
  line_padding_top?: number;
  line_padding_bottom?: number;
  icons?: string[];

  filter_section_id?: string | number;
  filter_section?: string;
  filter_labels?: string[];
  filter_show_dates_starting?: string | number;
  filter_show_dates_ending?: string | number;
  filter_show_dates_empty?: boolean;
  sort_by_due_date?: string | boolean;
  sort_by_priority?: string | boolean;

  extra_labels?: string[];
  status_from_labels?: string[];
  date_format?: string;

  [key: string]: unknown;
}

export interface TodoistProject {
  id: string;
  name?: string;
}

export interface TodoistSection {
  id: string;
  name: string;
  order?: number;
  section_order?: number;
}

export interface TodoistTask {
  id: string;
  content: string;
  description?: string;
  labels?: string[];
  project_id?: string;
  section_id?: string | null;
  priority?: number;
  due?: {
    date: string;
    datetime?: string;
    string?: string;
    timezone?: string;
  };
  checked?: boolean;
  completed_at?: string | null;
  pending?: boolean;
  [key: string]: unknown;
}

export interface TodoistLabelColor {
  name: string;
  color: string;
}

export interface TodoistComment {
  id?: string;
  content: string;
}

export type PowerTodoistActionName =
  | "close"
  | "dbl_close"
  | "longpress_close"
  | "content"
  | "dbl_content"
  | "longpress_content"
  | "description"
  | "dbl_description"
  | "longpress_description"
  | "label"
  | "dbl_label"
  | "longpress_label"
  | "delete"
  | "dbl_delete"
  | "longpress_delete"
  | "uncomplete"
  | "dbl_uncomplete"
  | "longpress_uncomplete";

export interface PowerTodoistActionConfig {
  type?: string;
  update?: Record<string, unknown>[];
  label?: string[];
  move?: boolean;
  add?: string[];
  allow?: string[];
  match?: unknown[];
  toast?: string | string[];
  confirm?: string;
  prompt_texts?: string;
  emphasis?: string;
  service?: string;
}

export type PowerTodoistActionDefinition =
  | string
  | {
      label?: string[];
      update?: Record<string, unknown>[];
      toast?: string | string[];
      move?: boolean;
      add?: string[];
      service?: string;
      allow?: string[];
      confirm?: string;
      prompt_texts?: string;
      match?: unknown[];
      emphasis?: string | string[];
    };
