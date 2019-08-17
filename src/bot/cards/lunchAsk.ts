export class LunchAskCard {
	constructor(date: string, username: string, userId:string, eventId:string) {
		return {
			"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
			"type": "AdaptiveCard",
			"version": "1.0",
			"body": [
				{
					"type": "TextBlock",
					"text": username + " would like to schedule a channel lunch!",
					"size": "Large",
					"weight": "Bolder",
					"wrap": true
				},
				{
					"type": "TextBlock",
					"text": "Date: " + date,
					"size": "Large"
				}
			],
			"actions": [
				{
					"type": "Action.Submit",
					"title": "Join lunch",
					"data": {
						"action": "joinGroupLunch&e="+eventId + "&u=" + userId
					}
				}
			]
		}
	}
}