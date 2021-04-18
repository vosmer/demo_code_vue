import Api from '../services/api';
import AccountClass from './account.class';

export default class UserDivisionClass {
    constructor(obj) {
        this.id = obj.id || null;
        this.name = obj.name || null;
        this.ident = obj.ident || null;
        this.objType = 'division';
        this.children = [];

        obj.accounts = Api.fixArray(obj.accounts, 'account');
        if (obj.accounts.length > 0) {
            for (let item in obj.accounts) {
                this.children.push(new AccountClass(obj.accounts[item]));
            }
        }
    }
};
