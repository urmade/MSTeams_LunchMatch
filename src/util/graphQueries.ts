import { Authenticator } from "./graphAuthentication";
import * as request from "request";

export class GraphQuery {
	tokenHandler = new Authenticator();
	constructor() {
	 };

	getUserInformation(userId: string): Promise<any> {
		return new Promise(async (resolve, reject) => {
			if(!this.tokenHandler.currentToken) this.tokenHandler.currentToken = await this.tokenHandler.acquireToken();
			const options = {
				method: 'GET',
				headers: {
					Authorization: ' Bearer ' + this.tokenHandler.currentToken
				}
			}
			request("https://graph.microsoft.com/v1.0/users/" + userId, options, (error, response, body) => {
				if (!error) {
					resolve(JSON.parse(body));
				}
				else reject(error);
			})
		})
	}

	getGroupMembers(groupId: string): Promise<Array<string>> {
		return new Promise((resolve, reject) => {
			const options = {
				method: 'GET',
				headers: {
					Authorization: ' Bearer ' + this.tokenHandler.currentToken
				}
			}
			request(
				"https://graph.microsoft.com/v1.0/groups/" + groupId + "/members",
				options,
				(error, response, body) => {
					let users:Array<any> = JSON.parse(body).value;
					let userIds:Array<string> = [];
					users.forEach(user => {
						userIds.push(user["id"]);
					});
					if (!error) resolve(userIds);
					else reject(error);
				})
		})
	}
}