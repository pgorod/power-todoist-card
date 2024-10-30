import {LitElement, html, css} from 'https://unpkg.com/lit-element@3.3.2/lit-element.js?module';
// TODO: register with HACS: https://hacs.xyz/docs/publish/start

const todoistColors = {
    "berry_red"   : "rgb(184, 37, 111)",
    "red"         : "rgb(219, 64, 53)",
    "orange"      : "rgb(255, 153, 51)",
    "yellow"      : "rgb(250, 208, 0)",
    "olive_green" : "rgb(175, 184, 59)",
    "lime_green"  : "rgb(126, 204, 73)",
    "green"       : "rgb(41, 148, 56)",
    "mint_green"  : "rgb(106, 204, 188)",
    "teal"        : "rgb(21, 143, 173)",
    "sky_blue"    : "rgb(20, 170, 245)",
    "light_blue"  : "rgb(150, 195, 235)",
    "blue"        : "rgb(64, 115, 255)",
    "grape"       : "rgb(136, 77, 255)",
    "violet"      : "rgb(175, 56, 235)",
    "lavender"    : "rgb(235, 150, 235)",
    "magenta"     : " rgb(224, 81, 148)",
    "salmon"      : "rgb(255, 141, 133)",
    "charcoal"    : "rgb(128, 128, 128)",
    "grey"        : "rgb(184, 184, 184)",
    "taupe"       : "rgb(204, 172, 147)",
}
  

function replaceMultiple(str2Replace, mapReplaces, was, input){
    mapReplaces["%was%"] = was;
    mapReplaces["%input%"] = input;
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
                <span>Show text input element for adding new items to the list</span>
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
        return this.hass ? (this.hass.states[this.config.entity].attributes.items.length || 1) : 1;
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
                            if (this.myConfig.filter_section && !qa.includes('/'))
                                qa = qa + ' /' + this.myConfig.filter_section; //.replaceAll(' ','');
                        } catch (error) { }
                        try {
                            if (state.attributes.project.name && !qa.includes('#'))
                                qa = qa + ' #' + state.attributes.project.name; //.replaceAll(' ','');
                        } catch (error) { }

                        this.hass
                            .callService('rest_command', 'todoist', {
                                url: 'quick/add',
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
        var parsedConfig;
        var project_notes = [];
        let myStrConfig = JSON.stringify(srcConfig);
        let date_formatted = (new Date()).format(this.myConfig["date_format"] || "mmm dd H:mm"); 
//        let date_formatted = (new Date()).format(srcConfig["date_format"] || "mmm dd H:mm");
        try { project_notes = this.hass.states[this.config.entity].attributes['project_notes'];} catch (error) { }
        const strLabels =  (typeof(item) !== "undefined" && item.labels) ? JSON.stringify(item.labels) : "";

        var mapReplaces = {
            "%user%"          : this.hass ? this.hass.user.name : "",
            "%date%"          : `${date_formatted}`,
            "%str_labels%"    : strLabels,
        };
        project_notes.forEach(function (value, index) {
            mapReplaces["%project_notes_" + index - 1 + '%'] = value.content;
            if (index==0) mapReplaces["%project_notes%"] = value.content;
        });

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
        return parsedConfig;
    }

    buildCommands(item, button = "actions_close") {
 
        let state = this.hass.states[this.config.entity].attributes;
        // calling parseConfig here repeats some work, but is helpful because %user% variable and others are now available:
        let actions = this.config[button] !== undefined ? this.parseConfig(this.config[button]) : []; 
        let automation = "", confirm = "", promptTexts = "", toast = "";
        let commands = [], updates = [], labelChanges = [], adds = [], allow = [], matches = [], emphasis = [];
        try { automation   = actions.find(a => typeof a === 'object' && a.hasOwnProperty('service')).service || "";} catch (error) { }       
        try { confirm      = actions.find(a => typeof a === 'object' && a.hasOwnProperty('confirm')).confirm || "";} catch (error) { }       
        try { promptTexts  = actions.find(a => typeof a === 'object' && a.hasOwnProperty('prompt_texts')).prompt_texts || "";} catch (error) { }       
        try { updates      = actions.find(a => typeof a === 'object' && a.hasOwnProperty('update')).update || [];} catch (error) { }       
        try { labelChanges = actions.find(a => typeof a === 'object' && a.hasOwnProperty('label')).label || [];} catch (error) { }       
        try { toast        = actions.find(a => typeof a === 'object' && a.hasOwnProperty('toast')).toast || "";} catch (error) { }       
        try { adds         = actions.find(a => typeof a === 'object' && a.hasOwnProperty('add')).add || [];} catch (error) { }       
        try { allow        = actions.find(a => typeof a === 'object' && a.hasOwnProperty('allow')).allow || [];} catch (error) { }       
        try { matches      = actions.find(a => typeof a === 'object' && a.hasOwnProperty('match')).match || [];} catch (error) { }       
        try { emphasis     = actions.find(a => typeof a === 'object' && a.hasOwnProperty('emphasis')).emphasis || [];} catch (error) { }       

        const strLabels =  JSON.stringify(item.labels); // moved to Parse, delete when not needed
        let labels = item.labels;
        if (labelChanges.includes("!*")) labels = []; // use !* to clear all    
        if (labelChanges.includes("!_")) labels =     // use !_ to clear all labels starting with _   
            labels.filter(function(label) { return label[0] !== '_'; }); 
        if (labelChanges.includes("!!")) labels =     // use !! to clear all labels NOT starting with _   
            labels.filter(function(label) { return label[0] === '_'; }); 
        labelChanges.map(change => {
            if (change.startsWith("!")) {
                if (labels.includes(change.slice(1))) labels = labels.filter(e => e !== change.slice(1)); // remove it
            } else {
                let newLabel = replaceMultiple(change, {"%user%":this.hass.user.name});
                if (!labels.includes(newLabel)) labels.push(newLabel); // add it
            }
        });
  
        // Let's make things really easy to use further down:
        let section_id2order = {}; // Object, not array - we store section_ids as strings
        section_id2order[""] = 0; // not really a section in Todoist, but when incremented, will move to first section
        let section_order2id = [];
        state.sections.map(s => {
            section_id2order[s.id.toString()] = s.section_order;
            section_order2id[s.section_order] = s.id;
            //section_id2name[s.id.toString()] = s.name;
            //section_name2id[s.name] = s.id;
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

        let date_formatted2 = (new Date()).format(this.myConfig["date_format"] || "mmm dd H:mm"); // moved to Parse, delete when not needed
        var mapReplaces = {    // OLD OLD OLD
            "%user%": this.hass.user.name,
            "%date%": `${date_formatted2}`,
            "%str_labels%" : strLabels,
        };

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
            "actions_content" : { "type": "item_update", "uuid": this.getUUID(), "args": { "id": item.id, "content": input } },
            "actions_dbl_content" : {},
            "actions_description" : { "type": "item_update", "uuid": this.getUUID(), "args": { "id": item.id, "description": input } },
            "actions_dbl_description" : {},
            "actions_label" : {},
            "actions_dbl_label" : {},
            "actions_delete" : { 'type': 'item_delete', 'uuid': this.getUUID(), 'args': {'id': item.id } },
            "actions_dbl_delete" : {},
            "actions_uncomplete" : { 'type': 'item_uncomplete', 'uuid': this.getUUID(), 'args': {'id': item.id } },
            "actions_dbl_uncomplete" : {},
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

        matches.forEach(([field, value, subActions]) => {
            if ((Array.isArray(item[field]) && item[field].includes(value)) ||
            item[field] == value)
            this.itemAction(item, subActions);
        })

        return [commands, adds, automation, toast];
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
            },  duration + 1000);
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

    async clearSpecialCSSNOTNOTNOT(duration) {
    // this.hass.states[this.config.entity].last_updated 
        //var element = this.shadowRoot.querySelector(".powertodoist-item-content");
        
        var specials=this.shadowRoot.querySelectorAll(".powertodoist-special");
        specials.forEach(s => {
            setTimeout(() => {
                s.classList.remove("powertodoist-special");
                //s.innerText = 'cleared';
                // clear up all items
                this.itemsEmphasized = [];    
            }, duration);
        }); 
    }


    async processAdds(adds) {
        for (const item of adds) {
            this.hass.callService('rest_command', 'todoist', {
                url: 'quick/add',
                payload: 'text=' + item,
            });
        }
    }

    itemAction(item, action) {
        //var myConfig = this.parseConfig(this.config);

        if (item === undefined) return; // will happen when renderLabels is used for the card-level labels
        action = action.toLowerCase();
        let commands = [], adds = [], automation = [];
        let toast = "";
        [commands, adds, automation, toast] = this.buildCommands(item, "actions_" + action);
        //this.showToast(toast ? toast : action, 3000);
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
                switch (action) {
                    case 'close':
                        if (this.itemsJustCompleted.length >= this.config.show_completed) 
                           this.itemsJustCompleted.splice(0, this.itemsJustCompleted.length - this.config.show_completed + 1);
                        this.itemsJustCompleted.push(item);
                    break;
                    case 'content':        
                    break;
                    case 'delete':
                    break;

                    case 'unlist_completed': // removes from internal list
                    case 'uncomplete':       // removes from internal list and uncloses in todoist
                        this.itemsJustCompleted = this.itemsJustCompleted.filter(v => {
                            return v.id != item.id;
                        });
                    break;

                    default:
                  }
                if (action === "close") {
                } 
            });

        // deal with automations:    
        if (automation.length) {
            this.hass.callService(
                automation.includes('script.') ? 'homeassistant' : 'automation', 
                automation.includes('script.') ? 'turn_on' : 'trigger', 
                { entity_id: automation, }
            ).then(function() {
                console.log('Automation triggered successfully from todoist JS!');
            }).catch(function(error) {
                console.error('Error triggering automation from todoist JS:', error);
            });
        }        
        this.hass.callService('homeassistant', 'update_entity', {
            entity_id: this.config.entity,
        });
    }

    itemUncompleteNOT(item) {
        let commands = [{
            'type': 'item_uncomplete',
            'uuid': this.getUUID(),
            'args': {
                'id': item.id,
            },
        }];
        
        this.hass
            .callService('rest_command', 'todoist', {
                url: 'sync',
                payload: 'commands=' + JSON.stringify(commands),
            })
            .then(response => {
                this.itemUnlistCompleted(item);

                // this.hass.callService('homeassistant', 'update_entity', {
                //     entity_id: this.config.entity,
                // });
            });
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
            (typeof this.myConfig.filter_show_dates_ending   !== 'undefined')) {
            let startCompare = Number(this.myConfig.filter_show_dates_starting);
            let endCompare   = Number(this.myConfig.filter_show_dates_ending);
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
                   duration = item.duration.unit == 'day' ? // it's either 'day' or  'minute'
                              (item.duration.amount * 24 * 60 * 60 * 1000) : 
                              (item.duration.amount *  1 *  1 * 60 * 1000);

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
                let passEnd   = isNaN(endCompare)   ? true : endCompare   >= dItem2; // items coming in to view
                return passStart && passEnd;
            });
        }

        return items;

        /*
        if (this.myConfig.filter_today_overdue) { // tasks start showing on day when due, end showing never
            items = items.filter(item => {        
                if (!item.due) return false;
                item.due.date += /^\d{4}-\d{2}-\d{2}$/.test(item.due.date) ? 'T00:00:00' : '' // adds time if missing
                return (new Date()).setHours(23, 59, 59, 999) >= (new Date(item.due.date)).getTime();                
            });
        }

        var dNowPlus;
        if ((typeof this.myConfig.filter_due_days_out !== 'undefined') && this.myConfig.filter_due_days_out !== -1) {
            // tasks start showing n days before due, end showing never
            const days_out = this.myConfig.filter_due_days_out;
            dNowPlus = days_out == 0 ? 
                        new Date() + (days_out * 24 * 60 * 60 * 1000) :
                        new Date().setHours(23, 59, 59, 999) + (days_out * 24 * 60 * 60 * 1000);
            items = items.filter(item => {
                if (!item.due) return false;
                item.due.date += /^\d{4}-\d{2}-\d{2}$/.test(item.due.date) ? 'T00:00:00' : '' // adds time if missing
                dItem = (new Date(item.due.date)).getTime();
                return dNowPlus >= dItem;
            });
        }
        */
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

    render() {
        this.myConfig = this.parseConfig(this.config);
        let state = this.hass.states[this.config.entity] || undefined;
        if (!state) {
           throw new Error("thrown by pgr: state undefined in render");
        }
        var label_colors = this.hass.states["sensor.label_colors"] || undefined; 
        if (!state || !label_colors) {
            return html`Sensors don't have any data yet. Please wait a few seconds and refresh.`;
        }
        label_colors = label_colors.attributes.label_colors;

        var icons = ((typeof this.config.icons !== 'undefined') && (this.config.icons.length == 4)) 
            ? this.config.icons 
            : ["checkbox-marked-circle-outline", "circle-medium", "plus-outline", "trash-can-outline"]; 
        
        let items = state.attributes.items || [];

        items = this.filterDates(items);
        items = this.filterPriority(items);
        
        // filter by section:
        let section_name2id = [];
        if (!this.myConfig.filter_section_id && this.myConfig.filter_section) {
            //let state = this.hass.states[this.config.entity].attributes;
            state.attributes.sections.map(s => {
                section_name2id[s.name] = s.id;
            });            
        }
        let section_id = this.myConfig.filter_section_id || section_name2id[this.myConfig.filter_section] || undefined;
        if (section_id) {
            items = items.filter(item => {
                return item.section_id === section_id;
            });
        }

        // filter by label:
        var includes, excludes;
        var cardLabels=[];
        var hiddenLabels=[];
        var itemLabels=[];
        if (this.myConfig.filter_labels) {
            items = items.filter(item => {
                includes = excludes = 0;
                //this.config.labels.forEach(label => {
                this.myConfig.filter_labels.forEach(label => {
                    let l = label; //replaceMultiple(label, { "%user%" : this.hass.user.name });
                    if (l.startsWith("!")) {
                        excludes += item.labels.includes(l.slice(1));
                    } else {
                        includes += item.labels.includes(l) || (l === "*");
                        if (!cardLabels.includes(l)) cardLabels.push(l);
                    }
                });
                return (excludes == 0) && (includes > 0);
            });
        }

    // Starts with named section or default, tries to get section name from id, but lets friendly_name override it:
    let cardName = this.config.filter_section || "ToDoist";
    try { cardName = state.attributes.sections.find(s => { return s.id === section_id }).name } catch (error) { }       
    cardName = this.config.friendly_name || cardName;

// https://lit.dev/docs/v1/lit-html/writing-templates/#repeating-templates-with-looping-statements

    //this.clearSpecialCSS(2000);

    return html`<ha-card>
        ${(this.config.show_header === undefined) || (this.config.show_header !== false)
            ? html`<h1 class="card-header">
                <div class="name">${cardName}
                ${(this.config.show_card_labels === undefined) || (this.config.show_card_labels !== false)
                    ? html`${this.renderLabels(undefined, (cardLabels.length == 1 ? cardLabels : []), [], label_colors)}`
                    : html``
                }
                </div>
                </h1>
                <div id="powertodoist-toast">${this.toastText}</div>`
            : html``}
        <div class="powertodoist-list">
            ${items.length
                ? items.map(item => {
                    return html`<div class="powertodoist-item" .id=${"item_" + item.id}>
                        ${(this.config.show_item_close === undefined) || (this.config.show_item_close !== false)
                            ? html`<ha-icon-button
                                class="powertodoist-item-close"
                                @click=${() => this.itemAction(item, "close")} 
                                @dblclick=${() => this.itemAction(item, "dbl_close")} >
                                <ha-icon .icon=${"mdi:" + icons[0]}></ha-icon>
                            </ha-icon-button>`
                            : html`<ha-icon .icon=${"mdi:" + icons[1]}></ha-icon>` }
                            <div class="powertodoist-item-text"><div 
                                    @click=${() => this.itemAction(item, "content")} 
                                    @dblclick=${() => this.itemAction(item, "dbl_content")}
                            >
                                <span class="powertodoist-item-content ${(this.itemsEmphasized[item.id]) ? css`powertodoist-special` : css``}" >
                                ${item.content}</span></div>
                                ${item.description
                                    ? html`<div
                                        @click=${() => this.itemAction(item, "description")} 
                                        @dblclick=${() => this.itemAction(item, "dbl_description")}   
                                    ><span class="powertodoist-item-description">${item.description}</span></div>`
                                    : html`` }
                                ${this.renderLabels(item, 
                                    // labels:
                                    [this.myConfig.show_dates && item.due ? dateFormat(item.due.date, "🗓 dd-mmm H'h'MM") : [],
                                     ...item.labels].filter(String), // filter removes the empty []s
                                    // exclusions:
                                    [...(cardLabels.length == 1 ? cardLabels : []), // card labels excluded unless more than one
                                     ...item.labels.filter(l => l.startsWith("_"))], // "_etc" labels excluded
                                    label_colors) }
                            </div>
                            ${(this.config.show_item_delete === undefined) || (this.config.show_item_delete !== false)
                                ? html`<ha-icon-button
                                    class="powertodoist-item-delete"
                                    @click=${() => this.itemAction(item, "delete")} 
                                    @dblclick=${() => this.itemAction(item, "dbl_delete")} >
                                    <ha-icon .icon=${"mdi:" + icons[3]}></ha-icon>
                                </ha-icon-button>`
                                : html``}    
                        </div>
                    </div>`;
                })
                : html`<div class="powertodoist-list-empty">No uncompleted tasks!</div>`}
            ${this.renderLowerPart(icons)}
        </div>
        ${this.renderFooter()}
        </ha-card>`;
    }
    
    renderLabels(item, labels, exclusions, label_colors) {
        if ((item !== undefined) && (this.config.show_item_labels === false)) {
            // remove all labels except the due date if it is there:
            labels = this.myConfig.show_dates && item.due ? Array(labels[0]) : [];
        }

        let rendered = html`
            ${(labels.length - exclusions.length > 0) 
                ? html`<div class="labelsDiv"><ul class="labels">${labels.map( label => 
                    !exclusions.includes(label)  ? html`<li 
                        .style=${'background-color: ' + 
                        todoistColors[
                            label_colors.filter(lc=>{ return lc.name===label }).length 
                            ? label_colors.filter(lc=>{ return lc.name===label })[0].color 
                            : "black" ]}
                        @click=${() => this.itemAction(item, "label")}
                        @dblclick=${() => this.itemAction(item, "dbl_label")}
                        ><span>${label}</span></li>`
                    : html``)
                    }</ul></div>` 
                : html`` }
        `;
        return rendered;
    }

    renderLowerPart(icons) {
        // this is the grey area below where the recently completed items appear, so they can be uncompleted
        let rendered = html`
        ${this.config.show_completed && this.itemsJustCompleted
            ? this.itemsJustCompleted.map(item => {
                    return html`<div class="powertodoist-item todoist-item-completed">
                        ${(this.config.show_item_close === undefined) || (this.config.show_item_close !== false)
                            ? html`<ha-icon-button
                                class="powertodoist-item-close"
                                @click=${() => this.itemAction(item, "uncomplete")} 
                                @dblclick=${() => this.itemAction(item, "dbl_uncomplete")} >
                                <ha-icon .icon=${"mdi:" + icons[2]}></ha-icon>
                            </ha-icon-button>`
                            : html`<ha-icon .icon=${"mdi:" + icons[0]} ></ha-icon>`}
                        <div class="powertodoist-item-text">
                            ${item.description
                                ? html`<span class="powertodoist-item-content">${item.content}</span>
                                    <span class="powertodoist-item-description">${item.description}</span>`
                                : item.content}
                        </div>
                        ${(this.config.show_item_delete === undefined) || (this.config.show_item_delete !== false)
                            ? html`<ha-icon-button
                                class="powertodoist-item-delete"
                                @click=${() => this.itemAction(item, "unlist_completed")} 
                                @dblclick=${() => this.itemAction(item, "dbl_unlist_completed")} >
                                <ha-icon .icon=${"mdi:" + icons[3]}></ha-icon>
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
            ${(this.config.show_item_add === undefined) || (this.config.show_item_add !== false)
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
        if (this.config.error) {
            this.showToast(this.config.error, 15000, 3000);
            delete this.config.error;
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
                flex-direction: column;
                padding: 15px;
            }
            
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
                              /*  border: 1px solid red; border-width: 1px 1px 1px 1px; */
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
            .powertodoist-special {
                font-weight: bolder;
                color: darkred;
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
                color: white;
                vertical-align: top;
                float: left;
            }

            ul.labels li a {
                padding: 1px 4px 0px 11px;
                padding-top  /***/: 0px9; /*Hack for IE*/
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
                z-index: 999;
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
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
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

		var	_ = utc ? "getUTC" : "get",
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
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
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
