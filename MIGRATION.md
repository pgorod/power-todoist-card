# Migration Guide

## Migrating To 2.0.0

PowerTodoist Card `2.0.0` is the TypeScript/Lit refactor of the original card.

The custom card type stays the same:

```yaml
type: custom:powertodoist-card
```

Most existing YAML card configurations should continue to work. The main migration requirement is the Todoist API v1 Home Assistant sensor setup.

## Todoist API v1 Sensors

The card expects a project sensor with Todoist data in attributes:

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

If the entity is `unavailable`, or if it only has `friendly_name`, fix the Home Assistant sensor first. The card cannot render tasks until Home Assistant has loaded the Todoist attributes.

## Project Comments

Todoist API v1 exposes project comments separately. If your YAML uses `%project_notes%`, add a comments sensor:

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

## REST Command

Task writes use the Todoist API v1 REST command:

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

## Secrets

```yaml
todoist_api_token: "Bearer TODOIST_API_TOKEN"
todoist_cmd_with_api_token: >
  printf '{"label_colors":%s}\n' "$(
    curl -s https://api.todoist.com/api/v1/labels \
      -H 'Authorization: Bearer TODOIST_API_TOKEN' \
      -H 'Accept: application/json' | jq '.results'
  )"
```

## What Changed Internally

- The runtime card is now TypeScript/Lit.
- The old monolithic JavaScript implementation is no longer imported.
- The visual editor uses Home Assistant `ha-form`.
- Task actions use optimistic UI updates with spinner and rollback on failure.
- The root `powertodoist-card.js` remains the HACS/manual install artifact.

See `README.md` for full configuration examples.
