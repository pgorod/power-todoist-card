export const TODOIST_COMMANDS = {
  ITEM_ADD: "item_add",
  ITEM_UPDATE: "item_update",
  ITEM_DELETE: "item_delete",
  ITEM_COMPLETE: "item_close",
  ITEM_UNCOMPLETE: "item_uncomplete",
  ITEM_MOVE: "item_move",
} as const;

export type TodoistCommandType = (typeof TODOIST_COMMANDS)[keyof typeof TODOIST_COMMANDS];

export interface TodoistCommand {
  type: TodoistCommandType;
  temp_id?: string;
  uuid?: string;
  args: Record<string, unknown>;
}
