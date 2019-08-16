export class LunchMatchCard {
	constructor(username:string, role:string, department:string,topics:Array<string>, userOneId:string, userTwoId:string) {
		return {
			"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
			"type": "AdaptiveCard",
			"version": "1.0",
			"body": [
				{
					"type": "TextBlock",
					"text": username,
					"size": "Large",
					"weight": "Bolder"
				},
				{
					"type": "TextBlock",
					"text": role + " - " + department,
					"size": "Large"
				},
				{
					"type": "TextBlock",
					"text": "Both of you are interested in: " + topics.join(", ")
				}
			],
			"actions": [
				{
					"type": "Action.Submit",
					"title": "Schedule lunch date",
					"data": {
						"action": "scheduleLunch&u1="+userOneId+"&u2="+userTwoId
					}
				}
			]
		}
	}
}