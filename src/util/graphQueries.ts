import { Authenticator } from "./graphAuthentication";
import * as request from "request";
import { GraphUser } from "../models/Graph/User";
import { GraphEvent } from "../models/Graph/Event";
import { StorageUser } from "../models/LunchMatch/user";

export class GraphQuery {
	tokenHandler = new Authenticator();
	constructor() {
	};

	//TODO Implement this query
	getUser(userId: string): Promise<GraphUser> {
		return new Promise(async (resolve, reject) => {
			if (!this.tokenHandler.currentToken) this.tokenHandler.currentToken = await this.tokenHandler.acquireToken();
			const options = {
				method: 'HTTP Method',
				headers: {
					Authorization: ' Bearer ' + this.tokenHandler.currentToken
				}
			}
			request("Insert the right Graph query here", options, (error, response, body) => {
				if (!error) {
					resolve(GraphUser.fromJSON(JSON.parse(body)));
				}
				else reject(error);
			})
		})
	}

	getUsers(userIds: Array<string>): Promise<Array<GraphUser>> {
		return new Promise(async (resolve, reject) => {
			let namePromises: Array<Promise<any>> = [];
			for (let i = 0; i < userIds.length; i++) {
				namePromises.push(this.getUser(userIds[i]));
			}
			resolve(await Promise.all(namePromises));
		})
	}

	getEvent(userId: string, eventId: string): Promise<GraphEvent> {
		return new Promise(async (resolve, reject) => {
			if (!this.tokenHandler.currentToken) this.tokenHandler.currentToken = await this.tokenHandler.acquireToken();
			const options = {
				method: 'GET',
				headers: {
					Authorization: ' Bearer ' + this.tokenHandler.currentToken,
					ContentType: "application/json"
				}
			}

			request("https://graph.microsoft.com/v1.0/users/" + userId + "/events/" + eventId, options, (error, response, content) => {
				resolve(GraphEvent.fromJSON(JSON.parse(content)));
			})
		})
	}
	//Returns only start and end time of an event, therefore no Graph Event
	getEvents(userId: string): Promise<Array<{ start: { dateTime: string, timeZone: string }, end: { dateTime: string, timeZone: string } }>> {
		return new Promise(async (resolve, reject) => {
			if (!this.tokenHandler.currentToken) this.tokenHandler.currentToken = await this.tokenHandler.acquireToken();
			const options = {
				method: 'GET',
				headers: {
					Authorization: ' Bearer ' + this.tokenHandler.currentToken
				}
			}

			let today = new Date();
			let quarterYear = new Date();
			quarterYear.setMonth(today.getMonth() + 3);

			request("https://graph.microsoft.com/v1.0/users/" + userId + "/calendarview?startdatetime=" + today.toISOString() + "&enddatetime=" + quarterYear.toISOString() + "&$select=start,end&$top=100&$orderby=start/dateTime", options, (error, response, body) => {
				if (!error) {
					let jsonArr: Array<any> = JSON.parse(body).value;
					let eventArr: Array<{ start: { dateTime: string, timeZone: string }, end: { dateTime: string, timeZone: string } }> = [];
					jsonArr.map(event => {
						eventArr.push({
							start: {
								dateTime: event.start.dateTime,
								timeZone: event.start.timeZone
							},
							end: {
								dateTime: event.end.dateTime,
								timeZone: event.end.timeZone
							},
						});
					})
					resolve(eventArr);
				}
				else reject(error);
			})
		})
	}

	getGroupMemberIDs(groupId: string): Promise<Array<string>> {
		return new Promise(async (resolve, reject) => {
			if (!this.tokenHandler.currentToken) this.tokenHandler.currentToken = await this.tokenHandler.acquireToken();
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
	async findLunchTime(users: Array<StorageUser>): Promise<any> {

		let userOne = await this.getUser(users[0].rowKey);
		let userTwo = await this.getUser(users[1].rowKey);

		let userOneCalendar = await this.getEvents(users[0].rowKey);
		let userTwoCalendar = await this.getEvents(users[1].rowKey);

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

		let maxRange = new Date();
		maxRange.setMonth(maxRange.getMonth() + 3);


		if (!(userOneCalendar.length == 0 && userTwoCalendar.length == 0)) {
			while (!consent) {
				if (lunchStart > maxRange) {
					return new Promise((resolve, reject) => {
						resolve("No lunch time found in the next three month!");
					})
				}
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
		lunchEnd.setHours(lunchEnd.getHours() + 2);

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

		return this.createEvent(body, users[0].rowKey);


	}



	updateEventAttendees(userId: string, eventId: string, attendeeMails: Array<string>): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			if (!this.tokenHandler.currentToken) this.tokenHandler.currentToken = await this.tokenHandler.acquireToken();

			let attendees: Array<{}> = [];

			attendeeMails.forEach(mail => {
				attendees.push({
					"type": "required",
					"emailAddress": {
						"address": mail
					}
				})
			})
			const options = {
				method: 'PUT',
				headers: {
					Authorization: ' Bearer ' + this.tokenHandler.currentToken,
					ContentType: "application/json"
				},
				json: true,
				body: {
					"attendees": attendees
				}
			}

			request("https://graph.microsoft.com/v1.0/users/" + userId + "/events/" + eventId, options, (error, response, content) => {
				if (error) reject(false);
				else resolve(true);
			})
		})
	}

	createEvent(body: {}, userId: string): Promise<GraphEvent> {
		return new Promise(async (resolve, reject) => {
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

			request("https://graph.microsoft.com/v1.0/users/" + userId + "/events", options, (error, response, content) => {
				resolve(GraphEvent.fromJSON(content));
			})
		})
	}


	preferredTimeToInt(time: string) {
		let h = parseInt(time.split(":")[0]) * 60;
		let m = parseInt(time.split(":")[1]);
		return h + m;
	}
}