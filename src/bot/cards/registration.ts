export class RegistrationCard {
	constructor(username: string) {
		return {
			"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
			"type": "AdaptiveCard",
			"version": "1.0",
			"body": [
				{
					"type": "TextBlock",
					"text": "Hi, nice to meet you!",
					"horizontalAlignment": "Center",
					"size": "Large",
					"wrap": true
				},
				{
					"type": "TextBlock",
					"text": "Do you want to subscribe to Lunch Tinder and get the most out of your lunches?",
					"horizontalAlignment": "Center",
					"wrap": true
				}
			],
			"actions": [
				{
					"type": "Action.Submit",
					"title": "Subscribe to Lunch Tinder",
					"data": {
						"action": "subscribe"
					}
				},
				{
					"type": "Action.Submit",
					"title": "More details",
					"data": {
						"action": "details"
					}
				}
			]
		}
	}
}