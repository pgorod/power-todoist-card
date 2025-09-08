# Powertodoist migration from API v9/v2 to v1 

The todoist API has changed from v9/v2 to v1. With that, there are a few alterations that need to be handled.

1- Changes in `configuration.yaml`.
    Changed url in rest_command:

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

2-Changes in `secrets.yaml`.
    Changed todoist_cmd_with_api_token:

    ```yaml
    todoist_cmd_with_api_token: >
        printf '{"label_colors":%s}\n' "$(
            curl -s https://api.todoist.com/api/v1/labels \
                -H 'Authorization: Bearer TODOIST_API_TOKEN' \
                -H 'Accept: application/json' | jq '.results'
        )"
    ```

3-Changes to `sensors.yaml`.
    Now the project notes (now project comments) no longer come with the GET request our main sensor to get project data. For this reason, we created a second sensor that captures the project comments. for this reason, we now have two sensor definitions:

    ```yaml
    # 1) Full project (v1 /projects/<id>/full)
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

    # -------------------------------------------------------------
    # 2) Project comments (formerly project_notes)
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

    CAREFUL WITH CHANGING THE NAME OF THE SECOND SENSOR (`comments_sensor`). This is because in powertodoist-card.js we no longer access it by accessing the main sensor (this.config.entity), but we access it directly through the name `comments_sensor`. 
 
