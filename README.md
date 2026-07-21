# PowerTodoist Card

[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/hacs/integration)
![hacs_badge](https://img.shields.io/github/v/release/pgorod/power-todoist-card)
![hacs_badge](https://img.shields.io/github/license/pgorod/power-todoist-card)

PowerTodoist Card is a [Home Assistant](https://www.home-assistant.io/) Lovelace card for displaying and controlling Todoist project tasks.

This `dev-ts` version is a TypeScript/Lit refactor of the original `pgorod/power-todoist-card` card. The public card name and YAML surface stay compatible:

```yaml
type: custom:powertodoist-card
```

The card does not call Todoist directly from the browser. Home Assistant reads Todoist through REST sensors, and the card writes changes through `rest_command.todoist`.

This project uses the Todoist API but is not created by, affiliated with, or supported by Doist.

## What Is Different In The TypeScript Version

- Native TypeScript/Lit source code.
- No runtime dependency on the old monolithic JavaScript implementation.
- Home Assistant `ha-form` visual editor support.
- Todoist API v1 sensor and command examples.
- Optimistic UI updates: the card updates immediately, shows a spinner while saving, and rolls back if the server call fails.
- PGR YAML compatibility for filters, labels, dates, actions, markdown, styles, icons, and subtasks.
- Automated tests for the main card behavior and helper modules.

## Installation

### HACS

When this branch is released through HACS, install `PowerTodoist Card` from HACS as usual.

### Manual

1. Download `powertodoist-card.js` from the release or build output.
2. Copy it into your Home Assistant config folder, for example:

   ```text
   /config/www/community/powertodoist-card/powertodoist-card.js
   ```

3. In Home Assistant, go to:

   ```text
   Settings -> Dashboards -> 3 dots -> Resources -> Add resource
   ```

4. Add:

   ```text
   /local/community/powertodoist-card/powertodoist-card.js
   ```

   Resource type:

   ```text
   JavaScript Module
   ```

5. Add a card to a dashboard using either the UI editor or manual YAML.

## Home Assistant Todoist Setup

PowerTodoist needs Home Assistant entities with Todoist data in their attributes.

The expected Todoist project sensor shape is:

```text
sensor.your_project
  state: Todoist project id
  attributes.project
  attributes.tasks
  attributes.sections
```

If the sensor is `unavailable`, or if its only attribute is `friendly_name`, Home Assistant has not loaded Todoist data yet. The card will show a waiting message instead of rendering tasks.

### Project Sensor

Add one REST sensor per Todoist project:

```yaml
sensor:
  - name: todoist_project_demo
    platform: rest
    unique_id: todoist_project_demo
    method: GET
    resource: "https://api.todoist.com/api/v1/projects/TODOIST_PROJECT_ID/full"
    headers:
      Authorization: !secret todoist_api_token
      Accept: application/json
    value_template: "{{ value_json.project.id }}"
    json_attributes:
      - project
      - tasks
      - sections
    scan_interval: 30
```

Replace `TODOIST_PROJECT_ID` with the id from your Todoist project URL.

Example Todoist URLs:

```text
https://todoist.com/app/project/TODOIST_PROJECT_ID
https://todoist.com/app/project/project-name-TODOIST_PROJECT_ID
```

### Project Comments Sensor

Todoist API v1 exposes project comments separately. Configure this if you use `%project_notes%` variables:

```yaml
sensor:
  - name: comments_project_demo
    platform: rest
    unique_id: comments_project_demo
    method: GET
    resource: "https://api.todoist.com/api/v1/comments"
    params:
      project_id: "TODOIST_PROJECT_ID"
    headers:
      Authorization: !secret todoist_api_token
      Accept: application/json
    value_template: "{{ value_json.results | length }}"
    json_attributes:
      - results
    scan_interval: 10
```

Then reference it from the card:

```yaml
comments_entity: sensor.comments_project_demo
```

### Label Colors Sensor

PowerTodoist can color labels using Todoist label colors:

```yaml
command_line:
  - sensor:
      name: label_colors
      command: !secret todoist_cmd_with_api_token
      value_template: "{{ value_json.label_colors | length }}"
      json_attributes:
        - label_colors
      scan_interval: 200
```

If `sensor.label_colors` is missing, the card still works and falls back to default label colors.

### REST Command

Task changes are sent through this Home Assistant REST command:

```yaml
rest_command:
  todoist:
    method: post
    url: "https://api.todoist.com/api/v1/{{ url }}"
    payload: "{{ payload }}"
    headers:
      Authorization: !secret todoist_api_token
    content_type: "application/x-www-form-urlencoded"
```

### Secrets

Add this to `secrets.yaml`:

```yaml
todoist_api_token: "Bearer TODOIST_API_TOKEN"
todoist_cmd_with_api_token: >
  printf '{"label_colors":%s}\n' "$(
    curl -s https://api.todoist.com/api/v1/labels \
      -H 'Authorization: Bearer TODOIST_API_TOKEN' \
      -H 'Accept: application/json' | jq '.results'
  )"
```

Replace `TODOIST_API_TOKEN` with your private Todoist API token from:

```text
Todoist -> Settings -> Integrations -> Developer
```

## Adding The Card

### UI Editor

1. Go to a Home Assistant dashboard.
2. Click the 3 dots in the top-right corner.
3. Click `Edit dashboard`.
4. Click `Add card`.
5. Search for `PowerTodoist Card`.
6. Select the Todoist project sensor in `Entity`.
7. Use the visual fields for common options, or switch to YAML for advanced actions.

### Basic YAML

```yaml
type: custom:powertodoist-card
entity: sensor.todoist_project_demo
show_header: true
show_completed: 5
show_item_add: true
use_quick_add: false
```

### Section Card

```yaml
type: custom:powertodoist-card
entity: sensor.todoist_project_demo
filter_section: "Today"
show_header: true
```

### Tasks Without A Section

Use `!*` to show only tasks that are not inside a Todoist section:

```yaml
type: custom:powertodoist-card
entity: sensor.todoist_project_demo
filter_section: "!*"
```

## Configuration Options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | string | required | Must be `custom:powertodoist-card`. |
| `entity` | string | required | Home Assistant Todoist project sensor. |
| `comments_entity` | string | none | Optional comments sensor used for `%project_notes%`. |
| `name` | string | none | Explicit card title. |
| `friendly_name` | string | `Todoist` | Friendly card title. Overrides section-derived title. |
| `show_header` | boolean | `true` | Show the card header. |
| `show_completed` | number | `5` | Number of recently completed tasks shown in the undo area. Use `0` to disable. |
| `show_item_add` | boolean | `true` | Show the add-task input. |
| `show_item_close` | boolean | `true` | Show complete/uncomplete controls. |
| `show_item_delete` | boolean | `true` | Show delete controls. |
| `show_item_description` | boolean | `true` | Show Todoist task descriptions. |
| `show_item_labels` | boolean | `true` | Show task labels. Generated `extra_labels` can still show when this is `false`. |
| `show_card_labels` | boolean | `true` | Show a single filtered label beside the card title. |
| `show_dates` | boolean | `false` | Render task due dates as labels. |
| `show_relative_day` | boolean | `false` | Add relative text such as `(Today)` or `(Tomorrow)` to titles derived from day sensors. |
| `relative_day_entity` | string | `sensor.dow` | Entity used by `show_relative_day`. |
| `use_quick_add` | boolean | `false` | Use Todoist Quick Add when creating tasks from the input. |
| `filter_section_id` | string/number | none | Show only tasks from a Todoist section id. |
| `filter_section` | string | none | Show only tasks from a Todoist section name. Use `!*` for no-section tasks. |
| `filter_labels` | list | none | Include/exclude tasks by labels. See filtering below. |
| `filter_show_dates_starting` | string/number | none | Start of the due-date visibility window. |
| `filter_show_dates_ending` | string/number | none | End of the due-date visibility window. |
| `filter_show_dates_empty` | boolean | `true` | Whether tasks without due dates pass the date filter. |
| `sort_by_due_date` | string/boolean | none | `ascending` or `descending`. |
| `sort_by_priority` | string/boolean | none | `ascending` or `descending`. |
| `date_format` | string | `dd-mmm H'h'MM` | Date display format. Named masks such as `isoDate` are supported. |
| `extra_labels` | list | none | Render virtual labels or calculated label summaries. |
| `status_from_labels` | list | none | Determine the displayed status icon from labels instead of Todoist completion state. |
| `icons` | list | built-in icons | Icon names from the MDI library, without `mdi:`. Supports optional color suffixes. |
| `markdown_top_content` | string | none | Markdown rendered above the task list. |
| `markdown_bottom_content` | string | none | Markdown rendered below the task list. |
| `accent` | string | none | CSS color for the card left accent border. |
| `style` | string | none | Custom CSS injected into the card shadow DOM. |
| `line_size` | number | `40` | Base task row height in pixels. |
| `font_size` | number | `16` | Task text font size in pixels. |
| `icon_size` | number | `24` | Icon size in pixels. |
| `line_padding_top` | number | `0` | Extra row top padding in pixels. |
| `line_padding_bottom` | number | `0` | Extra row bottom padding in pixels. |

## Label Colors

Todoist labels are rendered using `sensor.label_colors` when available.

If a Todoist label is named with an `_outline` suffix, for example `urgent_outline`, the card renders it as `urgent` with outline styling.

## Filtering By Labels

`filter_labels` supports inclusion, exclusion, any-label, and no-label matching.

| Example | Meaning |
| --- | --- |
| `- "Blue"` | Show tasks with the `Blue` label. |
| `- "!Done"` | Hide tasks with the `Done` label. |
| `- "*"` | Show tasks that have any label. |
| `- "!*"` | Show tasks that have no labels. |
| `- "%user%"` | Show tasks labelled with the current Home Assistant user name. |

Multiple include filters are treated as alternatives. Exclusion filters always win.

Example:

```yaml
filter_labels:
  - "!Hidden"
  - "%user%"
  - "Important"
```

This shows tasks that are not labelled `Hidden` and that have either the current user's label or the `Important` label.

When filtering by exactly one visible label, the card can show that label in the header instead of repeating it under every task.

## Extra Labels

`extra_labels` creates virtual labels that do not exist in Todoist.

Static label:

```yaml
extra_labels:
  - "Home"
```

List labels that are present on the task:

```yaml
extra_labels:
  - "People: alice+bob+charlie"
```

If a task has labels `alice` and `charlie`, the card shows:

```text
People: alice, charlie
```

Count matching labels:

```yaml
extra_labels:
  - "Done: +alice+bob+charlie"
```

If two labels match, the card shows:

```text
Done: 2
```

This is useful for household meal counters, attendance lists, and multi-user task workflows.

## Status From Labels

`status_from_labels` lets labels decide whether a task looks done.

```yaml
actions_close:
  - label:
      - ":%user%"
status_from_labels:
  - "%user%"
```

With this setup, tapping the task toggles the current Home Assistant user's label. If the label is present, the task uses the "done" status icon. If the label is absent, it uses the "not done" status icon.

This does not need to complete the task in Todoist. It is useful when several users must mark their own status on the same Todoist task.

## Icons

Icons are MDI names without the `mdi:` prefix.

Default slots:

```yaml
icons:
  - checkbox-marked-circle-outline
  - circle-medium
  - plus-outline
  - trash-can-outline
  - checkbox-marked-circle-outline
  - checkbox-blank-circle-outline
```

Slot meaning:

| Index | Meaning |
| --- | --- |
| `0` | Complete/check icon. |
| `1` | Incomplete/bullet icon. |
| `2` | Add/uncomplete icon. |
| `3` | Delete icon. |
| `4` | `status_from_labels` true icon. |
| `5` | `status_from_labels` false icon. |

You can add colors using `icon-name:color`.

Todoist color names:

```yaml
icons:
  - "checkbox-marked-circle-outline:green"
  - "circle-medium:grey"
  - "plus-outline:blue"
  - "trash-can-outline:red"
```

CSS colors and CSS variables also work:

```yaml
icons:
  - "checkbox-marked-circle-outline:#149514"
  - "circle-medium:var(--secondary-text-color)"
```

## Date Display And Filtering

### Showing Dates

```yaml
show_dates: true
date_format: "dd-mmm H'h'MM"
```

Due dates are rendered as generated labels before real Todoist labels.

Supported named masks include:

```text
default
shortDate
mediumDate
longDate
fullDate
shortTime
mediumTime
longTime
isoDate
isoTime
isoDateTime
isoUtcDateTime
```

Custom masks support tokens such as `dd`, `mmm`, `yyyy`, `HH`, `MM`, and quoted literal text.

### Filtering Dates

PowerTodoist date filters define a moving time window relative to now.

| Option | Meaning |
| --- | --- |
| `filter_show_dates_starting` | Start of the date window. |
| `filter_show_dates_ending` | End of the date window. |
| `filter_show_dates_empty` | Whether tasks without due dates are included. |

Numbers are interpreted as hours.

```yaml
filter_show_dates_ending: 24
```

Strings that contain a number are interpreted as days.

```yaml
filter_show_dates_ending: "5"
```

Common examples:

```yaml
# Today or overdue
filter_show_dates_ending: "0"
```

```yaml
# Due in the next five days
filter_show_dates_ending: "5"
```

```yaml
# Hide tasks without a due date
filter_show_dates_empty: false
```

## Relative Day Titles

The TypeScript branch supports an optional relative day suffix for dashboards built around weekday sections.

```yaml
show_relative_day: true
relative_day_entity: sensor.dow
```

When enabled, the card compares the section/title against the configured sensor and adds labels such as:

```text
(Yesterday)
(Today)
(Tomorrow)
(Day after tomorrow)
```

This is optional and not required for normal Todoist project cards.

## Markdown Content

You can render markdown above or below the task list:

```yaml
markdown_top_content: |
  ## Hello {{ user }}

  Current mode: **{{ states('input_select.mode') }}**

markdown_bottom_content: |
  Project note: `{{ state_attr('sensor.comments_project_demo', 'results') }}`
```

Supported markdown:

- headings
- paragraphs
- unordered lists
- ordered lists
- bold
- emphasis
- inline code
- links
- line breaks

Supported template expressions:

```text
{{ user }}
{{ states('sensor.entity') }}
{{ state_attr('sensor.entity', 'attribute') }}
{{ now().strftime('%d-%b-%Y') }}
```

Raw HTML is escaped before markdown rendering.

## Actions

Almost every user interaction can be configured.

### User Events

| Event | Trigger | Default |
| --- | --- | --- |
| `actions_close` | Tap the close/check icon. | Complete the task in Todoist. |
| `actions_dbl_close` | Double tap the close/check icon. | Nothing. |
| `actions_longpress_close` | Long press the close/check icon. | Nothing. |
| `actions_content` | Tap task content text. | Prompt and update task content. |
| `actions_dbl_content` | Double tap task content text. | Nothing. |
| `actions_longpress_content` | Long press task content text. | Nothing. |
| `actions_description` | Tap task description text. | Prompt and update task description. |
| `actions_dbl_description` | Double tap task description text. | Nothing. |
| `actions_longpress_description` | Long press task description text. | Nothing. |
| `actions_label` | Tap any rendered task label. | Nothing. |
| `actions_dbl_label` | Double tap any rendered task label. | Nothing. |
| `actions_longpress_label` | Long press any rendered task label. | Nothing. |
| `actions_delete` | Tap the delete icon. | Delete the task in Todoist. |
| `actions_dbl_delete` | Double tap the delete icon. | Nothing. |
| `actions_longpress_delete` | Long press the delete icon. | Nothing. |
| `actions_uncomplete` | Tap the undo icon in the completed area. | Uncomplete the task in Todoist. |
| `actions_dbl_uncomplete` | Double tap the undo icon. | Nothing. |
| `actions_longpress_uncomplete` | Long press the undo icon. | Nothing. |
| `actions_*` | Custom subroutine called from `match`. | Nothing. |

If you define an action list for an event, the default event action is replaced. Add `close`, `delete`, or `uncomplete` explicitly if you still want the default command.

### Action Verbs

| Verb | Meaning |
| --- | --- |
| `close` | Complete the task in Todoist. |
| `delete` | Delete the task in Todoist. |
| `uncomplete` | Uncomplete a recently completed task. |
| `move` | Move the task to the next Todoist section. From the last section, move it back to the project/no-section area. |
| `update` | Update Todoist task fields. |
| `label` | Add, remove, toggle, or clear task labels. |
| `add` | Send Quick Add text to Todoist. |
| `service` | Trigger a Home Assistant automation or script. |
| `allow` | Restrict an action to selected Home Assistant user names. |
| `confirm` | Ask for confirmation before running. |
| `toast` | Show a temporary message. |
| `match` | Conditionally run custom `actions_*` subroutines. |
| `prompt_texts` | Configure prompt title/default value for `%input%`. |
| `emphasis` | Temporarily add visual emphasis to a task. |

### Label Actions

```yaml
actions_close:
  - label:
      - "Work"
      - "!Old"
      - ":%user%"
```

Label prefixes:

| Prefix | Meaning |
| --- | --- |
| none | Add the label. |
| `!` | Remove the label. |
| `:` | Toggle the label. |
| `!*` | Clear all labels. |
| `!_` | Clear labels starting with `_`. |
| `!!` | Clear labels except labels starting with `_`. |

### Updating Task Fields

```yaml
actions_content:
  - prompt_texts: "Insert new name:|%content%"
  - update:
      - content: "%input%"
      - description: "Changed from %was% by %user%"
      - priority: 3
```

Supported update fields:

```text
content
description
due
priority
collapsed
assigned_by_uid
responsible_uid
day_order
```

### Confirm Before Delete

```yaml
actions_delete:
  - confirm: "Delete this task?"
  - delete
```

### Move To Next Section

```yaml
actions_close:
  - move
```

This is useful for kanban-style dashboards with one card per section.

### Trigger Home Assistant

```yaml
actions_label:
  - service: automation.notify_todoist_change
```

Scripts are called with `homeassistant.turn_on`; automations are called with `automation.trigger`.

### Match And Custom Actions

```yaml
actions_close:
  - match:
      - ["labels", "ready", "mark_done"]
      - ["input_boolean.todoist_mode", "on", "mode_on", "mode_off"]

actions_mark_done:
  - label:
      - "done"
  - toast: "Marked done"

actions_mode_on:
  - service: automation.todoist_mode_on

actions_mode_off:
  - service: automation.todoist_mode_off
```

`match` can check task fields, Home Assistant entity states, or Home Assistant attributes using `entity#attribute`.

## Variables

Variables are replaced in config strings where supported.

| Variable | Meaning |
| --- | --- |
| `%user%` | Current Home Assistant user name. |
| `%date%` | Current date formatted with `date_format`. |
| `%section%` | Current section name. |
| `%project_notes%` | First project comment/note. |
| `%project_notes_0%`, `%project_notes_1%` | Specific project comments/notes by index. |
| `%input%` | Value returned by a prompt. |
| `%was%` | Previous value of the field being updated. |
| `%line%` | New line character. |
| `%str_labels%` | JSON string of the task labels. |
| `%content%`, `%description%`, etc. | Primitive task fields can be referenced by field name. |

## Optimistic UI And Rollback

When a user runs a task action, the card updates immediately:

- complete moves the task to the completed/undo area immediately
- uncomplete returns the task to the active list immediately
- delete removes the task immediately
- content and description edits update text immediately
- label changes appear immediately
- move actions update the local section immediately
- every pending task shows a spinner while saving

If Todoist or Home Assistant returns an error, the card restores the previous local state and shows:

```text
Could not save. Reverted.
```

## Add Task Input

The add input is shown by default.

```yaml
show_item_add: true
```

Default mode sends a Todoist sync `item_add` command.

```yaml
use_quick_add: false
```

Quick Add mode sends Todoist Quick Add text and appends the current section and project when missing:

```yaml
use_quick_add: true
```

## Adding Tasks From Home Assistant Automations

You can also create Todoist tasks from normal Home Assistant automations:

```yaml
service: rest_command.todoist
data:
  url: quick/add
  payload: "text=Auto created at ({{ now().strftime('%H:%M') }}) #myproject @mylabel"
```

Todoist Quick Add text can include:

- due dates
- `#project`
- `@label`
- `+assignee`
- `/section`
- `// description`
- priority such as `p2`

Test the Quick Add text inside Todoist first when building complex automations.

## Styling

### Accent

```yaml
accent: "#149514"
```

### Sizing

```yaml
line_size: 44
font_size: 16
icon_size: 24
line_padding_top: 2
line_padding_bottom: 2
```

### Custom CSS

```yaml
style: |
  .label-fill {
    font-weight: 600;
  }
```

The CSS is injected into the card shadow DOM. Keep overrides scoped and test them after Home Assistant frontend updates.

## Subtasks

Subtask indentation is intentionally partial, matching the original card's lightweight behavior.

The card detects parent task ids from:

```text
parent_id
parentId
parent.id
parent
```

Subtasks are indented based on the visible task list. Filtering or sorting can separate a child from its parent; if that happens, the card cannot reconstruct the full tree.

## Examples

### Personal Label Toggle

```yaml
type: custom:powertodoist-card
entity: sensor.todoist_project_demo
actions_close:
  - label:
      - ":%user%"
status_from_labels:
  - "%user%"
```

### Household Meal Count

```yaml
type: custom:powertodoist-card
entity: sensor.todoist_project_weekdays
comments_entity: sensor.comments_project_weekdays
filter_section: "Saturday"
show_item_labels: false
actions_close:
  - label:
      - ":%user%"
status_from_labels:
  - "%user%"
extra_labels:
  - "Normal: +alice+bob+charlie"
  - "Vegetarian: +veggie_alice+veggie_bob"
```

### Kanban With Swipe Card

```yaml
type: custom:swipe-card
cards:
  - type: custom:powertodoist-card
    entity: sensor.todoist_project_demo
    filter_section: "Backlog"
    actions_close:
      - move
  - type: custom:powertodoist-card
    entity: sensor.todoist_project_demo
    filter_section: "Doing"
    actions_close:
      - move
  - type: custom:powertodoist-card
    entity: sensor.todoist_project_demo
    filter_section: "Done"
```

## Troubleshooting

### The Card Says The Todoist Sensor Has No Data

Check the entity in:

```text
Developer Tools -> States
```

If the sensor is `unavailable`, or if it only has `friendly_name`, the REST sensor did not load Todoist data. Fix or refresh the Home Assistant sensor first.

You can manually refresh the project sensor:

```yaml
service: homeassistant.update_entity
data:
  entity_id: sensor.todoist_project_demo
```

### I See No Tasks

Check:

- `entity` points to the correct sensor
- `attributes.tasks` or `attributes.items` exists
- `filter_section` or `filter_section_id` matches Todoist data
- `filter_labels` is not excluding everything
- date filters are not hiding future/undated tasks

### Clicking Does Nothing

Check:

- `rest_command.todoist` exists
- the Todoist token includes `Bearer `
- Home Assistant logs do not show Todoist API errors
- browser console has no custom-card loading errors

## Development

Install dependencies:

```bash
npm install
```

Run checks:

```bash
npm run typecheck
npm run build
```

Build output:

```text
dist/powertodoist-card.js
powertodoist-card.js
```

`powertodoist-card.js` in the repository root is the file HACS/manual installs load.

## Project Structure

```text
src/
  main.ts
  card/
    power-todoist-card.ts
    power-todoist-card-editor.ts
    register.ts
  core/
    config.ts
    config-parser.ts
    hass-entities.ts
    types.ts
    utils.ts
  features/
    card-visuals.ts
    day-title.ts
    due-dates.ts
    markdown-template.ts
    subtasks.ts
    task-filters.ts
    task-icons.ts
    task-labels.ts
    task-selection.ts
    todoist-actions.ts
  todoist/
    colors.ts
    todoist-commands.ts
    todoist-service.ts
```

## License

This project is licensed under the MIT license.

Copyright for portions of project PowerTodoist Card are held by [Konstantin Grinkevich](https://github.com/grinstantin) as part of project Todoist Card. Other copyright is held by [pgorod](https://github.com/pgorod) and contributors.
