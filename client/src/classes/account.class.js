import Api from '../services/api';
import RoleClass from './role.class';

export default class AccountClass {
    keymap() { // map keys
        return {
            'id':                   'id',
            'name':                 'name',
            'lastName':             'lastName',
            'firstName':            'firstName',
            'midName':              'midName',
            'login':                'login',
            'email':                'email',
            'timezone':             'timezone',
            'isActive':             'isActive',
            'division':             'division',
            'roles':                'roles',
            'objType':              'objType',
            'lastReceivedNotificationId': 'lastSentNotificationId',
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
                case 'lastName':
                case 'firstName':
                case 'midName':
                    if (mode === 'fromBack') {
                        this[k] = Api.fixString(initial[keyName]);
                    }
                    break;
                case 'lastReceivedNotificationId':
                    this[k] = initial[keyName] ? initial[keyName] : 0;
                    break;
                case 'objType':
                        this[k] = 'account';
                    break;
                case 'isActive':
                    this[k] = (initial[keyName] && (initial[keyName] !== "false"))? true: false;
                    break;
                case 'roles':
                    this[k] = [];
                    if (mode === 'fromBack') {
                        initial[keyName] = Api.fixArray(initial[keyName], 'role');
                    }
                    if (initial[keyName].length > 0) {
                        for (let item in initial[keyName]) {
                            this[k].push(new RoleClass(initial[keyName][item], mode));
                        }
                    }
                    break;
                default:
                    this[k] = initial[keyName] || null;
                    break;
            }
        }
    }
};
