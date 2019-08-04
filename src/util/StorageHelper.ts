import * as storage from "azure-storage";

export class StorageHelper {
	tableService = storage.createTableService(process.env.TABLESTORAGECONNECTIONSTRING);

	constructor() { };

	insertOrReplaceUser(entity: {}): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.tableService.insertOrReplaceEntity('users', entity, async function (error, result, response) {
				if (!error) {
					resolve(true);
				}
				else {
					reject(false);
					console.error(error);
				}
			});
		})
	}

	queryUsers(queryTerms: any): Promise<Array<{}>> {
		return new Promise((resolve, reject) => {
			let keys = Object.keys(queryTerms);
			var query = new storage.TableQuery().where(`${keys[0]} == ?`, queryTerms[keys[0]]);
			for (let i = 1; i < keys.length; i++) {
				query.and(`${keys[i]} == ?`, queryTerms[keys[i]]);
			}
			this.tableService.queryEntities('users', query, null, function (error, result, response) {
				if (!error) {
					resolve(result.entries);
				}
				else {
					reject(error);
					console.error(error);
				}
			});
		})

	}
}