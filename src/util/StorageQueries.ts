import * as storage from "azure-storage";
import { StorageUser } from "../models/LunchMatch/user";

export class StorageQuery {
	tableService = storage.createTableService(process.env.TABLESTORAGECONNECTIONSTRING);

	constructor() { };

	insertOrReplaceUser(entity: {[key:string]:any}): Promise<boolean> {
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

	queryUsers(queryTerms: any): Promise<Array<StorageUser>> {
		return new Promise((resolve, reject) => {
			let keys = Object.keys(queryTerms);
			var query = new storage.TableQuery().where(`${keys[0]} == ?`, queryTerms[keys[0]]);
			for (let i = 1; i < keys.length; i++) {
				query.and(`${keys[i]} == ?`, queryTerms[keys[i]]);
			}
			this.tableService.queryEntities('users', query, null, function (error, result: any, response) {
				if (!error) {
					let users: Array<StorageUser> = [];
					for (let i = 0; i < result.entries.length; i++) {
						users.push(StorageUser.fromJSON(result.entries[i]));
					}
					resolve(users);
				}
				else {
					reject(error);
					console.error(error);
				}
			});
		})
	}

	getAllUsers(): Promise<Array<StorageUser>> {
		return new Promise((resolve, reject) => {
			var query = new storage.TableQuery();
			this.tableService.queryEntities('users', query, null, function (error, result: any, response) {
				if (!error) {
					let users:Array<StorageUser> = [];
					for (let i = 0; i < result.entries.length; i++) {
						users.push(StorageUser.fromJSON(result.entries[i]));
					}
					resolve(users);
				}
				else {
					reject(error);
					console.error(error);
				}
			});
		})
	}
}