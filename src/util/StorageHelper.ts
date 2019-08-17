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

	insertEvent(entity: {}): Promise<any> {
		return new Promise((resolve, reject) => {
			this.tableService.insertEntity('lunchmeetings', entity, async function (error, result:any, response) {
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
			this.tableService.queryEntities('users', query, null, function (error, result:any, response) {
				if (!error) {
					for(let i = 0; i < result.entries.length; i++) {
						if(result.entries[i].PartitionKey) result.entries[i].PartitionKey = result.entries[i].PartitionKey["_"];
						if(result.entries[i].RowKey) result.entries[i].RowKey = result.entries[i].RowKey["_"];
						if(result.entries[i].additionalCoffee) result.entries[i].additionalCoffee = result.entries[i].additionalCoffee["_"];
						if(result.entries[i].atu) result.entries[i].atu = result.entries[i].atu["_"];
						if(result.entries[i].career) result.entries[i].career = result.entries[i].career["_"];
						if(result.entries[i].csu) result.entries[i].csu = result.entries[i].csu["_"];
						if(result.entries[i].dailyWork) result.entries[i].dailyWork = result.entries[i].dailyWork["_"];
						if(result.entries[i].department) result.entries[i].department = result.entries[i].department["_"];
						if(result.entries[i].nonWork) result.entries[i].nonWork = result.entries[i].nonWork["_"];
						if(result.entries[i].ocp) result.entries[i].ocp = result.entries[i].ocp["_"];
						if(result.entries[i].other) result.entries[i].other = result.entries[i].other["_"];
						if(result.entries[i].preferredLunchDuration) result.entries[i].preferredLunchDuration = result.entries[i].preferredLunchDuration["_"];
						if(result.entries[i].preferredLunchTime) result.entries[i].preferredLunchTime = result.entries[i].preferredLunchTime["_"];
					}
					resolve(result.entries);
				}
				else {
					reject(error);
					console.error(error);
				}
			});
		})
	}

	//TODO: All user query
	getAllUsers(): Promise<Array<{}>> {
		return new Promise((resolve, reject) => {
			var query = new storage.TableQuery();
			this.tableService.queryEntities('users', query, null, function (error, result:any, response) {
				if (!error) {
					for(let i = 0; i < result.entries.length; i++) {
						if(result.entries[i].PartitionKey) result.entries[i].PartitionKey = result.entries[i].PartitionKey["_"];
						if(result.entries[i].RowKey) result.entries[i].RowKey = result.entries[i].RowKey["_"];
						if(result.entries[i].additionalCoffee) result.entries[i].additionalCoffee = result.entries[i].additionalCoffee["_"];
						if(result.entries[i].atu) result.entries[i].atu = result.entries[i].atu["_"];
						if(result.entries[i].career) result.entries[i].career = result.entries[i].career["_"];
						if(result.entries[i].csu) result.entries[i].csu = result.entries[i].csu["_"];
						if(result.entries[i].dailyWork) result.entries[i].dailyWork = result.entries[i].dailyWork["_"];
						if(result.entries[i].department) result.entries[i].department = result.entries[i].department["_"];
						if(result.entries[i].nonWork) result.entries[i].nonWork = result.entries[i].nonWork["_"];
						if(result.entries[i].ocp) result.entries[i].ocp = result.entries[i].ocp["_"];
						if(result.entries[i].other) result.entries[i].other = result.entries[i].other["_"];
					}
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