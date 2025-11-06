# Powertodoist Migration from API v9/v2 to v1

The Todoist API has changed from v9/v2 to v1. Here are the necessary alterations to handle this migration:

## 1. Changes in `secrets.yaml`

Updated `todoist_cmd_with_api_token`:
```yaml
todoist_cmd_with_api_token: >
    printf '{"label_colors":%s}\n' "$(
        curl -s https://api.todoist.com/api/v1/labels \
            -H 'Authorization: Bearer TODOIST_API_TOKEN' \
            -H 'Accept: application/json' | jq '.results'
    )"
```

## 2. Changes in `sensors.yaml`

Project notes (now project comments) no longer come with the GET request for project data. A second sensor is now required to capture project comments.

### Main Project Sensor
```yaml
# Full project (v1 /projects/<id>/full)
- platform: rest
  name: main_sensor_name
  unique_id: main_sensor_name
  method: GET
  resource: "https://api.todoist.com/api/v1/projects/TODOIST_PROJECT_ID/full"
  headers:
      Authorization: !secret todoist_api_token     # must include "Bearer <token>" inside the secret
      Accept: application/json
  value_template: "{{ value_json.project.id }}"
  json_attributes:
      - project
      - tasks
      - sections
  scan_interval: 10
```

### Project Comments Sensor
```yaml
# Project comments (formerly project_notes)
- platform: rest
  name: comments_sensor
  unique_id: comments_sensor
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

## 3. Changes in `configuration.yaml`

### Update REST Command URL
```yaml
rest_command:
    todoist:
        method: post
        url: 'https://api.todoist.com/api/v1/{{ url }}'
        payload: '{{ payload }}'
        headers:
            Authorization: !secret todoist_api_token
            content_type: 'application/x-www-form-urlencoded'
```

### Add Comments Entity to Card Configuration
```yaml
comments_entity: 'sensor.your_comments_sensor_unique_id'
```
