import { Authenticator } from "./graphAuthentication";
import * as request from "request";

export class GraphQuery {
	tokenHandler = new Authenticator();
	constructor() {
	};

	getUser(userId: string): Promise<any> {
		return new Promise(async (resolve, reject) => {
			if (!this.tokenHandler.currentToken) this.tokenHandler.currentToken = await this.tokenHandler.acquireToken();
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

	getUsers(userIds: Array<string>): Promise<Array<any>> {
		return new Promise(async (resolve, reject) => {
			if (!this.tokenHandler.currentToken) this.tokenHandler.currentToken = await this.tokenHandler.acquireToken();
			const options = {
				method: 'GET',
				headers: {
					Authorization: ' Bearer ' + this.tokenHandler.currentToken
				}
			}
			let namePromises: Array<Promise<any>> = [];
			for (let i = 0; i < userIds.length; i++) {
				namePromises.push(new Promise((resol, rejec) => {
					request("https://graph.microsoft.com/v1.0/users/" + userIds[i], options, (error, response, body) => {
						if (!error) {
							resol(JSON.parse(body));
						}
						else rejec(error);
					})
				}))
			}
			resolve(await Promise.all(namePromises));
		})
	}

	getEvents(userId: string): Promise<Array<any>> {
		return new Promise(async (resolve, reject) => {
			if (!this.tokenHandler.currentToken) this.tokenHandler.currentToken = await this.tokenHandler.acquireToken();
			const options = {
				method: 'GET',
				headers: {
					Authorization: ' Bearer ' + this.tokenHandler.currentToken
				}
			}
			request("https://graph.microsoft.com/v1.0/users/" + userId + "/events?$orderby=start/dateTime", options, (error, response, body) => {
				if (!error) {
					resolve(JSON.parse(body).value);
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
					let users: Array<any> = JSON.parse(body).value;
					let userIds: Array<string> = [];
					users.forEach(user => {
						userIds.push(user["id"]);
					});
					if (!error) resolve(userIds);
					else reject(error);
				})
		})
	}

	//Evil Spaghetti code, do not touch, could explode!
	async findLunchTime(users: Array<any>): Promise<any> {

		let userOne = await this.getUser(users[0].RowKey);
		let userTwo = await this.getUser(users[1].RowKey);

		let userOneCalendar = await this.getEvents(users[0].RowKey);
		let userTwoCalendar = await this.getEvents(users[1].RowKey);

		let preferredDuration = Math.min(users[0].preferredLunchDuration, users[1].preferredLunchDuration);
		let preferredStart = Math.min(this.preferredTimeToInt(users[0].preferredLunchTime), this.preferredTimeToInt(users[1].preferredLunchTime));
		let hStart = Math.floor(preferredStart / 60);
		let mStart = preferredStart % 60;

		let preferredEnd = preferredStart + preferredDuration;
		let hEnd = Math.floor(preferredEnd / 60);
		let mEnd = preferredEnd % 60;

		let lunchStart: Date = new Date();
		lunchStart.setHours(hStart - 2);
		lunchStart.setMinutes(mStart);
		lunchStart.setMilliseconds(0);

		let lunchEnd: Date = new Date();
		lunchEnd.setHours(hEnd - 2);
		lunchEnd.setMinutes(mEnd);
		lunchEnd.setMilliseconds(0);

		if (new Date().getHours() > hStart && new Date().getMinutes() > mStart) {
			lunchStart.setDate(lunchStart.getDate() + 1);
			lunchEnd.setDate(lunchEnd.getDate() + 1);
		}

		let consent = false;



		if (!(userOneCalendar.length == 0 && userTwoCalendar.length == 0)) {
			while (!consent) {
				while (
					!(userOneCalendar.length == 0) &&
					new Date(userOneCalendar[0].end.dateTime) < lunchStart ||
					(!(userOneCalendar.length == 0) && (new Date(userOneCalendar[0].end.dateTime).getDay() == 6 || new Date(userOneCalendar[0].end.dateTime).getDay() == 0))
				)
					userOneCalendar.shift();
				while (
					!(userTwoCalendar.length == 0) &&
					new Date(userTwoCalendar[0].end.dateTime) < lunchStart ||
					(!(userTwoCalendar.length == 0) && (new Date(userTwoCalendar[0].end.dateTime).getDay() == 6 || new Date(userTwoCalendar[0].end.dateTime).getDay() == 0))
				)
					userTwoCalendar.shift();

				if ((userOneCalendar.length == 0 || new Date(userOneCalendar[0].start.dateTime) > lunchEnd)
					&& (userTwoCalendar.length == 0 || new Date(userTwoCalendar[0].start.dateTime) > lunchEnd)
					&& lunchStart.getDay() < 6 && lunchStart.getDay() > 0) {
					consent = true;
				}
				else {
					lunchStart.setDate(lunchStart.getDate() + 1);
					lunchEnd.setDate(lunchEnd.getDate() + 1);
				}
			}
		}


		lunchStart.setHours(lunchStart.getHours() + 2);
		lunchEnd.setHours(lunchEnd.getHours() + 2)

		let body = {
			"subject": "Lunch (by Lunch Match)",
			"body": {
				"contentType": "HTML",
				"content": "Hey, great that you two meet!"
			},
			"start": {
				"dateTime": lunchStart.toISOString(),
				"timeZone": "Europe/Berlin"
			},
			"end": {
				"dateTime": lunchEnd.toISOString(),
				"timeZone": "Europe/Berlin"
			},
			"location": {
				"displayName": "At the canteen entry"
			},
			"attendees": [
				{
					"emailAddress": {
						"address": userOne.mail
					},
					"type": "required"
				},
				{
					"emailAddress": {
						"address": userTwo.mail
					},
					"type": "required"
				}
			]
		}

		if (!this.tokenHandler.currentToken) this.tokenHandler.currentToken = await this.tokenHandler.acquireToken();
		const options = {
			method: 'POST',
			headers: {
				Authorization: ' Bearer ' + this.tokenHandler.currentToken,
				ContentType: "application/json"
			},
			body: body,
			json: true
		}

		return new Promise((resolve, reject) => {
			request("https://graph.microsoft.com/v1.0/users/" + users[0].RowKey + "/events", options, (error, response, content) => {
				resolve(content);
			})
		})
	}


	preferredTimeToInt(time: string) {
		let h = parseInt(time.split(":")[0]) * 60;
		let m = parseInt(time.split(":")[1]);
		return h + m;
	}
}