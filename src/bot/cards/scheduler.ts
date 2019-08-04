export class SchedulerCard {
	constructor() {
		return {
			"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
			"type": "AdaptiveCard",
			"version": "1.0",
			"body": [
				{
					"type": "TextBlock",
					"text": "When would you like to make a blind-date lunch?"
				},
				{
					"type": "Input.Date",
					"id": "date",
					"placeholder": "On which date would you like to schedule?"
				},
				{
					"type": "Input.Time",
					"id": "time",
					"placeholder": "For which time do you want to meet?",
					"min": "11:00",
					"max": "13:30",
					"value": "11:45"
				}
			],
			"actions": [
				{
					"type": "Action.Submit",
					"title": "OK",
					"data": {
						"action": "schedule"
					}
				}
			]
		}
	}
}