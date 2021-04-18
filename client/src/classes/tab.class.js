export default class TabClass {
    keymap() {
        return {
            'id':                   'id',
            'type':                 'type',
            'name':                 'name',
            'current_page':         'current_page',
        };
    }

    constructor(initial) {
        let keyMap = this.keymap();
        let keyName;
        for (let k in keyMap) {
            keyName = keyMap[k];
            switch (k) {
                case 'id':
                    this[k] = (initial[keyName] || initial[keyName] === 0)? initial[keyName]: null;
                    break;
                default:
                    this[k] = initial[keyName] || null;
                    break;
            }
        }
    }
};
