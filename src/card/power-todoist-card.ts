import { LitElement, css, html, nothing } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import type { HassEntity, HomeAssistant, PowerTodoistConfig, TodoistTask } from "../core/types";
import { parsePowerTodoistConfig } from "../core/config-parser";
import { getEntityTasks, getLabelColors } from "../core/hass-entities";
import { filterTasks } from "../features/task-filters";
import { formatRelativeDayTitle } from "../features/day-title";
import { isDueDateLabel } from "../features/due-dates";
import { renderMarkdownTemplate } from "../features/markdown-template";
import {
  applyStatusFromLabels,
  getDisplayLabels,
  parseDisplayLabel,
  type TodoistTaskWithStatus,
} from "../features/task-labels";
import { extractCardLabels, filterBySection, getCardName, getSectionId } from "../features/task-selection";
import { getCardClass, getCardStyle } from "../features/card-visuals";
import { getConfiguredIcon, getTaskIcon, type IconConfig } from "../features/task-icons";
import { getParentId, getTaskDepth, getTaskDepths } from "../features/subtasks";
import { buildTodoistAction, type BuiltTodoistAction } from "../features/todoist-actions";
import { getTodoistColor, isValidTodoistColor } from "../todoist/colors";
import { TODOIST_COMMANDS, type TodoistCommand } from "../todoist/todoist-commands";
import {
  sendTodoistAdds,
  sendTodoistCommands,
  sendTodoistQuickTask,
  triggerHomeAssistantService,
} from "../todoist/todoist-service";

interface CardContext {
  config: PowerTodoistConfig;
  entity?: HassEntity;
  title: string;
  tasks: TodoistTaskWithStatus[];
  taskDepths: Map<string, number>;
  cardLabels: string[];
  labelColors: Map<string, string>;
  rawLabelColors: Array<{ name: string; color: string }>;
}

export class PowerTodoistCard extends LitElement {
  static readonly properties = {
    hass: { attribute: false },
    config: { state: true },
  };

  hass?: HomeAssistant;
  private config?: PowerTodoistConfig;
  private optimisticTasks?: TodoistTask[];
  private itemsJustCompleted: TodoistTask[] = [];
  private pendingTaskIds = new Set<string>();
  private emphasizedTaskIds = new Set<string>();
  private toast?: { message: string; tone: "success" | "error" };
  private toastTimeout?: number;
  private longPressTimer?: number;
  private clickTimer?: number;
  private clickCount = 0;
  private readonly longPressMs = 1500;
  private readonly clickDelayMs = 500;

  static readonly styles = css`
    ha-card {
      overflow: hidden;
    }

    ha-card.left-accent {
      border-left: 6px solid var(--pt-accent-color);
      padding-left: 0;
      margin-left: 0;
    }

    .card {
      padding: 22px 28px 18px;
    }

    .top-markdown,
    .bottom-markdown {
      margin: -6px 0 16px;
      color: var(--secondary-text-color);
      font-size: 13px;
      line-height: 1.35;
    }

    .bottom-markdown {
      margin: 18px 0 0;
    }

    .title {
      margin: 0 0 22px;
      font-size: var(--pt-title-font-size, 24px);
      font-weight: 500;
      line-height: 1.2;
      color: var(--primary-text-color);
    }

    .title-labels {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-left: 8px;
      vertical-align: middle;
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: var(--pt-row-gap, 12px);
    }

    .completed-list {
      margin-top: 18px;
      padding-top: 14px;
      border-top: 1px solid var(--divider-color);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .add-task-input {
      width: 100%;
      box-sizing: border-box;
      margin-top: 18px;
      padding: 10px 0;
      border: 0;
      border-bottom: 1px solid var(--divider-color);
      outline: 0;
      background: transparent;
      color: var(--primary-text-color);
      font: inherit;
      font-size: var(--pt-item-font-size, 16px);
    }

    .add-task-input::placeholder {
      color: var(--secondary-text-color);
      opacity: 0.8;
    }

    .add-task-input:focus {
      border-bottom-color: var(--primary-color, #149514);
    }

    .task {
      display: grid;
      grid-template-columns: 30px minmax(0, 1fr) auto;
      align-items: start;
      column-gap: 12px;
      min-height: calc(var(--pt-item-line-size, 40px) + var(--pt-line-padding-top, 0px) + var(--pt-line-padding-bottom, 0px));
      padding-top: var(--pt-line-padding-top, 0px);
      padding-bottom: var(--pt-line-padding-bottom, 0px);
      margin-left: calc(var(--pt-subtask-indent, 28px) * var(--pt-task-depth, 0));
      box-sizing: border-box;
    }

    .task.has-detail {
      padding-bottom: max(var(--pt-line-padding-bottom, 0px), 4px);
    }

    .task.done .icon {
      color: var(--pt-complete-icon-color, #149514);
    }

    .icon-button {
      width: var(--pt-icon-size, 24px);
      height: var(--pt-icon-size, 24px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding-top: 1px;
      cursor: pointer;
      border: 0;
      background: transparent;
      color: var(--pt-incomplete-icon-color, #149514);
      margin: 0;
      padding-left: 0;
      padding-right: 0;
    }

    .icon {
      width: var(--pt-icon-size, 24px);
      height: var(--pt-icon-size, 24px);
    }

    .task.pending {
      opacity: 0.68;
    }

    .task.pending .icon-button {
      color: var(--secondary-text-color);
    }

    .completed-task {
      opacity: 0.64;
    }

    .completed-task .name {
      text-decoration: line-through;
    }

    .completed-task .icon-button {
      color: var(--pt-uncomplete-icon-color, var(--secondary-text-color));
    }

    .task.emphasis {
      animation: pt-emphasis 0.65s ease-in-out 0s 2;
    }

    @keyframes pt-emphasis {
      50% {
        background: color-mix(in srgb, var(--primary-color, #149514) 14%, transparent);
      }
    }

    .spinner {
      width: calc(var(--pt-icon-size, 24px) - 6px);
      height: calc(var(--pt-icon-size, 24px) - 6px);
      border: 2px solid color-mix(in srgb, currentColor 25%, transparent);
      border-top-color: currentColor;
      border-radius: 50%;
      animation: pt-spin 0.75s linear infinite;
    }

    @keyframes pt-spin {
      to {
        transform: rotate(360deg);
      }
    }

    .content {
      min-width: 0;
    }

    .action-target {
      cursor: pointer;
    }

    .name {
      display: block;
      font-size: var(--pt-item-font-size, 16px);
      line-height: 1.25;
      color: var(--primary-text-color);
      white-space: normal;
      word-break: break-word;
      overflow-wrap: break-word;
    }

    .description {
      display: inline-block;
      margin-top: 3px;
      font-size: 0.86em;
      line-height: 1.25;
      color: var(--secondary-text-color);
      white-space: normal;
      word-break: break-word;
      overflow-wrap: break-word;
    }

    .labels {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 5px;
    }

    .label {
      display: inline-flex;
      align-items: center;
      min-height: 16px;
      padding: 1px 5px;
      border: 1px solid currentColor;
      border-radius: 3px;
      font-size: 11px;
      line-height: 1.2;
      color: var(--pt-label-color, #149514);
      background: transparent;
      cursor: pointer;
    }

    .delete-button {
      color: var(--pt-delete-icon-color, #db4437);
    }

    .label-fill {
      color: white;
      background: var(--pt-label-color, #149514);
      border-color: var(--pt-label-color, #149514);
    }

    .date-label {
      color: var(--primary-text-color);
    }

    .empty,
    .error {
      color: var(--secondary-text-color);
      font-size: 14px;
      line-height: 1.4;
    }

    .error {
      color: var(--error-color, #db4437);
    }

    .toast {
      position: absolute;
      right: 16px;
      bottom: 14px;
      max-width: calc(100% - 32px);
      padding: 8px 11px;
      border-radius: 6px;
      background: var(--card-background-color, white);
      border: 1px solid var(--divider-color);
      color: var(--primary-text-color);
      box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgb(0 0 0 / 18%));
      font-size: 13px;
      line-height: 1.25;
      z-index: 1;
    }

    .toast.success {
      border-color: color-mix(in srgb, #149514 55%, var(--divider-color));
    }

    .toast.error {
      border-color: var(--error-color, #db4437);
      color: var(--error-color, #db4437);
    }
  `;

  setConfig(config: PowerTodoistConfig): void {
    if (!config?.entity) throw new Error("PowerTodoistCard: entity is required");
    this.config = {
      show_header: true,
      show_completed: 5,
      show_item_add: true,
      show_item_description: true,
      show_item_labels: true,
      ...config,
    };
  }

  getCardSize(): number {
    if (!this.hass || !this.config?.entity) return 1;
    return getEntityTasks(this.hass.states[this.config.entity]).length || 1;
  }

  static getConfigElement(): HTMLElement {
    return document.createElement("powertodoist-card-editor");
  }

  static getStubConfig(): PowerTodoistConfig {
    return { entity: "" };
  }

  protected render() {
    let context: CardContext;

    try {
      context = this.computeContext();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return html`<ha-card><div class="card error">${message}</div></ha-card>`;
    }

    const todoistSensorReady = this.hasTodoistSensorData(context.entity);

    return html`
      <ha-card
        class=${this.getCardClass(context)}
        style=${this.getCardStyle(context)}
      >
        ${context.config.style ? html`<style>${context.config.style}</style>` : nothing}
        <div
          class="card"
        >
          ${todoistSensorReady ? this.renderHeader(context) : nothing}
          ${todoistSensorReady && context.config.markdown_top_content
            ? html`<div class="top-markdown">${unsafeHTML(this.renderMarkdownText(context.config.markdown_top_content))}</div>`
            : nothing}

          <div class="list">
            ${!todoistSensorReady
              ? html`<div class="empty">${this.getEmptyMessage(context)}</div>`
              : context.tasks.length
              ? context.tasks.map((task) => this.renderTask(task, context))
              : html`<div class="empty">${this.getEmptyMessage(context)}</div>`}
          </div>

          ${todoistSensorReady ? this.renderCompletedTasks(context) : nothing}
          ${todoistSensorReady ? this.renderAddTaskInput(context) : nothing}

          ${todoistSensorReady && context.config.markdown_bottom_content
            ? html`<div class="bottom-markdown">${unsafeHTML(this.renderMarkdownText(context.config.markdown_bottom_content))}</div>`
            : nothing}
        </div>
        ${this.toast
          ? html`<div class=${`toast ${this.toast.tone}`}>${this.toast.message}</div>`
          : nothing}
      </ha-card>
    `;
  }

  private computeContext(): CardContext {
    if (!this.config) throw new Error("PowerTodoistCard: config is not set");

    const parsedConfig = parsePowerTodoistConfig(this.config, this.hass);
    const entity = this.hass?.states?.[parsedConfig.entity];
    if (!entity) {
      return {
        config: parsedConfig,
        title: this.getFallbackTitle(parsedConfig),
        tasks: [],
        taskDepths: new Map(),
        cardLabels: [],
        labelColors: new Map(),
        rawLabelColors: [],
      };
    }

    const sectionId = getSectionId(parsedConfig, entity);
    const sourceTasks = this.getCurrentTasks(entity);
    const filteredByTaskConfig = filterTasks(sourceTasks, parsedConfig);
    const filteredTasks = filterBySection(filteredByTaskConfig, parsedConfig, sectionId);
    const cardLabels = extractCardLabels(parsedConfig, filteredTasks);
    const tasks = applyStatusFromLabels(filteredTasks, parsedConfig);
    const taskDepths = getTaskDepths(filteredTasks);
    const rawLabelColors = this.getRawLabelColors();

    return {
      config: parsedConfig,
      entity,
      title: this.getDisplayTitle(parsedConfig, entity, sectionId, this.config),
      tasks,
      taskDepths,
      cardLabels,
      labelColors: this.getLabelColorMap(rawLabelColors),
      rawLabelColors,
    };
  }

  private renderHeader(context: CardContext) {
    if (context.config.show_header === false) return nothing;

    return html`
      <h1 class="title">
        <span>${context.title}</span>
        ${this.renderCardLabels(context)}
      </h1>
    `;
  }

  private renderCardLabels(context: CardContext) {
    const labels = context.config.show_card_labels === false || context.cardLabels.length !== 1
      ? []
      : context.cardLabels;
    if (!labels.length) return nothing;

    return html`
      <span class="title-labels">
        ${labels.map((label) => this.renderStaticLabel(label, context))}
      </span>
    `;
  }

  private renderTask(task: TodoistTaskWithStatus, context: CardContext) {
    const labels = this.getVisibleLabels(task, context);

    return html`
      <div class=${this.getTaskClass(task, labels)} style=${this.getTaskStyle(task, context)}>
        ${this.renderCloseControl(task, context)}
        <div class="content">
          <span
            class="name action-target"
            @pointerdown=${() => this.startPress(task, context, "longpress_content")}
            @pointerup=${() => this.endPress(task, context, "content", "dbl_content")}
            @pointercancel=${() => this.cancelPress()}
            @pointerleave=${() => this.cancelPress()}
          >${task.content}</span>
          ${context.config.show_item_description === false || !task.description
            ? nothing
            : html`<span
                class="description action-target"
                @pointerdown=${() => this.startPress(task, context, "longpress_description")}
                @pointerup=${() => this.endPress(task, context, "description", "dbl_description")}
                @pointercancel=${() => this.cancelPress()}
                @pointerleave=${() => this.cancelPress()}
              >${task.description}</span>`}
          ${!this.shouldRenderLabels(context) || !labels.length
            ? nothing
            : html`<div class="labels">${labels.map((label) => this.renderLabel(label, task, context))}</div>`}
        </div>
        ${context.config.show_item_delete === false
          ? nothing
          : html`
              <button
                class="icon-button delete-button"
                type="button"
                title="Delete task"
                @pointerdown=${() => this.startPress(task, context, "longpress_delete")}
                @pointerup=${() => this.endPress(task, context, "delete", "dbl_delete")}
                @pointercancel=${() => this.cancelPress()}
                @pointerleave=${() => this.cancelPress()}
              >
                ${this.renderConfiguredIcon(context, 3)}
              </button>
            `}
      </div>
    `;
  }

  private renderCompletedTasks(context: CardContext) {
    if (!context.entity || !context.config.show_completed || !this.itemsJustCompleted.length) return nothing;

    return html`
      <div class="completed-list">
        ${this.itemsJustCompleted.map((task) => this.renderCompletedTask(task, context))}
      </div>
    `;
  }

  private renderCompletedTask(task: TodoistTask, context: CardContext) {
    const isPending = this.pendingTaskIds.has(task.id);
    const uncompleteIcon = isPending
      ? html`<span class="spinner" aria-label="Saving"></span>`
      : this.renderConfiguredIcon(context, 2);
    const deleteIcon = isPending
      ? html`<span class="spinner" aria-label="Saving"></span>`
      : this.renderConfiguredIcon(context, 3);

    return html`
      <div class=${this.getTaskClass(task, [], "completed-task")} style=${this.getTaskStyle(task, context)}>
        ${context.config.show_item_close === false
          ? html`<span class="icon-button">${this.renderConfiguredIcon(context, 0)}</span>`
          : html`
              <button
                class="icon-button"
                type="button"
                title="Uncomplete task"
                @pointerdown=${() => this.startPress(task, context, "longpress_uncomplete")}
                @pointerup=${() => this.endPress(task, context, "uncomplete", "dbl_uncomplete")}
                @pointercancel=${() => this.cancelPress()}
                @pointerleave=${() => this.cancelPress()}
              >
                ${uncompleteIcon}
              </button>
            `}
        <div class="content">
          <span class="name">${task.content}</span>
          ${context.config.show_item_description === false || !task.description
            ? nothing
            : html`<span class="description">${task.description}</span>`}
        </div>
        ${context.config.show_item_delete === false
          ? nothing
          : html`
              <button
                class="icon-button delete-button"
                type="button"
                title="Remove from completed list"
                @pointerdown=${() => this.startPress(task, context, "longpress_unlist_completed")}
                @pointerup=${() => this.endPress(task, context, "unlist_completed", "dbl_unlist_completed")}
                @pointercancel=${() => this.cancelPress()}
                @pointerleave=${() => this.cancelPress()}
              >
                ${deleteIcon}
              </button>
            `}
      </div>
    `;
  }

  private renderAddTaskInput(context: CardContext) {
    if (!context.entity || !this.hasTodoistSensorData(context.entity) || context.config.show_item_add === false) {
      return nothing;
    }

    return html`
      <input
        id="powertodoist-card-item-add"
        class="add-task-input"
        type="text"
        placeholder="New item..."
        enterkeyhint="enter"
        @keyup=${(event: KeyboardEvent) => this.handleAddTaskKeyup(event, context)}
      />
    `;
  }

  private renderCloseControl(task: TodoistTaskWithStatus, context: CardContext) {
    const icon = this.pendingTaskIds.has(task.id)
      ? html`<span class="spinner" aria-label="Saving"></span>`
      : this.renderTaskIcon(task, context);

    if (context.config.show_item_close === false) {
      return html`<span class="icon-button">${icon}</span>`;
    }

    return html`
      <button
        class="icon-button"
        type="button"
        title="Toggle task"
        @pointerdown=${() => this.startPress(task, context, "longpress_close")}
        @pointerup=${() => this.endPress(task, context, "close", "dbl_close")}
        @pointercancel=${() => this.cancelPress()}
        @pointerleave=${() => this.cancelPress()}
      >
        ${icon}
      </button>
    `;
  }

  private renderLabel(label: string, task: TodoistTaskWithStatus, context: CardContext) {
    const isDateLabel = isDueDateLabel(label);
    const parsedLabel = parseDisplayLabel(label);
    const isOutline = parsedLabel.isOutline;
    const cleanLabel = parsedLabel.text;
    const colorKey = cleanLabel.split(":")[0]?.trim() ?? cleanLabel;
    const color = isDateLabel
      ? "var(--primary-background-color)"
      : this.getLabelColor(parsedLabel.color) ??
        context.labelColors.get(cleanLabel) ??
        context.labelColors.get(colorKey) ??
        getTodoistColor("green");

    return html`
      <span
        class=${[
          isOutline ? "label" : "label label-fill",
          isDateLabel ? "date-label" : "",
        ].filter(Boolean).join(" ")}
        style=${`--pt-label-color: ${color}`}
        @pointerdown=${() => this.startPress(task, context, "longpress_label")}
        @pointerup=${() => this.endPress(task, context, "label", "dbl_label")}
        @pointercancel=${() => this.cancelPress()}
        @pointerleave=${() => this.cancelPress()}
      >
        ${cleanLabel}
      </span>
    `;
  }

  private renderStaticLabel(label: string, context: CardContext) {
    const parsedLabel = parseDisplayLabel(label);
    const isOutline = parsedLabel.isOutline;
    const cleanLabel = parsedLabel.text;
    const color = this.getLabelColor(parsedLabel.color) ??
      context.labelColors.get(label) ??
      context.labelColors.get(cleanLabel) ??
      getTodoistColor("green");

    return html`
      <span
        class=${isOutline ? "label" : "label label-fill"}
        style=${`--pt-label-color: ${color}`}
      >
        ${cleanLabel}
      </span>
    `;
  }

  private getLabelColor(color: string | undefined): string | undefined {
    if (!color) return undefined;
    return isValidTodoistColor(color) ? getTodoistColor(color) : color;
  }

  private getVisibleLabels(task: TodoistTask, context: CardContext): string[] {
    return getDisplayLabels(task, context.config, context.cardLabels, context.rawLabelColors);
  }

  private shouldRenderLabels(context: CardContext): boolean {
    return context.config.show_item_labels !== false || Boolean(context.config.extra_labels?.length);
  }

  private renderTaskIcon(task: TodoistTaskWithStatus, context: CardContext) {
    const icon = getTaskIcon(task, context.config);
    return this.renderIcon(icon);
  }

  private renderConfiguredIcon(context: CardContext, index: number) {
    return this.renderIcon(getConfiguredIcon(context.config, index));
  }

  private renderIcon(icon: IconConfig) {
    return html`
      <ha-icon
        class="icon"
        icon=${`mdi:${icon.name}`}
        style=${icon.color ? `color: ${icon.color}` : ""}
      ></ha-icon>
    `;
  }

  private getTaskClass(task: TodoistTaskWithStatus, labels: string[] = [], extraClass = ""): string {
    return [
      "task",
      extraClass,
      getParentId(task) ? "subtask" : "",
      task.description || labels.length ? "has-detail" : "",
      task.statusFromLabelCriteria ? "done" : "",
      this.pendingTaskIds.has(task.id) ? "pending" : "",
      this.emphasizedTaskIds.has(task.id) ? "emphasis" : "",
    ].filter(Boolean).join(" ");
  }

  private getTaskStyle(task: TodoistTask, context: CardContext): string {
    return `--pt-task-depth: ${getTaskDepth(task, context.taskDepths)};`;
  }

  private getCardClass(context: CardContext): string {
    return getCardClass(context.config);
  }

  private getCardStyle(context: CardContext): string {
    return getCardStyle(context.config);
  }

  private getEmptyMessage(context: CardContext): string {
    if (!this.hasTodoistSensorData(context.entity)) {
      return "Powertodoist sensors don't have any data yet. Please wait a few seconds and refresh. [todoist sensor]";
    }

    return "No uncompleted tasks!";
  }

  private hasTodoistSensorData(entity: HassEntity | undefined): boolean {
    const attributes = entity?.attributes ?? {};
    return [
      "project",
      "tasks",
      "items",
      "sections",
      "project_sections",
      "results",
      "result",
      "data",
    ].some((key) => key in attributes);
  }

  private getRawLabelColors(): Array<{ name: string; color: string }> {
    try {
      return getLabelColors(this.hass).filter((entry): entry is { name: string; color: string } => {
        if (!entry || typeof entry !== "object") return false;
        const label = entry as { name?: unknown; color?: unknown };
        return typeof label.name === "string" && typeof label.color === "string";
      });
    } catch {
      return [];
    }
  }

  private getLabelColorMap(rawLabelColors: Array<{ name: string; color: string }>): Map<string, string> {
    const colors = new Map<string, string>();

    rawLabelColors.forEach((label) => {
      const color = isValidTodoistColor(label.color) ? getTodoistColor(label.color) : undefined;
      if (color) colors.set(label.name, color);
    });

    return colors;
  }

  private renderMarkdownText(value: string) {
    return renderMarkdownTemplate(value, this.hass);
  }

  private getDisplayTitle(
    config: PowerTodoistConfig,
    entity: HassEntity,
    sectionId: string | number | undefined,
    rawConfig: PowerTodoistConfig
  ): string {
    const title = getCardName(config, entity, sectionId);
    return config.show_relative_day
      ? formatRelativeDayTitle(title, this.hass, {
        entityId: config.relative_day_entity,
        sourceToken: rawConfig.filter_section,
      })
      : title;
  }

  private getFallbackTitle(config: PowerTodoistConfig): string {
    return config.name as string || config.friendly_name || config.filter_section || "ToDoist";
  }

  private getCurrentTasks(entity: HassEntity): TodoistTask[] {
    return this.optimisticTasks ?? getEntityTasks(entity);
  }

  private startPress(task: TodoistTaskWithStatus, context: CardContext, longPressActionName: string): void {
    this.longPressTimer = window.setTimeout(() => {
      this.longPressTimer = undefined;
      this.clickCount = 0;
      if (this.clickTimer) window.clearTimeout(this.clickTimer);
      this.clickTimer = undefined;
      void this.executeTaskAction(task, context, longPressActionName);
    }, this.longPressMs);
  }

  private endPress(
    task: TodoistTaskWithStatus,
    context: CardContext,
    clickActionName: string,
    doubleClickActionName = ""
  ): void {
    if (!this.longPressTimer) return;

    window.clearTimeout(this.longPressTimer);
    this.longPressTimer = undefined;
    this.clickCount += 1;

    if (this.clickCount === 1) {
      if (!doubleClickActionName) {
        this.clickCount = 0;
        void this.executeTaskAction(task, context, clickActionName);
        return;
      }

      this.clickTimer = window.setTimeout(() => {
        this.clickCount = 0;
        this.clickTimer = undefined;
        void this.executeTaskAction(task, context, clickActionName);
      }, this.clickDelayMs);
      return;
    }

    if (this.clickCount === 2) {
      if (this.clickTimer) window.clearTimeout(this.clickTimer);
      this.clickTimer = undefined;
      this.clickCount = 0;
      void this.executeTaskAction(task, context, doubleClickActionName);
    }
  }

  private cancelPress(): void {
    if (this.longPressTimer) {
      window.clearTimeout(this.longPressTimer);
      this.longPressTimer = undefined;
    }
  }

  private async executeTaskAction(
    task: TodoistTaskWithStatus,
    context: CardContext,
    actionName: string,
    ignorePending = false
  ): Promise<void> {
    if (!context.entity) return;

    if (actionName.endsWith("unlist_completed")) {
      if (!ignorePending && this.pendingTaskIds.has(task.id)) return;
      const beforeCompleted = [...this.itemsJustCompleted];
      this.pendingTaskIds.add(task.id);
      this.removeCompletedTask(task);
      this.requestUpdate();

      try {
        await this.hass?.callService("homeassistant", "update_entity", {
          entity_id: context.config.entity,
        });
      } catch (error) {
        this.itemsJustCompleted = beforeCompleted;
        this.showToast("Could not save. Reverted.", "error");
        console.warn("[PowerTodoist] completed-list action failed, reverted optimistic update", error);
      } finally {
        this.pendingTaskIds.delete(task.id);
        this.requestUpdate();
      }
      return;
    }

    const before = this.getCurrentTasks(context.entity);
    const beforeCompleted = [...this.itemsJustCompleted];
    const action = buildTodoistAction(task, context.config, this.hass, `actions_${actionName}`, {
      prompt: (question, defaultValue) => window.prompt(question, defaultValue),
    });
    const hasWork =
      action.commands.length ||
      action.adds.length ||
      action.followUpActions.length ||
      action.service ||
      action.emphasis?.length;
    if (!hasWork) return;
    if (!ignorePending && this.pendingTaskIds.has(task.id)) return;
    if (action.confirm && !window.confirm(action.confirm)) return;

    this.pendingTaskIds.add(task.id);
    this.applyEmphasis(task, action.emphasis);
    this.applyOptimisticAction(task, before, action, context.config);
    this.requestUpdate();

    try {
      if (action.commands.length) {
        await sendTodoistCommands(this.hass, action.commands, context.config.entity);
      }
      await sendTodoistAdds(this.hass, action.adds);
      await triggerHomeAssistantService(this.hass, action.service, context.config.entity);
      const followUpTask = this.getOptimisticTaskById(task.id) ?? action.optimisticTask ?? task;
      await Promise.all(action.followUpActions.map((followUpAction) =>
        this.executeTaskAction(followUpTask as TodoistTaskWithStatus, context, followUpAction, true)
      ));
      if (action.toast || action.commands.length || action.adds.length || action.service) {
        this.showToast(action.toast || "Saved", "success");
      }
    } catch (error) {
      this.optimisticTasks = before;
      this.itemsJustCompleted = beforeCompleted;
      this.showToast("Could not save. Reverted.", "error");
      console.warn("[PowerTodoist] Todoist action failed, reverted optimistic update", error);
    } finally {
      this.pendingTaskIds.delete(task.id);
      this.requestUpdate();
    }
  }

  private async handleAddTaskKeyup(event: KeyboardEvent, context: CardContext): Promise<void> {
    if (event.key !== "Enter" && event.which !== 13) return;
    if (!context.entity) return;

    const input = event.currentTarget as HTMLInputElement | null;
    const value = input?.value ?? "";
    if (value.length <= 1) return;

    try {
      if (context.config.use_quick_add) {
        await sendTodoistQuickTask(
          this.hass,
          this.buildQuickAddText(value, context, context.entity),
          context.config.entity
        );
      } else {
        await sendTodoistCommands(
          this.hass,
          [this.buildItemAddCommand(value, context.entity)],
          context.config.entity
        );
      }

      if (input) input.value = "";
      this.showToast("Saved", "success");
    } catch (error) {
      this.showToast("Could not save.", "error");
      console.warn("[PowerTodoist] Todoist add task failed", error);
    }
  }

  private buildItemAddCommand(content: string, entity: HassEntity) {
    const uuid = this.getUUID();
    return {
      type: TODOIST_COMMANDS.ITEM_ADD,
      temp_id: uuid,
      uuid,
      args: {
        project_id: entity.state,
        content,
      },
    };
  }

  private buildQuickAddText(content: string, context: CardContext, entity: HassEntity): string {
    let quickAddText = content;
    const sectionName = context.config.filter_section;
    const projectName = this.getProjectName(entity);

    if (sectionName && !quickAddText.includes(" /")) {
      quickAddText += ` /${this.escapeQuickAddToken(sectionName)}`;
    }

    if (projectName && !quickAddText.includes(" #")) {
      quickAddText += ` #${this.escapeQuickAddToken(projectName)}`;
    }

    return quickAddText;
  }

  private getProjectName(entity: HassEntity): string | undefined {
    const project = entity.attributes?.project;
    return project && typeof project === "object" && "name" in project
      ? String((project as { name?: unknown }).name ?? "")
      : undefined;
  }

  private escapeQuickAddToken(value: string): string {
    return value.replaceAll(" ", "\\ ");
  }

  private getUUID(): string {
    const date = new Date();
    return `${Math.floor(Math.random() * 99 + 1)}-${Number(date)}-${date.getMilliseconds()}`;
  }

  private applyEmphasis(task: TodoistTask, emphasis: string[] | undefined): void {
    if (!emphasis?.length) return;
    this.emphasizedTaskIds.add(task.id);
    this.requestUpdate();
    window.setTimeout(() => {
      this.emphasizedTaskIds.delete(task.id);
      this.requestUpdate();
    }, 3000);
  }

  private applyCommandSideEffects(
    task: TodoistTask,
    before: TodoistTask[],
    commands: Array<{ type: string }>,
    config: PowerTodoistConfig
  ): TodoistTask[] {
    const commandTypes = commands.map((command) => command.type);

    if (commandTypes.includes(TODOIST_COMMANDS.ITEM_COMPLETE)) {
      this.rememberCompletedTask(task, config.show_completed ?? 5);
      return before.filter((item) => item.id !== task.id);
    }

    if (commandTypes.includes(TODOIST_COMMANDS.ITEM_UNCOMPLETE)) {
      this.removeCompletedTask(task);
      return this.upsertTask(before, {
        ...task,
        checked: false,
        completed_at: null,
      });
    }

    if (commandTypes.includes(TODOIST_COMMANDS.ITEM_DELETE)) {
      this.removeCompletedTask(task);
      return before.filter((item) => item.id !== task.id);
    }

    return before;
  }

  private applyOptimisticAction(
    task: TodoistTask,
    before: TodoistTask[],
    action: BuiltTodoistAction,
    config: PowerTodoistConfig
  ): void {
    let nextTasks = before;
    const optimisticTask = action.optimisticTask ?? task;

    if (action.optimisticTask) {
      nextTasks = this.upsertTask(nextTasks, action.optimisticTask);
    }

    if (action.commands.length) {
      nextTasks = this.applyCommandSideEffects(optimisticTask, nextTasks, action.commands, config);
    }

    if (nextTasks !== before) {
      this.optimisticTasks = nextTasks;
    }
  }

  private getOptimisticTaskById(taskId: string): TodoistTask | undefined {
    return this.optimisticTasks?.find((task) => task.id === taskId);
  }

  private rememberCompletedTask(task: TodoistTask, maxCompleted: number): void {
    if (maxCompleted <= 0) return;
    const withoutTask = this.itemsJustCompleted.filter((item) => item.id !== task.id);
    this.itemsJustCompleted = [...withoutTask, task].slice(-maxCompleted);
  }

  private removeCompletedTask(task: TodoistTask): void {
    this.itemsJustCompleted = this.itemsJustCompleted.filter((item) => item.id !== task.id);
  }

  private upsertTask(tasks: TodoistTask[], task: TodoistTask): TodoistTask[] {
    return tasks.some((item) => item.id === task.id)
      ? tasks.map((item) => item.id === task.id ? task : item)
      : [...tasks, task];
  }

  private showToast(message: string, tone: "success" | "error"): void {
    if (this.toastTimeout) window.clearTimeout(this.toastTimeout);
    this.toast = { message, tone };
    this.requestUpdate();
    this.toastTimeout = window.setTimeout(() => {
      this.toast = undefined;
      this.requestUpdate();
    }, tone === "error" ? 4500 : 2200);
  }
}
