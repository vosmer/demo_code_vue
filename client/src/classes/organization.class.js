import Api from '../services/api';
import UserDivisionClass from './user-division.class';

export default class OrganizationClass {
    keymap() { // map keys
        return {
            'id':                   'id',
            'name':                 'name',
            'ident':                'ident',
            'orderNumber':          'orderNumber',
            'objType':              'objType',
            'treeKey':              'treeKey',
            'children':             'children',
            'childrenCount':        'childrenCount',
            'isEmpty':              'isEmpty',
        };
    }
    constructor(initial, mode) {
        let keyMap = this.keymap();
        let _that = this;
        let obj = initial;
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
            switch(k) {
                case 'id':
                    if (typeof(initial[keyName]) != 'undefined') {
                        this[k] = initial[keyName];
                    }
                    break;
                case 'objType':
                    this[k] = initial[keyName] || 'org';
                    break;
                case 'childrenCount':
                    this[k] = (initial[keyName])? parseInt(initial[keyName]): 0;
                    break;
                case 'isEmpty':
                    this[k] = (this.childrenCount && parseInt(this.childrenCount) > 0 )? false: true;
                    break;
                case 'children':
                    this[k] = [];
                    break;
                default:
                    this[k] = initial[keyName] || null;
                    break;
            }
        }

        this.treeKey = 'org' + initial.id;

        initial.children = Api.fixArray(initial.children, 'child');
        if (initial.children.length > 0) {
            for (let item in initial.children) {
                this.children.push(new OrganizationClass(initial.children[item]));
            }
        }

        initial.divisions = Api.fixArray(initial.divisions, 'division');
        if (initial.divisions.length > 0) {
            for (let item in initial.divisions) {
                this.children.push(new UserDivisionClass(initial.divisions[item]));
            }
        }

    }
};

