import Api from '../services/api';
import SystemLogClass from '../classes/system-log.class';
import ChangeLogClass from '../classes/change-log.class';
import SyncLogClass from "../classes/sync-log.class";
import SyncLogDetailsClass from "../classes/sync-log-details.class";

export default {
    systemList(data, type) {
        let methodName = 'readUserLog';
        switch(type) {
            case 'user':
                methodName = 'readUserLog';
                break;
            case 'system':
                methodName = 'readSystemLog';
                break;
            case 'transport':
                methodName = 'readTransportLog';
                break;
            default:
                methodName = 'readUserLog';
                break;
        }
        return new Promise(function (resolve, reject) {
            let result = Api.postSoap('admin', methodName, data).then((response) => {
                let ar = {};
                ar[type + 'Log'] = response.page.content[type + 'Log'];
                let fixedResponse = Api.fixArray(ar);
                let results = {
                    content: [],
                    total: parseInt(response.page.totalElements) || 0,
                };
                fixedResponse.forEach((respItem) => {
                    results.content.push(new SystemLogClass(respItem));
                });
                resolve(results);
            }).catch((error) => {
                reject(error);
            });
            resolve(result);
        }).catch((err) => {
            throw err;
        });

    },
    syncLog(data) {
        return new Promise(function (resolve, reject) {
            let result = Api.postSoap('admin', 'readNsiSynchronizationLog', data).then((response) => {
                if (response && response.page) {
                    resolve(new SyncLogClass(response.page));
                } else {
                    reject('Bad request from readNsiSynchronizationLog');
                }
            }).catch((error) => {
                reject(error);
            });
            resolve(result);
        });
    },
    syncLogDetails(data) {
        return new Promise(function (resolve, reject) {
            let result = Api.postSoap('admin', 'readNsiSynchronizationLogDetail', data).then((response) => {
                if (response && response.page) {
                    resolve(new SyncLogDetailsClass(response.page));
                } else {
                    reject('Bad request from readNsiSynchronizationLogDetail');
                }
            }).catch((error) => {
                reject(error);
            });
            resolve(result);
        });
    },
    changeLog(data) {
        return new Promise(function (resolve, reject) {
            let result = Api.postSoap('admin', 'readChangeLog', data).then((response) => {
                if (response && response.page) {
                    resolve(new ChangeLogClass(response.page));
                } else {
                    reject('Bad request from readChangeLog');
                }
            }).catch((error) => {
                reject(error);
            });
            resolve(result);
        });
    },
}
