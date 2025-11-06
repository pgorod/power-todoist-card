//import {LitElement, html, css, unsafeCSS } from 'https://unpkg.com/lit-element@3.3.2/lit-element.js?module';
import {LitElement, html, css, unsafeCSS} from "https://cdn.jsdelivr.net/npm/lit-element@2.4.0/+esm?module";
//import { renderTemplate } from 'ha-nunjucks';
// registering with HACS: https://hacs.xyz/docs/publish/start
import { marked } from 'https://cdn.skypack.dev/marked@4.0.0';
const todoistColors = {
    "berry_red" : "rgb(184, 37, 111)",
    "red" : "rgb(219, 64, 53)",
    "orange" : "rgb(255, 153, 51)",
    "yellow" : "rgb(250, 208, 0)",
    "olive_green" : "rgb(175, 184, 59)",
    "lime_green" : "rgb(126, 204, 73)",
    "green" : "rgb(41, 148, 56)",
    "mint_green" : "rgb(106, 204, 188)",
    "teal" : "rgb(21, 143, 173)",
    "sky_blue" : "rgb(20, 170, 245)",
    "light_blue" : "rgb(150, 195, 235)",
    "blue" : "rgb(64, 115, 255)",
    "grape" : "rgb(136, 77, 255)",
    "violet" : "rgb(175, 56, 235)",
    "lavender" : "rgb(235, 150, 235)",
    "magenta" : "rgb(224, 81, 148)",
    "salmon" : "rgb(255, 141, 133)",
    "charcoal" : "rgb(128, 128, 128)",
    "grey" : "rgb(184, 184, 184)",
    "taupe" : "rgb(204, 172, 147)",
}
 
function replaceMultiple(str2Replace, mapReplaces, was, input){
    mapReplaces["%was%"] = was;
    mapReplaces["%input%"] = input;
    //mapReplaces["%input%"] = renderTemplate(this.hass, "{{ 'ding' }}");
    mapReplaces["%line%"] = '\n';
    var re = new RegExp(Object.keys(mapReplaces).join("|"),"gi");
    if (typeof str2Replace !== "string") return str2Replace;
    return str2Replace.replace(re, function(matched){
        return mapReplaces[matched.toLowerCase()];
    });
}
class PowerTodoistCardEditor extends LitElement {
    static get properties() {
        return {
            hass: Object,
            config: Object,
        };
    }
   
    get _entity() {
        if (this.config) {
            return this.config.entity || '';
        }
       
        return '';
    }
    get _show_completed() {
        if (this.config) {
            return (this.config.show_completed !== undefined) ? this.config.show_completed : 5;
        }
       
        return 5;
    }
   
    get _show_header() {
        if (this.config) {
            return this.config.show_header || true;
        }
       
        return true;
    }
    get _show_item_add() {
        if (this.config) {
            return this.config.show_item_add || true;
        }
       
        return true;
    }
    get _use_quick_add() {
        if (this.config) {
            return this.config.use_quick_add || false;
        }
       
        return false;
    }
    get _show_item_close() {
        if (this.config) {
            return this.config.show_item_close || true;
        }
       
        return true;
    }
    get _show_item_delete() {
        if (this.config) {
            return this.config.show_item_delete || true;
        }
       
        return true;
    }
    get _filter_today_overdue() {
        if (this.config) {
            return this.config.filter_today_overdue || false;
        }
       
        return false;
    }
   
    setConfig(config) {
        this.config = config;
    }
   
    configChanged(config) {
        const e = new Event('config-changed', {
            bubbles: true,
            composed: true,
        });
       
        e.detail = {config: config};
       
        this.dispatchEvent(e);
    }
   
    getEntitiesByType(type) {
        return this.hass
            ? Object.keys(this.hass.states).filter(entity => entity.substr(0, entity.indexOf('.')) === type)
            : [];
    }
    isNumeric(v) {
        return !isNaN(parseFloat(v)) && isFinite(v);
    }
   
    valueChanged(e) {
        if (
            !this.config
            || !this.hass
            || (this[`_${e.target.configValue}`] === e.target.value)
        ) {
            return;
        }
       
        if (e.target.configValue) {
            if (e.target.value === '') {
                if (!['entity', 'show_completed'].includes(e.target.configValue)) {
                    delete this.config[e.target.configValue];
                }
            } else {
                this.config = {
                    ...this.config,
                    [e.target.configValue]: e.target.checked !== undefined
                        ? e.target.checked
                        : this.isNumeric(e.target.value) ? parseFloat(e.target.value) : e.target.value,
                };
            }
        }
       
        this.configChanged(this.config);
    }
   
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
   
    render() {
        if (!this.hass) {
            return html``;
        }
       
        const entities = this.getEntitiesByType('sensor');
        const completedCount = [...Array(16).keys()];
        return html`<div class="card-config">
            <div class="option">
                <ha-select
                    naturalMenuWidth
                    fixedMenuPosition
                    label="Entity (required)"
                    @selected=${this.valueChanged}
                    @closed=${(event) => event.stopPropagation()}
                    .configValue=${'entity'}
                    .value=${this._entity}
                >
                    ${entities.map(entity => {
                        return html`<mwc-list-item .value="${entity}">${entity}</mwc-list-item>`;
                    })}
                </ha-select>
            </div>
            <div class="option">
                <ha-select
                    naturalMenuWidth
                    fixedMenuPosition
                    label="Number of completed tasks shown at the end of the list (0 to disable)"
                    @selected=${this.valueChanged}
                    @closed=${(event) => event.stopPropagation()}
                    .configValue=${'show_completed'}
                    .value=${this._show_completed}
                >
                    ${completedCount.map(count => {
                        return html`<mwc-list-item .value="${count}">${count}</mwc-list-item>`;
                    })}
                </ha-select>
            </div>
           
            <div class="option">
                <ha-switch
                    .checked=${(this.config.show_header === undefined) || (this.config.show_header !== false)}
                    .configValue=${'show_header'}
                    @change=${this.valueChanged}
                >
                </ha-switch>
                <span>Show header</span>
            </div>
            <div class="option">
                <ha-switch
                    .checked=${(this.config.show_item_add === undefined) || (this.config.show_item_add !== false)}
                    .configValue=${'show_item_add'}
                    @change=${this.valueChanged}
                >
                </ha-switch>
                <span>Show text input element for adding new tasks to the list</span>
            </div>
            <div class="option">
                <ha-switch
                    .checked=${(this.config.use_quick_add !== undefined) && (this.config.use_quick_add !== false)}
                    .configValue=${'use_quick_add'}
                    @change=${this.valueChanged}
                >
                </ha-switch>
                <span>
                    Use the <a target="_blank" href="https://todoist.com/help/articles/task-quick-add">Quick Add</a> implementation, available in the official Todoist clients
                </span>
            </div>
            <div class="option" style="font-size: 0.7rem; margin: -12px 0 0 45px">
                <span>
                    Check your <a target="_blank" href="https://github.com/grinstantin/todoist-card#using-the-card">configuration</a> before using this option
                </span>
            </div>
            <div class="option">
                <ha-switch
                    .checked=${(this.config.show_item_close === undefined) || (this.config.show_item_close !== false)}
                    .configValue=${'show_item_close'}
                    @change=${this.valueChanged}
                >
                </ha-switch>
                <span>Show "close/complete" and "uncomplete" buttons</span>
            </div>
            <div class="option">
                <ha-switch
                    .checked=${(this.config.show_item_delete === undefined) || (this.config.show_item_delete !== false)}
                    .configValue=${'show_item_delete'}
                    @change=${this.valueChanged}
                >
                </ha-switch>
                <span>Show "delete" buttons</span>
            </div>
            <div class="option">
                <ha-switch
                    .checked=${(this.config.filter_today_overdue !== undefined) && (this.config.filter_today_overdue !== false)}
                    .configValue=${'filter_today_overdue'}
                    @change=${this.valueChanged}
                >
                </ha-switch>
                <span>Only show today or overdue</span>
            </div>
        </div>`;
    }
   
    static get styles() {
        return css`
            .card-config ha-select {
                width: 100%;
            }
           
            .option {
                display: flex;
                align-items: center;
                padding: 5px;
            }
           
            .option ha-switch {
                margin-right: 10px;
            }
        `;
    }
}
class PowerTodoistCard extends LitElement {
    constructor() {
        super();
        this.itemsJustCompleted = [];
        this.itemsEmphasized = [];
        this.toastText = "";
        this.myConfig = {};
    }
    static get properties() {
        return {
            hass: Object,
            config: Object,
        };
    }
    //trying to set up long press
   // Configuration
    _longPressMs = 1500; // How long to hold before triggering long press (milliseconds)
    _clickDelayMs = 500; // How long to wait for second click in double-click detection (milliseconds)
    // State tracking
    _lpTimer = null; // Timer ID for long press - tracks if long press is active
    _clickTimer = null; // Timer ID for single click delay - prevents premature single-click firing
    _clickCount = 0; // Counts clicks (0, 1, or 2) to detect single vs double click
    _lpStart(item, longPressActionName) {
        // Start long press timer
        this._lpTimer = setTimeout(() => {
            this._lpTimer = null;
            this._clickCount = 0; // Cancel any pending clicks
            if (this._clickTimer) {
                clearTimeout(this._clickTimer);
                this._clickTimer = null;
            }
            this.itemAction(item, longPressActionName);
        }, this._longPressMs);
    }
    _lpEnd(item, clickActionName, dblClickActionName = "") {
        if (this._lpTimer) {
            // Long press timer still running ÔåÆ this was a short press
            clearTimeout(this._lpTimer);
            this._lpTimer = null;
           
            // Handle click counting for single/double click detection
            this._clickCount++;
           
            if (this._clickCount === 1) {
                if (dblClickActionName === "") {
                    // No double click detection wanted - fast-track to single click action
                    this._clickCount = 0;
                    this._clickTimer = null;
                    this.itemAction(item, clickActionName);
                }
                else {
                    // First click - start timer to wait for potential second click
                    this._clickTimer = setTimeout(() => {
                        // Timer expired with only one click ÔåÆ single click
                        this._clickCount = 0;
                        this._clickTimer = null;
                        this.itemAction(item, clickActionName);
                    }, this._clickDelayMs);
                }
            } else if (this._clickCount === 2) {
                // Second click within delay ÔåÆ double click
                clearTimeout(this._clickTimer);
                this._clickTimer = null;
                this._clickCount = 0;
                this.itemAction(item, dblClickActionName);
            }
        }
    }
    _lpCancel() {
        if (this._lpTimer) {
            clearTimeout(this._lpTimer);
            this._lpTimer = null;
        }
        // Note: We don't cancel click timers here as pointer leave/cancel
        // shouldn't interfere with click detection
    }
    static getConfigElement() {
        return document.createElement('powertodoist-card-editor');
    }
    setConfig(config) {
        if (!config.entity) {
            throw new Error('Entity is not set!');
        }
       
        this.config = config;
        this.myConfig = this.parseConfig(config);
    }
    getCardSize() {
        return this.hass ? (this.hass.states[this.config.entity].attributes.tasks.length || 1) : 1;
    }
   
    random(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }
    getUUID() {
        let date = new Date();
                   
        return this.random(1, 100) + '-' + (+date) + '-' + date.getMilliseconds();
    }
   
    itemAdd(e) {
        if (e.which === 13) {
            let input = this.shadowRoot.getElementById('powertodoist-card-item-add');
            let value = input.value;
           
            if (value && value.length > 1) {
                let stateValue = this.hass.states[this.config.entity].state || undefined;
               
                if (stateValue) {
                    let uuid = this.getUUID();
                    if (!this.config.use_quick_add) {
                        let commands = [{
                            'type': 'item_add',
                            'temp_id': uuid,
                            'uuid': uuid,
                            'args': {
                                'project_id': stateValue,
                                'content': value,
                            },
                        }];
                        this.hass
                            .callService('rest_command', 'todoist', {
                                url: 'sync',
                                payload: 'commands=' + JSON.stringify(commands),
                            })
                            .then(response => {
                                input.value = '';
                                this.hass.callService('homeassistant', 'update_entity', {
                                    entity_id: this.config.entity,
                                });
                            });
                    } else {
                        let state = this.hass.states[this.config.entity] || undefined;
                        if (!state) {
                            return;
                        }
                       
                        // The text of the task that is parsed. It can include...
                        // due date (in free form text)
                        // #project
                        // @label
                        // +assignee
                        // /section
                        // // description (at the end)
                        // p2 priority
                        var qa = value;
                         try {
                            if (this.myConfig.filter_section && !qa.includes(' /'))
                                qa = qa + ' /' + this.myConfig.filter_section.replaceAll(' ','\\ ');
                        } catch (error) { }
                        try {
                            if (state.attributes.project.name && !qa.includes(' #'))
                                qa = qa + ' #' + state.attributes.project.name.replaceAll(' ','\\ ');
                        } catch (error) { }
                        this.hass
                            .callService('rest_command', 'todoist', {
                                url: 'tasks/quick',
                                payload: 'text=' + qa,
                            })
                            .then(response => {
                                input.value = '';
   
                                this.hass.callService('homeassistant', 'update_entity', {
                                    entity_id: this.config.entity,
                                });
                            });
                    }
                }
            }
        }
    }
   
   
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
   
    parseConfig(srcConfig) {
        // Using eval, dangers and alternatives: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_eval!
        // Thomas Loven old example using Jinja backend renders: https://github.com/thomasloven/lovelace-template-entity-row/blob/master@%7B2020-03-10T16:06:34Z%7D/src/main.js
        // https://github.com/Savjee/button-text-card/blob/master/src/button-text-card.ts
        var parsedConfig;
        var project_notes = [];
        let myStrConfig = JSON.stringify(srcConfig);
        let date_formatted = (new Date()).format(this.myConfig["date_format"] || "mmm dd H:mm");
// let date_formatted = (new Date()).format(srcConfig["date_format"] || "mmm dd H:mm");
        //try { project_notes = this.hass.states[this.config.entity].attributes['project_notes'];} catch (error) { }
        try { project_notes = this.hass.states[this.myConfig.comments_entity].attributes['results'];} catch (error) { } //api switch
        const strLabels = (typeof(item) !== "undefined" && item.labels) ? JSON.stringify(item.labels) : "";
        var mapReplaces = {
            "%user%" : this.hass ? this.hass.user.name : "",
            "%date%" : `${date_formatted}`,
            "%str_labels%" : strLabels,
            "%section%" : srcConfig.filter_section ?? '',
        };
        if (Array.isArray(project_notes) && project_notes.length > 0) {
            project_notes.forEach(function (value, index) {
                mapReplaces["%project_notes_" + index + '%'] = value.content;
                if (index == 0) mapReplaces["%project_notes%"] = value.content;
            });
        } else {
            mapReplaces["%project_notes%"] = "";
        }
        if (this.hass && this.hass.states['sensor.dow'] && this.hass.states['sensor.dow']?.state) {
            var dazeString = this.hass.states['sensor.dow'].state.split(', ');
            [0,1,2,3,4,5,6].forEach(function(index) {
                mapReplaces['%dow' + (index-1) + '%'] = dazeString[index]?.replaceAll("'","") || "";
            });
        }
        // Pre-process only items whose _values_ contain a variable (e.g., %somevar% : %someothervar%)
        for (const key in mapReplaces) {
            if (/%[a-zA-Z0-9_-]+%/.test(mapReplaces[key])) {
            mapReplaces[key] = replaceMultiple(mapReplaces[key], mapReplaces);
            }
        }
        myStrConfig = replaceMultiple(myStrConfig, mapReplaces);
        try {
             parsedConfig = JSON.parse(myStrConfig);
        } catch(err) {
            var source = "";
            parsedConfig = JSON.parse(JSON.stringify(srcConfig)); // cloning prevents preventExtensions from limiting us
            try {
                const span = 40;
                const start = err.message.match(/[-+]?[0-9]*\.?[0-9]+/g)[1] - span/2;
                source = "(near --> " + myStrConfig.substring(start, start + span) + " <---)";
            } catch (err2) {
                //alert(err2);
            }
            parsedConfig["error"] = err.name + ": " + err.message + source;
            //alert(err);
        }
        //parsedConfig['mapReplaces_debug'] = JSON.stringify(mapReplaces);
        return parsedConfig;
    }
    buildCommands(item, button = "actions_close") {
        let state = this.hass.states[this.config.entity].attributes;
        // calling parseConfig here repeats some work, but is helpful because %user% variable and others are now available:
        let actions = this.config[button] !== undefined ? this.parseConfig(this.config[button]) : [];
        // actions are not executed sequentially at all. A for each could cjange this, either here or one level up at ItemAction
        // It would not imply too many changes here. But it would complicate the aggregation of API updates into a single request
        // actions.forEach(a => {
        // let actions = [a];
        // console.log(actions);
        //});
        let automation = "", confirm = "", promptTexts = "", toast = "";
        let commands = [], updates = [], labelChanges = [], adds = [], allow = [], matches = [], emphasis = [];
        try { automation = actions.find(a => typeof a === 'object' && a.hasOwnProperty('service')).service || "";} catch (error) { }
        try { confirm = actions.find(a => typeof a === 'object' && a.hasOwnProperty('confirm')).confirm || "";} catch (error) { }
        try { promptTexts = actions.find(a => typeof a === 'object' && a.hasOwnProperty('prompt_texts')).prompt_texts || "";} catch (error) { }
        try { updates = actions.find(a => typeof a === 'object' && a.hasOwnProperty('update')).update || [];} catch (error) { }
        try { labelChanges = actions.find(a => typeof a === 'object' && a.hasOwnProperty('label')).label || [];} catch (error) { }
        try { toast = actions.find(a => typeof a === 'object' && a.hasOwnProperty('toast')).toast || "";} catch (error) { }
        try { adds = actions.find(a => typeof a === 'object' && a.hasOwnProperty('add')).add || [];} catch (error) { }
        try { allow = actions.find(a => typeof a === 'object' && a.hasOwnProperty('allow')).allow || [];} catch (error) { }
        try { matches = actions.find(a => typeof a === 'object' && a.hasOwnProperty('match')).match || [];} catch (error) { }
        try { emphasis = actions.find(a => typeof a === 'object' && a.hasOwnProperty('emphasis')).emphasis || [];} catch (error) { }
        try { paint = actions.find(a => typeof a === 'object' && a.hasOwnProperty('paint')).paint || [];} catch (error) { }
        //const strLabels = JSON.stringify(item.labels); // moved to Parse, delete when not needed
        let initialLabels = [...item.labels];
        let labels = item.labels;
        if (labelChanges.includes("!*")) labels = []; // use !* to clear all
        if (labelChanges.includes("!_")) labels = // use !_ to clear all labels starting with _
            labels.filter(function(label) { return label[0] !== '_'; });
        if (labelChanges.includes("!!")) labels = // use !! to clear all labels NOT starting with _
            labels.filter(function(label) { return label[0] === '_'; });
        labelChanges.map(change => {
            let newLabel = replaceMultiple(change, {"%user%":this.hass.user.name});
            if (change.startsWith("!")) { // remove specific label
            if (labels.includes(change.slice(1)))
               labels = labels.filter(e => e !== change.slice(1)); // remove it
            } else if (change.startsWith(":")) { // Toggle specific label
            if (labels.includes(change.slice(1)))
                labels = labels.filter(e => e !== change.slice(1)); // toggle removes it
            else
                if (!labels.includes(newLabel)) labels.push(newLabel.slice(1)); // toggle adds it
            } else {
            if (!labels.includes(newLabel)) labels.push(newLabel); // (simple) add it
            }
        });
        // Set labelsBeingAdded and labelsBeingRemoved by comparing initialLabels and labels
        let labelsBeingAdded = labels.filter(l => !initialLabels.includes(l));
        let labelsBeingRemoved = initialLabels.filter(l => !labels.includes(l));
        this.changeLabelsUINow(item, labelsBeingAdded, labelsBeingRemoved);
        // Let's make things really easy to use further down:
        let section_id2order = {}; // Object, not array - we store section_ids as strings
        section_id2order[""] = 0; // not really a section in Todoist, but when incremented, will move to first section
        let section_order2id = [];
        state.sections.map(s => {
            section_id2order[s.id.toString()] = s.section_order;
            section_order2id[s.section_order] = s.id;
        });
        let nextSection = section_order2id[section_id2order[item.section_id] + 1] || item.project_id;
        let input = "";
        if (promptTexts || // we have an explicit request to prompt the user
            JSON.stringify(updates).includes("%input%") || // we have an update action mentioning %input%
            (!actions.length && ["actions_content", "actions_description"].includes(button)) // a default action that needs user input to edit field
            ) {
                let field = button.slice(8);
                let questionText = "Please enter a new value for " + button.slice(8) + ":";
                let defaultText = item[button.slice(8)] || "";
                if (promptTexts)
                   [questionText, defaultText] = promptTexts.split("|");
                // some work so we can use field values in the defaultText:
                field = /(?<=%).*(?=%)/.exec(defaultText);
                if (field && item[field])
                defaultText = defaultText.replaceAll("%" + field + "%", item[field]);
                input = window.prompt(questionText, defaultText) || "";
        }
        if (updates.length || labelChanges.length) {
            let newIndex = commands.push({
                "type": "item_update",
                "uuid": this.getUUID(),
                "args": {
                    "id": item.id,
                    "labels": labels,
                },
            }) - 1;
            let newObj = {};
            Object.entries(updates).map(([key, valueObj]) => {
                let value = Object.keys(valueObj)[0];
                // leaving out "id" and "labels" deliberately, those are handled separately:
                if (["content", "description", "due", "priority", "collapsed",
                     "assigned_by_uid", "responsible_uid", "day_order", "" ]
                    .includes(value)) {
                        newObj = { [value] : replaceMultiple(valueObj[value], mapReplaces, item[value], input) };
                        Object.assign(commands[newIndex].args, newObj);
                    }
            });
        }
       
        if (emphasis.length) {
            this.emphasizeItem(item, emphasis);
            //this.itemsEmphasized[item.id]="special";
        }
        if (actions.includes("move")) {
            let newIndex = commands.push({
                "type": "item_move",
                "uuid": this.getUUID(),
                "args": {
                    "id": item.id,
                },
            }) - 1;
            // Move to next section. To move to "no section" Todoist expects a move to the project...:
            commands[newIndex].args[nextSection !== item.project_id ? "section_id" : "project_id"] = nextSection;
        }
       
        let default_actions = {
            "actions_close" : { 'type': 'item_close', 'uuid': this.getUUID(), 'args': {'id': item.id} },
            "actions_dbl_close": {},
            "actions_longpress_close" : {},
            "actions_content" : { "type": "item_update", "uuid": this.getUUID(), "args": { "id": item.id, "content": input } },
            "actions_dbl_content" : {},
            "actions_longpress_content" : {},
            "actions_description" : { "type": "item_update", "uuid": this.getUUID(), "args": { "id": item.id, "description": input } },
            "actions_dbl_description" : {},
            "actions_longpress_description" : {},
            "actions_label" : {},
            "actions_dbl_label" : {},
            "actions_longpress_label" : {},
            "actions_delete" : { 'type': 'item_delete', 'uuid': this.getUUID(), 'args': {'id': item.id } },
            "actions_dbl_delete" : {},
            "actions_longpress_delete" : {},
            "actions_uncomplete" : { 'type': 'item_uncomplete', 'uuid': this.getUUID(), 'args': {'id': item.id } },
            "actions_dbl_uncomplete" : {},
            "actions_longpress_uncomplete" : {},
        }
       
        // actions without arguments, and which get executed just like the defaults:
        Array.from([ "close", "uncomplete", "delete" ]).
            forEach(a => {
                if (actions.includes(a) &&
                    ((a != null || a.length !== 0)))
                    commands.push(default_actions["actions_" + a]);
        })
        if (!actions.length && default_actions[button])
            commands.push(default_actions[button]);
       
        if (confirm) {
            if (!window.confirm(confirm))
                return [ [] , [] , "", "" ];
        }
        if (allow.length && !allow.includes(this.hass.user.name)) {
            return [ [] , [] , "", "" ];
        }
        // 'match' actions [field, value, action_domystuff] call other actions conditionally:
        if (matches.length === 1 ) matches.push='on'; // default value
        if (matches.length === 2 ) matches.push=''; // default null action
        if (matches.length === 3 ) matches.push=''; // default null else action
        matches.forEach(([field, value, subAction, subElseAction]) => {
            var stateToMatch, attrName;
            // for HASS states such as input_booleans.allowed etc:
            if (field.includes('.')) {
                attrName = field.includes('#') ? field.split('#')[1] : '';
                if (!attrName) {
                    stateToMatch = this?.hass?.states[field.split('#')[0]]?.state || undefined;
                } else {
                    stateToMatch = this?.hass?.states[field.split('#')[0]]?.attributes[attrName] || undefined;
                }
                if ((stateToMatch === value) && subAction.length) {
                    this.itemAction(item, subAction);
                    //return [ [] , [] , "", "" ];
                }
                if ((stateToMatch !== value) && subElseAction.length) {
                    this.itemAction(item, subElseAction);
                    //return [ [] , [] , "", "" ];
                }
            }
            // for tests against item values (todoist fields)
            else if ((Array.isArray(item[field]) && item[field].includes(value)) ||
                item[field] == value)
                // we have a match, action is executed like a sub-routine:
                this.itemAction(item, subActions);
        })
        return [commands, adds, automation, toast];
    }
    changeLabelsUINow(item, labelsBeingAdded, labelsBeingRemoved) {
        if (!labelsBeingAdded?.length && !labelsBeingRemoved?.length) return;
        // Fetch item from hass state
        let state = this.hass.states[this.config.entity] || undefined;
        let items = state?.attributes?.tasks || [];
        const itemIndex = items.findIndex(i => i.id === item.id);
        if (itemIndex === -1) return;
        let currentLabels = items[itemIndex].labels || [];
        // Remove specified labels
        currentLabels = currentLabels.filter(label => !labelsBeingRemoved.includes(label));
         // Add specified labels, avoiding duplicates
        currentLabels = [...new Set([...currentLabels, ...labelsBeingAdded])];
        // Update the item in the items array
        items = [
            ...items.slice(0, itemIndex),
            { ...items[itemIndex], labels: currentLabels },
            ...items.slice(itemIndex + 1),
        ];
        if (false ) { // some extra logging for debugging
            const sectionIdMap = {
                '138899413': 'Monday',
                '138899729': 'Tuesday?',
                '138899730': 'Wednesday?',
                '138899731': 'Thursday?',
                '138899732': 'Friday?',
                '138899735': 'Saturday',
                '138899732': 'Sunday?',
            };
            const filterSectionIds = ['138899413']; //focus debugging on a single day
            const briefItems = items
                .filter(item => filterSectionIds.includes(String(item.section_id)))
                .map(({ content, labels, section_id, statusFromLabelCriteria }) => ({
                    content,
                    labels: labels || [],
                    section_id: sectionIdMap[String(section_id)] || String(section_id) || 'Unknown',
                    status: statusFromLabelCriteria || '---'
                }));
            console.table(briefItems);
        }
        // Trigger re-render
        this.items = items;
        //this.requestUpdate();
    }
    async showToast(message, duration, defer = 0) {
        if (!message) return;
        const toast = this.shadowRoot.querySelector("#powertodoist-toast");
        if (toast) {
            setTimeout(() => {
                toast.innerText = toast.innerText + ' ' + message;
                this.toastText = message;
                toast.style.display = 'block';
            }, 1000);
            setTimeout(() => {
                toast.innerText = "";
                this.toastText = "";
                toast.style.display = 'none';
            }, duration + 1000);
        }
    }
    emphasizeItem(item, className) {
        var itemNode = this.shadowRoot.querySelector("#item_" + item.id);
        if (itemNode) {
            itemNode.classList.add("powertodoist-" + className);
            setTimeout(() => {
                itemNode.classList.remove("powertodoist-" + className);
            }, 3000);
        }
    }
    async processAdds(adds) {
        for (const item of adds) {
            this.hass.callService('rest_command', 'todoist', {
                url: 'quick/add',
                payload: 'text=' + item,
            });
        }
    }
    // Usually this is triggered by UI event handlers: click, dbl_click, etc
    // But also via 'match' actions
    itemAction(item, action) {
        //var myConfig = this.parseConfig(this.config);
        if (item === undefined) return; // will happen when renderLabels is used for the card-level labels
        action = action.toLowerCase();
        let commands = [], adds = [], automation = [];
        let toast = "";
        // start by getting everything from config:
        [commands, adds, automation, toast] = this.buildCommands(item, "actions_" + action);
        // show toast if it exists:
        this.showToast(toast, 3000);
        // deal with adds (this runs asynchronously to avoid blocking us)
        this.processAdds(adds);
        // deal with commands:
        this.hass.callService('rest_command', 'todoist', {
            url: 'sync',
            payload: 'commands=' + JSON.stringify(commands),
        })
        .then(response => {
            // specific post-actions:
            // Extract the actual command type from the commands array
            const commandTypes = commands.map(cmd => cmd.type);
            // Handle UI updates based on command types, not action names
            if (commandTypes.includes('item_close')) {
                if (this.itemsJustCompleted.length >= this.config.show_completed) {
                    this.itemsJustCompleted.splice(0, this.itemsJustCompleted.length - this.config.show_completed + 1);
                }
                this.itemsJustCompleted.push(item);
            } else if (commandTypes.includes('item_uncomplete') || commandTypes.includes('item_delete')) {
                this.itemsJustCompleted = this.itemsJustCompleted.filter(v => v.id != item.id);
            }
            /*switch (action) {
                case 'close':
                    if (this.itemsJustCompleted.length >= this.config.show_completed) {
                        this.itemsJustCompleted.splice(0, this.itemsJustCompleted.length - this.config.show_completed + 1);
                    }
                    this.itemsJustCompleted.push(item);
                    break;
                case 'content':
                    break;
                case 'delete':
                    break;
                case 'unlist_completed': // removes from internal list
                case 'uncomplete': // removes from internal list and uncloses in todoist
                    this.itemsJustCompleted = this.itemsJustCompleted.filter(v => {
                        return v.id != item.id;
                    });
                    break;
                default:
                    break;
            }*/
            // Update the entity after processing the response
            return this.hass.callService('homeassistant', 'update_entity', {
                entity_id: this.config.entity
            });
        })
        .catch(err => {
            console.error('Error in Todoist operation:', err);
            throw err; // Re-throw to propagate the error
        });
        // deal with automations:
        if (automation.length) {
            this.hass.callService(
                automation.includes('script.') ? 'homeassistant' : 'automation',
                automation.includes('script.') ? 'turn_on' : 'trigger',
                { entity_id: automation, }
            ).then(function() {
                console.log('Automation triggered successfully from todoist JS!');
                this.hass.callService('homeassistant', 'update_entity', { entity_id: this.config.entity, });
            }).catch(function(error) {
                console.error('Error triggering automation from todoist JS:', error);
            });
        }
    }
  
    itemUnlistCompleted(item) {
        this.itemsJustCompleted = this.itemsJustCompleted.filter(v => {
            return v.id != item.id;
        });
        this.hass.callService('homeassistant', 'update_entity', {
            entity_id: this.config.entity,
        });
    }
   
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
   
    filterDates(items) {
        if ((typeof this.myConfig.sort_by_due_date !== 'undefined') && (this.myConfig.sort_by_due_date !== false)) {
            items.sort((a, b) => {
                if (!(a.due && b.due)) return 0;
                if (this.myConfig.sort_by_due_date == 'ascending')
                    return (new Date(a.due.date)).getTime() - (new Date(b.due.date)).getTime();
                else
                    return (new Date(b.due.date)).getTime() - (new Date(a.due.date)).getTime();
            });
        }
        if ((typeof this.myConfig.filter_show_dates_starting !== 'undefined') ||
            (typeof this.myConfig.filter_show_dates_ending !== 'undefined')) {
            let startCompare = Number(this.myConfig.filter_show_dates_starting);
            let endCompare = Number(this.myConfig.filter_show_dates_ending);
            if ((typeof this.myConfig.filter_show_dates_starting == 'string') && !isNaN(startCompare))
                // we have a number provided as string, signaling days precision
                startCompare = new Date().setHours(0, 0, 0, 0) + (startCompare * 24 * 60 * 60 * 1000);
            else
                startCompare = new Date().getTime() + (startCompare * 1 * 60 * 60 * 1000);
            if ((typeof this.myConfig.filter_show_dates_ending == 'string') && !isNaN(endCompare))
                // we have a number provided as string, signaling days precision
                endCompare = new Date().setHours(23, 59, 59, 999) + (endCompare * 24 * 60 * 60 * 1000);
            else
                endCompare = new Date().getTime() + (endCompare * 1 * 60 * 60 * 1000);
            var dItem, dItem1, dItem2;
            items = items.filter(item => {
                if (!item.due) return (this.myConfig.filter_show_dates_empty !== false);
                let duration = 0;
                if (item.duration) // the only way to set this is through the API...
                   duration = item.duration.unit == 'day' ? // it's either 'day' or 'minute'
                              (item.duration.amount * 24 * 60 * 60 * 1000) :
                              (item.duration.amount * 1 * 1 * 60 * 1000);
                if( /^\d{4}-\d{2}-\d{2}$/.test(item.due.date)) {
                    // adds time if missing
                    dItem1 = (new Date(item.due.date + 'T23:59:59')).getTime();
                    dItem2 = (new Date(item.due.date + 'T00:00:00')).getTime();
                } else {
                    dItem1 = (new Date(item.due.date)).getTime();
                    dItem2 = dItem1;
                }
                // 'duration' logic: items that are spread over more than just one point in time;
                // only used with start=0 and end=null, so you can use the due date for a start time,
                // using duration to "expire" the task
                if (isNaN(endCompare) && duration) {
                    startCompare -= duration;
                    endCompare = new Date().getTime();
                }
                let passStart = isNaN(startCompare) ? true : startCompare <= dItem1; // items passing out of view
                let passEnd = isNaN(endCompare) ? true : endCompare >= dItem2; // items coming in to view
                return passStart && passEnd;
            });
        }
        return items;
    }
    filterPriority(items) {
        if ((typeof this.myConfig.sort_by_priority !== 'undefined') && (this.myConfig.sort_by_priority !== false)) {
            items.sort((a, b) => {
                if (!(a.priority && b.priority)) return 0;
                if (this.myConfig.sort_by_priority === 'ascending')
                    return a.priority - b.priority;
                else
                    return b.priority - a.priority;
            });
        }
        return items;
    }
    assessLabelCriteriaForItem(item, criteria, defaultIfNoCriteria, cardLabels) {
        if (!criteria) return defaultIfNoCriteria;
        let includes = 0;
        let excludes = 0;
        criteria.forEach(label => {
            let l = label;
            if (l.startsWith("!")) {
                excludes += item.labels.includes(l.slice(1));
            } else {
                includes += item.labels.includes(l) || (l === "*");
                includes += (l === "!*") && (item.labels.length === 0);
                if (!cardLabels?.includes(l)) cardLabels.push(l);
            }
        });
        return (excludes === 0) && (includes > 0);
    }
    getIconName(icons, baseIndex, item) {
        // Default to base icon
        let chosen = icons[baseIndex];
        // If label-based override is enabled, use index 4 or 5
        if (
            this.config.status_from_labels !== undefined &&
            item?.statusFromLabelCriteria !== undefined &&
            icons.length >= 5
        ) {
            chosen = item.statusFromLabelCriteria ? icons[4] : icons[5];
        }
        return chosen; // { name, color }
    }
    formatDueDate(dueDate, configFormat) {
        // Default format if none provided
        const wantMask = configFormat || "dd-mmm H'h'MM";
       
        // If it's a named mask (e.g., "default", "fullDate"), resolve it
        const resolvedMask = dateFormat.masks[wantMask] || wantMask;
       
        // Format the date with the resolved mask
        const formatted = dateFormat(dueDate, resolvedMask);
       
        // Prepend emoji and return
        return "­­🗓" + formatted;
    }
    renderTemplate(templateStr) {
        if (!templateStr) {
            return '';
        }
        try {
            // Step 1: Expand Jinja-like expressions ({{ ... }})
            const expanded = this.expandJinjaExpressions(templateStr);
            
            // Step 2: Parse as Markdown
            return marked.parse(expanded);
        } catch (error) {
            console.warn('Template rendering failed:', error);
            return marked.parse(templateStr);
        }
    }

    expandJinjaExpressions(str) {
        // Match {{ ... }} patterns
        return str.replace(/\{\{(.+?)\}\}/g, (match, expr) => {
            try {
                return this.evaluateExpression(expr.trim());
            } catch (e) {
                console.warn(`Failed to evaluate expression: ${expr}`, e);
                return `[${expr}]`; // Graceful fallback
            }
        });
    }

    evaluateExpression(expr) {
        // Handle now().strftime() pattern for dates
        const dateMatch = expr.match(/now\(\)\.strftime\(['"](.+?)['"]\)/);
        if (dateMatch) {
            const pythonFormat = dateMatch[1];
            return this.formatDatePythonStyle(new Date(), pythonFormat);
        }
        
        // Handle user variable
        if (expr === 'user') {
            return this.hass?.user?.name || 'unknown';
        }
        
        // Handle states('entity_id') pattern
        const statesMatch = expr.match(/states\(['"](.+?)['"]\)/);
        if (statesMatch) {
            const entityId = statesMatch[1];
            const state = this.hass?.states?.[entityId];
            return state?.state || 'unavailable';
        }

        const stateAttrMatch = expr.match(/state_attr\(['"](.+?)['"],\s*['"](.+?)['"]\)/);
        if (stateAttrMatch) {
            const entityId = stateAttrMatch[1];
            const attrName = stateAttrMatch[2];
            const state = this.hass?.states?.[entityId];
            return state?.attributes?.[attrName] || '';
        }
        
        // Future extensions: groups, filters, etc.
        // Example stub for groups:
        // if (expr.startsWith('groups.')) {
        //     const groupName = expr.split('.')[1];
        //     return this.getGroupMembers(groupName).join(', ');
        // }
        
        throw new Error(`Unsupported expression: ${expr}`);
    }

    formatDatePythonStyle(date, pythonFormat) {
        // Map Python strftime tokens to dateFormat library tokens
        // Python -> dateFormat mapping:
        // %d -> dd (day with zero-padding)
        // %m -> mm (month with zero-padding)
        // %Y -> yyyy (4-digit year)
        // %H -> HH (24-hour with zero-padding)
        // %M -> MM (minutes with zero-padding)
        // %S -> ss (seconds with zero-padding)
        // %B -> mmmm (full month name)
        // %b -> mmm (abbreviated month name)
        // %A -> dddd (full weekday name)
        // %a -> ddd (abbreviated weekday name)
        // %I -> hh (12-hour with zero-padding)
        // %p -> TT (AM/PM)
        
        let dateFormatMask = pythonFormat
            .replace(/%d/g, 'dd')
            .replace(/%m/g, 'mm')
            .replace(/%Y/g, 'yyyy')
            .replace(/%H/g, 'HH')
            .replace(/%M/g, 'MM')
            .replace(/%S/g, 'ss')
            .replace(/%B/g, 'mmmm')
            .replace(/%b/g, 'mmm')
            .replace(/%A/g, 'dddd')
            .replace(/%a/g, 'ddd')
            .replace(/%I/g, 'hh')
            .replace(/%p/g, 'TT');
        
        // Use the existing dateFormat library
        return dateFormat(date, dateFormatMask);
    }
    render() {
        if (this.hass === undefined) {
            return html`Home Assistant is restarting. Please wait a few seconds...`;
        }
        let state = this.hass.states[this.config.entity] || undefined;
        if (state?.attributes === undefined) {
            return html`Powertodoist sensors don't have any data yet. Please wait a few seconds and refresh. [todoist sensor] `;
        }
        var label_colors = this.hass.states["sensor.label_colors"];
        label_colors = label_colors?.attributes?.label_colors;
        if (!label_colors) {
            return html`Powertodoist sensors don't have any data yet. Please wait a few seconds and refresh. [label_colors sensor] `;
        }
// if (!this.hass.states["sensor.dow"] || this.hass.states['sensor.dow']?.state === "unknown") {
// return html`Powertodoist sensors don't have any data yet. Please wait a few seconds and refresh. [days of week sensor] `;
// }
        this.myConfig = this.parseConfig(this.config);
        // Build icon config: support "icon" or "icon:color" form
        var rawIcons = (this.config.icons && this.config.icons.length >= 4)
        ? this.config.icons
        : [
            "checkbox-marked-circle-outline:green",
            "circle-medium",
            "plus-outline:blue",
            "trash-can-outline:red",
            "checkbox-marked-circle-outline",
            "checkbox-blank-circle-outline"
            ];
       
        // Normalize into array of { name, color }
        var icons = rawIcons.map(str => {
            const [name, color] = str.split(":");
            return { name, color: color || "" };
        });
        let items = state.attributes.tasks || []; //changed from .items to .tasks
       
        items = this.filterDates(items);
        items = this.filterPriority(items);
       
        // filter by section:
        let section_name2id = [];
        if (!this.myConfig.filter_section_id && this.myConfig.filter_section) {
            //let state = this.hass.states[this.myConfig.entity].attributes;
            state.attributes?.sections.map(s => {
                section_name2id[s.name] = s.id;
            });
        }
        let section_id = this.myConfig.filter_section_id || section_name2id[this.myConfig.filter_section] || undefined;
        if (section_id) {
            items = items.filter(item => {
                return item.section_id === section_id;
            });
        }
        // filter items matching filter_labels criteria
        var cardLabels = [];
        items = items.filter(item => this.assessLabelCriteriaForItem.call(this, item, this.myConfig?.filter_labels, true, cardLabels));
       
        // mark items matching status_from_labels criteria by storing it as an extra item property
        items = items.map(item => ({
            ...item,
            statusFromLabelCriteria: this.assessLabelCriteriaForItem.call(this, item, this.myConfig?.status_from_labels, false, [])
        }));
        // Starts with named section or default, tries to get section name from id, but lets friendly_name override it:
        let cardName = this.myConfig.filter_section || "ToDoist";
        try { cardName = state.attributes.sections.find(s => { return s.id === section_id }).name } catch (error) { }
        cardName = this.myConfig.friendly_name || cardName;
        this.generateStyles();
        // https://lit.dev/docs/v1/lit-html/writing-templates/#repeating-templates-with-looping-statements
        const topMarkdown = this.renderTemplate(this.config.markdown_top_content);
        const bottomMarkdown = this.renderTemplate(this.config.markdown_bottom_content);
        let rendered = html`<ha-card>
            ${(this.myConfig.show_header === undefined) || (this.myConfig.show_header !== false)
                ? html`<h1 class="card-header">
                    <div class="name">${cardName}
                    ${(this.myConfig.show_card_labels === undefined) || (this.myConfig.show_card_labels !== false)
                        ? html`${this.renderLabels(undefined, (cardLabels.length == 1 ? cardLabels : []), [], label_colors)}`
                        : html``
                    }
                    </div>
                    </h1>
                    <div id="powertodoist-toast">${this.toastText}</div>`
                : html``}
            ${this.config.markdown_top_content ? html`<div class="top-markdown" .innerHTML=${topMarkdown}></div>` : ''}
            <div class="list-container">
            <div class="left-accent"></div>
                <div class="powertodoist-list">
                ${items.length
                    ? items.map(item => {
                        return html`<div class="powertodoist-item" .id=${"item_" + item.id}>
                            ${(this.myConfig.show_item_close === undefined) || (this.myConfig.show_item_close !== false)
                                ? html`<ha-icon-button
                                    class="powertodoist-item-close"
                                    @pointerdown=${(e) => this._lpStart(item, "longpress_close")}
                                    @pointerup=${(e) => this._lpEnd(item, "close", "dbl_close")}
                                    @pointercancel=${this._lpCancel}
                                    @pointerleave=${this._lpCancel} >
                                    <ha-icon
                                        .icon=${"mdi:" + this.getIconName(icons, 0, item).name}
                                        style="color:${this.getIconName(icons, 0, item).color}"
                                    ></ha-icon>
                                </ha-icon-button>`
                                : html`<ha-icon
                                        .icon=${"mdi:" + icons[1].name}
                                        style=${icons[1].color ? `color:${icons[1].color};` : ""}
                                    ></ha-icon>`
                            }
                            <div class="powertodoist-item-text"><div
                                @pointerdown=${(e) => this._lpStart(item, "longpress_content")}
                                @pointerup=${(e) => this._lpEnd(item, "content", "dbl_content")}
                                @pointercancel=${this._lpCancel}
                                @pointerleave=${this._lpCancel}
                            ><span class="powertodoist-item-content ${(this.itemsEmphasized[item.id]) ? css`powertodoist-special` : css``}" >
                            ${item.content}</span></div>
                            ${(this.myConfig.show_item_description === undefined) || (this.myConfig.show_item_description !== false) && item.description
                                ? html`<div
                                    @pointerdown=${(e) => this._lpStart(item, "longpress_description")}
                                    @pointerup=${(e) => this._lpEnd(item, "description", "dbl_description")}
                                    @pointercancel=${this._lpCancel}
                                    @pointerleave=${this._lpCancel}
                                ><span class="powertodoist-item-description">${item.description}</span></div>`
                                : html`` }
                            ${this.renderLabels(
                                item,
                                this.myConfig.show_dates && item.due
                                    ? this.formatDueDate(item.due.date, this.config.date_format)
                                    : [],
                                [...item.labels].filter(String),
// [this.myConfig.show_dates && item.due ? dateFormat(item.due.date, "🗓 dd-mmm H'h'MM") :
// [], ...item.labels].filter(String), // filter removes the empty []s
                                // exclusions:
                                [...(cardLabels.length == 1 ? cardLabels : []), // card labels excluded unless more than one
                                ...item.labels.filter(l => l.startsWith("_"))], // "_etc" labels excluded
                                label_colors) }
                        </div>
                        ${(this.myConfig.show_item_delete === undefined) || (this.myConfig.show_item_delete !== false)
                            ? html`<ha-icon-button
                                class="powertodoist-item-delete"
                                @pointerdown=${(e) => this._lpStart(item, "longpress_delete")}
                                @pointerup=${(e) => this._lpEnd(item, "delete", "dbl_delete")}
                                @pointercancel=${this._lpCancel}
                                @pointerleave=${this._lpCancel} >
                                <ha-icon
                                    .icon=${"mdi:" + icons[3].name}
                                    style=${icons[3].color ? `color:${icons[3].color};` : ""}
                                ></ha-icon>
                            </ha-icon-button>`
                            : html``}
                        </div>
                    </div>`;
                    })
                    : html`<div class="powertodoist-list-empty">No uncompleted tasks!</div>`}
                ${this.renderLowerPart(icons)}
                </div>
            </div>
            ${this.config.markdown_bottom_content ? html`<div class="bottom-markdown" .innerHTML=${bottomMarkdown}></div>` : ''}
            ${this.renderFooter()}
            </ha-card>`;
        return rendered;
    }
   
    generateStyles() {
        var style = document.createElement('style');
        style.id = 'customPowerTodoistStyle';
        try { this.shadowRoot.getElementById(style.id).remove(); } catch (error) { }
        if (this.myConfig.accent) {
            this.myConfig.style = (this.myConfig.style ?? '') + '.left-accent { background-color: ' + this.myConfig.accent + '!important; width: 6px!important; }';
        }
        if (this.myConfig.style) {
            style.innerHTML = this.myConfig.style || '';
            this.shadowRoot.appendChild(style);
        }
    }
    generateExtraLabels (labels, label_colors) {
        if (label_colors === undefined) return [];
        var extraLabels = [];
        if (this.myConfig.extra_labels) {
            this.myConfig.extra_labels.forEach(l => {
                //let l = label;
                               
                let parts = l.split(/[:+]/).map(s => s.trim());
                let firstPart = parts[0];
                let filteredParts = [];
                let mainParts = l.split(":").map(s => s.trim());
                let plusCount = (mainParts.length > 1) ? (mainParts[1].match(/\+/g) || []).length + 1 : 0;
                for (let i = 1; i < parts.length; i++) {
                    if (labels.includes(parts[i])) {
                        filteredParts.push(parts[i]);
                    }
                }
               
                if (mainParts.length > 1 && mainParts[1].startsWith("+")) {
                    filteredParts = (filteredParts.length > 0) ? [filteredParts.length] : [];
                }
                if ((filteredParts.length > 0) || // we found something when filtering or counting a list
                   (!l.includes(':'))) { // there was no list, put static label in directly
                    let outlineLabel = label_colors.filter(lc => lc.name === firstPart + '_outline');
                    let theColor = (label_colors.find(lc => lc.name === firstPart)?.color || "blue");
                    if (outlineLabel.length > 0) {
                        // strip "_outline" which has 8 chars, we'll then re-add it to the end
                        theColor = outlineLabel[0].color;//.slice(0, -8);
                    }
                    let finalLabel = firstPart + ": " + filteredParts.join("+") + (outlineLabel.length > 0 ? '_outline' : '');
                    extraLabels.push(finalLabel);
                    if (!label_colors.some(item => item.name === finalLabel))
                        label_colors.push({ name: finalLabel, color: theColor });
                }
            });
        }
        return extraLabels;
    }
    renderLabels(item, date, labels, exclusions, label_colors) {
        var extraLabels = this.generateExtraLabels(labels, label_colors);
        labels = [date, ...labels, ...extraLabels].filter(String);
        // prepend a date as a "fake" label:
        if ((item !== undefined) && (this.config.show_item_labels === false)) {
            labels = this.myConfig.show_dates && item.due ? [date, ...extraLabels] : [...extraLabels];
        }
       
        let rendered = html`
            ${(labels.length - (exclusions?.length ?? 0) > 0)
            ? html`<div class="labelsDiv"><ul class="labels">${labels.map(label => {
                if (exclusions.includes(label)) return html``;
                let isOutline = label.endsWith('_outline');
                let displayLabel = isOutline ? label.slice(0, -8) : label; // "_outline" is 8 chars
                let filteredColors = label_colors.filter(lc => lc.name === label);
                let colorKey = filteredColors.length
                    ? filteredColors[0].color
                    : "var(--primary-background-color)";
                let color = todoistColors[colorKey] || colorKey;
                let style = isOutline
                    ? `border: 2px solid ${color}; background: transparent; color: ${color};`
                    : `background-color: ${color}; ${label[0]=="\ud83d" ? "color: var(--primary-text-color);" : ""}`; // \ud83d is "🗓" that marks a date
                return html`<li
                    class=${extraLabels.includes(label) ? "extraLabel" : ""}
                    .style=${style}
                    @pointerdown=${(e) => this._lpStart(item, "longpress_label")}
                    @pointerup=${(e) => this._lpEnd(item, "label", "dbl_label")}
                    @pointercancel=${this._lpCancel}
                    @pointerleave=${this._lpCancel}
                    >
                    <span>${displayLabel}</span></li>`;
            })}</ul></div>`
            : html`` }
        `;
        return rendered;
    }
    renderLowerPart(icons) {
        // this is the grey area below where the recently completed items appear, so they can be uncompleted
        let rendered = html`
        ${this.myConfig.show_completed && this.itemsJustCompleted
            ? this.itemsJustCompleted.map(item => {
                    return html`<div class="powertodoist-item todoist-item-completed">
                        ${(this.myConfig.show_item_close === undefined) || (this.myConfig.show_item_close !== false)
                            ? html`<ha-icon-button
                                class="powertodoist-item-close"
                                 @pointerdown=${(e) => this._lpStart(item, "longpress_uncomplete")}
                                @pointerup=${(e) => this._lpEnd(item, "uncomplete", "dbl_uncomplete")}
                                @pointercancel=${this._lpCancel}
                                @pointerleave=${this._lpCancel} >
                                <ha-icon
                                    .icon=${"mdi:" + icons[2].name}
                                    style=${icons[2].color ? `color:${icons[2].color};` : ""}
                                ></ha-icon>
                                </ha-icon-button>`
                            : html`<ha-icon
                                        .icon=${"mdi:" + icons[0].name}
                                        style=${icons[0].color ? `color:${icons[0].color};` : ""}
                                    ></ha-icon>`
                        }
                        <div class="powertodoist-item-text">
                            ${item.description
                                ? html`<span class="powertodoist-item-content">${item.content}</span>
                                    <span class="powertodoist-item-description">${item.description}</span>`
                                : item.content}
                        </div>
                        ${(this.myConfig.show_item_delete === undefined) || (this.myConfig.show_item_delete !== false)
                            ? html`<ha-icon-button
                                class="powertodoist-item-delete"
                                @pointerdown=${(e) => this._lpStart(item, "longpress_unlist_completed")}
                                @pointerup=${(e) => this._lpEnd(item, "unlist_completed", "dbl_unlist_completed")}
                                @pointercancel=${this._lpCancel}
                                @pointerleave=${this._lpCancel}
                                >
                                <ha-icon
                                    .icon=${"mdi:" + icons[3].name}
                                    style=${icons[3].color ? `color:${icons[3].color};` : ""}
                                ></ha-icon>
                            </ha-icon-button>`
                            : html``}
                    </div>`;
                })
            : html``}
        `;
        return rendered;
    }
    renderFooter() {
        let rendered = html`
            ${(this.myConfig.show_item_add === undefined) || (this.myConfig.show_item_add !== false)
            ? html`<input
            id="powertodoist-card-item-add"
            type="text"
            class="powertodoist-item-add"
            placeholder="New item..."
            enterkeyhint="enter"
            @keyup=${this.itemAdd}
        />`
        : html``}
        `;
        if (this.myConfig.error) {
            this.showToast(this.myConfig.error, 15000, 3000);
            delete this.myConfig.error;
        }
        return rendered;
    }
    static get styles() {
        return css`
            .card-header {
                padding-bottom: unset;
            }
           
            .powertodoist-list {
                display: flex;
                padding: 15px;
                flex-direction: column;
                flex: 1; /* (For left accent: list takes remaining space */
            }
            .list-container {
                display: flex; /* place the accent and list side by side */
            }
            .left-accent {
                width: 0px; /* Accent width, starts collapsed to hide */
                background-color: #ff0000; /* Accent color */
                border-radius: 3px; /* Rounded corners */
                margin-right: 1px; /* Space between accent and list */
            }
            /* affects child items:
            .powertodoist-list > * {
                border-left: 3px solid #ff0000;
            }
            */
           
            .powertodoist-list-empty {
                padding: 15px;
                text-align: center;
                font-size: 24px;
            }
           
            .powertodoist-item {
                display: flex;
                flex-direction: row;
                line-height: 40px;
            }
            .powertodoist-item-completed {
                              /* border: 1px solid red; border-width: 1px 1px 1px 1px; */
                color: #808080;
            }
           
            .powertodoist-item-text, .powertodoist-item-text > span, .powertodoist-item-text > div {
                font-size: 16px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                                /* border: 1px solid green; border-width: 1px 1px 1px 1px; */
            }
            .powertodoist-item-content {
                display: block;
                margin: -6px 0 -6px;
                                 /* border: 1px solid red; border-width: 1px 1px 1px 1px; */
            }
            .powertodoist-item-description {
                display: block;
                opacity: 0.5;
                font-size: 12px !important;
                margin: -12px 0;
                                  /* border: 1px solid blue; border-width: 1px 1px 1px 1px; */
            }
           
            .powertodoist-item-close {
                /* border: 1px solid green; border-width: 1px 1px 1px 1px; */
                color: #008000;
            }
            .powertodoist-item-completed .powertodoist-item-close {
                color: #808080;
            }
           
            .powertodoist-item-delete {
                margin-left: auto;
                color: #800000;
                                /* border: 1px solid red; border-width: 1px 1px 1px 1px; */
            }
            .powertodoist-item-completed .powertodoist-item-delete {
                color: #808080;
            }
           
            .powertodoist-item-add {
                width: calc(100% - 30px);
                height: 32px;
                margin: 0 15px 30px;
                padding: 10px;
                box-sizing: border-box;
                border-radius: 5px;
                font-size: 16px;
            }
            .powertodoist-item ha-icon-button ha-icon {
                margin-top: -24px;
            }
            .powertodoist-special {
                font-weight: bolder;
                color: green;
            }
            /*General Label Style*/
            ul.labels {
                /* font-family: Verdana,Arial,Helvetica,sans-serif;*/
                font-weight: 100;
                line-height: 13px;
                padding: 0px 0px;
                margin-top: 6px;
                margin-bottom: 6px;
            }
            ul.labels li {
                display: inline;
                color: #CCCCCC;
                float: left;
                margin: -5px 2px 3px 0px;
                height: 15px;
                border-radius: 4px;
            }
            ul.labels li span {
                /* background: url(label_front.gif) no-repeat center left;*/
                font-size: 11px;
                font-weight: normal;
                white-space: nowrap;
                padding: 0px 3px;
                color: var(--ha-color-text-primary:);
                vertical-align: top;
                float: left;
            }
            ul.labels li a {
                padding: 1px 4px 0px 11px;
                padding-top /***/: 0px9; /*Hack for IE*/
                /* background: url(labelx.gif) no-repeat center right; */
                cursor: pointer;
                border-left: 1px dotted white;
                outline: none;
            }
            #powertodoist-toast {
                position: relative;
                bottom: 20px;
                left: 40%;
                transform: translateX(-50%);
                background-color: #333;
                color: #fff;
                padding: 10px 20px;
                border-radius: 14px;
                border: 1px solid red;
                /*border-width: 1px 1px 1px 1px;*/
                z-index: 1;
                display: none;
                text-align: center;
                margin: 15px 35px -30px 45px
            }
            .labelsDiv{
                display: inline-flex;
            }
            /*
            ul.labels li a:hover {
                background: url(labelx_hover.gif) no-repeat center right;
            }
            */
            .top-markdown {
                padding: 0 16px 16px 16px !important; 
                font-size: 14px;
                line-height: 1.4;
                user-select: text;
            }
            
            .bottom-markdown {
                padding: 16px 16px 0 16px !important;
                font-size: 14px;
                line-height: 1.4;
                user-select: text;
            }
    `;
    }
}
customElements.define('powertodoist-card-editor', PowerTodoistCardEditor);
customElements.define('powertodoist-card', PowerTodoistCard);
window.customCards = window.customCards || [];
window.customCards.push({
    preview: true,
    type: 'powertodoist-card',
    name: 'PowerTodoist Card',
    description: 'Custom card to interact with Todoist items.',
});
console.info(
    '%c POWERTODOIST-CARD ',
    'color: white; background: orchid; font-weight: 700',
);
/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 * https://blog.stevenlevithan.com/archives/javascript-date-format
 */
var dateFormat = function () {
var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
timezoneClip = /[^-+\dA-Z]/g,
pad = function (val, len) {
val = String(val);
len = len || 2;
while (val.length < len) val = "0" + val;
return val;
};
// Regexes and supporting functions are cached through closure
return function (date, mask, utc) {
var dF = dateFormat;
// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
mask = date;
date = undefined;
}
// Passing date through Date applies Date.parse, if necessary
date = date ? new Date(date) : new Date;
if (isNaN(date)) throw SyntaxError("invalid date");
mask = String(dF.masks[mask] || mask || dF.masks["default"]);
// Allow setting the utc argument via the mask
if (mask.slice(0, 4) == "UTC:") {
mask = mask.slice(4);
utc = true;
}
var _ = utc ? "getUTC" : "get",
d = date[_ + "Date"](),
D = date[_ + "Day"](),
m = date[_ + "Month"](),
y = date[_ + "FullYear"](),
H = date[_ + "Hours"](),
M = date[_ + "Minutes"](),
s = date[_ + "Seconds"](),
L = date[_ + "Milliseconds"](),
o = utc ? 0 : date.getTimezoneOffset(),
flags = {
d: d,
dd: pad(d),
ddd: dF.i18n.dayNames[D],
dddd: dF.i18n.dayNames[D + 7],
m: m + 1,
mm: pad(m + 1),
mmm: dF.i18n.monthNames[m],
mmmm: dF.i18n.monthNames[m + 12],
yy: String(y).slice(2),
yyyy: y,
h: H % 12 || 12,
hh: pad(H % 12 || 12),
H: H,
HH: pad(H),
M: M,
MM: pad(M),
s: s,
ss: pad(s),
l: pad(L, 3),
L: pad(L > 99 ? Math.round(L / 10) : L),
t: H < 12 ? "a" : "p",
tt: H < 12 ? "am" : "pm",
T: H < 12 ? "A" : "P",
TT: H < 12 ? "AM" : "PM",
Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
};
return mask.replace(token, function ($0) {
return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
});
};
}();
// Some common format strings
dateFormat.masks = {
"default": "ddd mmm dd yyyy HH:MM:ss",
shortDate: "m/d/yy",
mediumDate: "mmm d, yyyy",
longDate: "mmmm d, yyyy",
fullDate: "dddd, mmmm d, yyyy",
shortTime: "h:MM TT",
mediumTime: "h:MM:ss TT",
longTime: "h:MM:ss TT Z",
isoDate: "yyyy-mm-dd",
isoTime: "HH:MM:ss",
isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};
// Internationalization strings
dateFormat.i18n = {
dayNames: [
"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
],
monthNames: [
"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
]
};
// For convenience...
Date.prototype.format = function (mask, utc) {
return dateFormat(this, mask, utc);
};