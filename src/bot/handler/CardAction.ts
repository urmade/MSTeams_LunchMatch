import { TurnContext } from "botbuilder";
import { StorageQuery } from "../../util/StorageQueries";
import { GraphQuery } from "../../util/graphQueries";
import * as storage from "azure-storage";


async function scheduleLunch(turnContext: TurnContext) {
	let users = turnContext.activity.value.action as string;
	let u1 = users.substring(users.indexOf("u1"), users.indexOf("&u2")).split("=")[1];
	let u2 = users.substring(users.indexOf("u2")).split("=")[1];

	let matchUserOne = await new StorageQuery().queryUsers({ "RowKey": u1 });
	let matchUserTwo = await new StorageQuery().queryUsers({ "RowKey": u2 });

	let userOne = matchUserOne[0];
	let userTwo = matchUserTwo[0];

	let dateObj = await new GraphQuery().findLunchTime([userOne, userTwo]);
	let date = new Date(dateObj.start.dateTime);


	//TODO Implement an adaptive card that displays the user in a fancy way that his meeting was set
	await turnContext.sendActivity({
		text: `Awesome, check your calendars! You two will meet at ${date.getDate()}.${date.getMonth()} at ${date.getHours() + 2}:${date.getMinutes()}`
	});
	return;
}

/**
 * Dialog to show to users who installed Lunch Match to get them to subscribe to Lunch Match
 */
async function subscribe(turnContext: TurnContext) {
	//Get ID of user that just added the Bot
	const userId = turnContext.activity.from.aadObjectId;

	//Check if userId is defined, otherwise assume that function was called outside of Teams
	if (userId) {

		//Create new user object for Lunch Match database
		var entGen = storage.TableUtilities.entityGenerator;
		var entity = {
			PartitionKey: entGen.String(process.env.TENANTID),
			RowKey: entGen.String(userId),
			preferredLunchTime: entGen.String("12:00"),
			preferredLunchDuration: entGen.Int32(45),
			additionalCoffee: entGen.Boolean(false),
			department: entGen.String("OCP"),
			ocp: entGen.Boolean(true),
			stu: entGen.Boolean(true),
			atu: entGen.Boolean(true),
			csu: entGen.Boolean(true),
			other: entGen.Boolean(true),
			career: entGen.Boolean(true),
			dailyWork: entGen.Boolean(true),
			projects: entGen.Boolean(true),
			nonWork: entGen.Boolean(true)
		};

		//Insert new user
		let successfulOperation = await new StorageQuery().insertOrReplaceUser(entity);
		if (successfulOperation) {

			//Send greeting message to user
			//TODO Create a deep link to open the preferences tab directly. Syntax for Teams links: [link display text](URL)
			await turnContext.sendActivity({
				text: "Great, welcome onboard! You can now either set up your preferences or start directly by searching for potential lunch partners. Just type 'search' to do so"
			});
		}
		//Send a message in case the database insert threw an error
		else await turnContext.sendActivity("Something went wrong. In a 99.9% chance it wasn't your fault, but for excuses purposes we'd like to keep the chance.");
	}
	//Send a message in case the endpoint was hit outside of Teams
	else {
		await turnContext.sendActivity("Sorry, but you need to be within a Microsoft connected chat (e.g. Teams, Skype, ...) in order to use this service. :/");
	}
}

export default async function handle(turnContext: TurnContext) {

	//Schedule a lunch meeting with a specified person
	if (turnContext.activity.value.action.startsWith("scheduleLunch")) {

		await scheduleLunch(turnContext);
		return;
	}

	//If a new user opens the Lunch Master for the first time, offer him to subscribe to Lunch Match
	else if (turnContext.activity.value.action == "subscribe") {
		await subscribe(turnContext);
		return;
	}
}