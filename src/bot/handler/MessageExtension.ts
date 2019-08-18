import { Activity, CardFactory } from "botbuilder";
import { GraphQuery } from "../../util/graphQueries";
import { StorageQuery } from "../../util/StorageQueries";
import { LunchAskCard } from "../cards/lunchAsk";
import { Response } from "express";
import { StorageUser } from "../../models/LunchMatch/user";



async function initiateGroupLunch(activity: Activity, res: Response) {

	//Get the users Graph Object to fetch mail adress and name of user
	let user = await new GraphQuery().getUser(activity.from.aadObjectId);
	//Get the users Lunch Match Object to fetch lunch time preferences
	let storageUserArr: Array<StorageUser> = await new StorageQuery().queryUsers({ RowKey: activity.from.aadObjectId });

	//Get the preferred lunch time of user
	let preferredTime = storageUserArr[0]["preferredLunchTime"];
	//Calculate lunch start and end from users preferences
	let lunchStart = new Date(activity.value.data.Date);
	let h = parseInt(storageUserArr[0]["preferredLunchTime"].split(":")[0]);
	let m = parseInt(storageUserArr[0]["preferredLunchTime"].split(":")[1]);
	lunchStart.setHours(h);
	lunchStart.setMinutes(m);
	let lunchEnd = new Date(activity.value.data.Date);
	lunchEnd.setHours(h);
	lunchEnd.setMinutes(m + storageUserArr[0]["preferredLunchDuration"]);


	//Prepare body of the Graph event object (calendar entry)
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
					"address": user.mail
				},
				"type": "required"
			}
		]
	}

	//Write the new event to Graph
	let lunchEvent: any = await new GraphQuery().createEvent(body, activity.from.aadObjectId);

	//Build a new Card to post into the Teams channel
	const card = CardFactory.adaptiveCard(new LunchAskCard(activity.value.data.Date + " " + preferredTime, user.displayName, activity.from.aadObjectId, lunchEvent.id));

	//Send card to Teams channel (manually, as the documentation on this is really spare and the developer couldn't figure out how to do it with the SDK)
	res.send({
		"composeExtension": {
			"type": "result",
			"attachmentLayout": "list",
			"attachments": [
				card
			]
		}
	});
	return;
}

async function joinGroupLunch(activity: Activity) {
	//Get Graph user from ID of the person who invoked this function, meaning the person who clicked the "join" button
	const user = await new GraphQuery().getUser(activity.from.aadObjectId);

	//Get the original event initiators AAD ID as well as the Exchange event ID
	const initiator = activity.value.action.substring(activity.value.action.indexOf("&u=") + 3);
	const event = activity.value.action.substring(activity.value.action.indexOf("&e=") + 3, activity.value.action.indexOf("&u="));

	//Get current event entry to read out all attendees
	let originalEvent = await new GraphQuery().getEvent(initiator, event);

	//Put all attendees email adresses (plus mail of new user) in an Array
	let eventAttendees = [];
	originalEvent.attendees.map((att: any) => {
		eventAttendees.push(att.emailAddress.address);
	})
	eventAttendees.push(user.mail);

	//Update event with existing attendees as well as new attendee
	await new GraphQuery().updateEventAttendees(initiator, event, eventAttendees);
}

export default async function handle(activity: Activity, res: Response) {
	if (activity.value.commandId == "GroupLunch") {
		await initiateGroupLunch(activity, res);
		return;
	}
	else if (activity.value.action.startsWith("joinGroupLunch")) {
		await joinGroupLunch(activity);
		return;
	}
}