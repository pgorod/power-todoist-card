# PowerTodoist Migration from API v9/v2 to v1

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

Remember to replace that `TODOIST_API_TOKEN` with your actual secret token. 
You can check the main README for detailed instructions on how to get it; but if you're really migrating, 
you already have it in your `secrets.yaml` file.

## 2. Changes in `sensors.yaml`

Project notes (now project comments) no longer come with the GET request for project data. A second sensor is now required to capture project comments.
I'm afraid you must add this new sensor even if you don't plan to use Project notes, because the card is expecting it to be there.

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

## 4. Add Comments Entity to Card Configuration
```yaml
comments_entity: 'sensor.your_comments_sensor_unique_id'
```

## 5. Test the sensors separately from the card❗

1. Restart Home Assistant after making the above changes.
2. Go to `Developer Tools` / `States` and try accessing your new sensors. You should see your data there. If it's not, fix the sensor definitions and restart and wait a minute or so for the data to appear.
3. Only after you see your data in the sensors, check that your card is showing the data as intended on the dashboards.
