import Api from '../services/api';
import PermissionClass from './permission.class';

export default class RoleClass {
    keymap() { // map keys
        return {
            'id':                   'id',
            'name':                 'name',
            'description':          'description',
            'permissions':          'permissions',
        };
    }
    keymapCreation() { // map keys for creation
        return {
            'name':                 'name',
            'description':          'description',
            'permissions':          'permissions',
        };
    }
    keymapUpdate() { // map keys for update
        return {
            'id':                   'id',
            'name':                 'name',
            'description':          'description',
            'permissions':          'permissions',
        };
    }
    constructor(initial, mode) {
        let keyMap = this.keymap();
        if (typeof(mode) == "undefined") {
            mode = 'fromBack';
        }
        for (let k in keyMap) {
            let keyName;
            //getting correct side from keyMap depending on mode
            if (mode === 'fromBack') {
                keyName = keyMap[k];
            }
            if (mode === 'fromFront') {
                keyName = k;
            }
            switch (k) {
                case 'id':
                    if (typeof(initial[keyName]) != 'undefined') {
                        this[k] = initial[keyName];
                    }
                    break;
                case 'permissions':
                    this[k] = [];
                    if (mode === 'fromBack') {
                        initial[keyName] = Api.fixArray(initial[keyName], 'permission');
                    }
                    if (initial[keyName].length > 0) {
                        for (let item in initial[keyName]) {
                            this[k].push(new PermissionClass(initial[keyName][item], mode));
                        }
                    }
                    break;
                default:
                    this[k] = initial[keyName] || null;
                    break;
            }
        }
    }
    prepareCreationObject() {
        let keyMap = this.keymapCreation();
        let resultObject = {};

        for (let k in keyMap) {
            switch(k) {
                case 'permissions':
                    let permissionsPrepared = [];
                    _.each(this[k], function(el,ke) {
                        permissionsPrepared.push({'id': el.id });
                    });
                    resultObject[keyMap[k]] = permissionsPrepared;
                    break;
                default:
                    resultObject[keyMap[k]] = this[k] || null;
            }
        }
        return resultObject;
    }
    prepareUpdateObject() {
        let keyMap = this.keymapUpdate();
        let resultObject = {};

        for (let k in keyMap) {
            switch(k) {
                case 'permissions':
                    let permissionsPrepared = [];
                    _.each(this[k], function(el,ke) {
                        permissionsPrepared.push({'id': el.id });
                    });
                    resultObject[keyMap[k]] = permissionsPrepared;
                    break;
                default:
                    resultObject[keyMap[k]] = this[k] || null;
            }
        }
        return resultObject;
    }
};
