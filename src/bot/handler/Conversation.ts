import { TurnContext, CardFactory, Attachment } from "botbuilder";
import { RegistrationCard } from "../cards/registration";
import { StorageQuery } from "../../util/StorageQueries";
import { GraphQuery } from "../../util/graphQueries";
import { LunchMatchCard } from "../cards/lunchMatch";
import { Match } from "../../models/LunchMatch/Match";

/**
 * Searches the Lunch Match database for the best matches for the users in terms of interests and returns the best 5 matches as adaptive cards.
 */
async function search(turnContext: TurnContext) {
	//Get all users in the Lunch Match database
	let users = await new StorageQuery().getAllUsers();

	//TODO: Find the AAD ID of the user who messaged the bot
	let conversationPartner = "";

	//Find the invoking user by searching all users for the user which RowKey (AAD ID) matches the AAD ID of the invoking user
	let user = users.find((u) => {
		return u.rowKey == conversationPartner;
	})

	//Match the users 
	let matches = Match.match(user, users);

	//Get the user IDs of the 5 best matches and query their Graph user objects
	let userIds: Array<string> = [];
	for (let i = 0; i < 5 && i < matches.length; i++) {
		userIds.push(matches[i].user);
	}
	let graphUsers = await new GraphQuery().getUsers(userIds);

	//Join the Lunch Match user array with the Graph user array and create an adaptive card for each of the 5 top matches
	let topMatchCards: Array<Attachment> = [];
	for (let i = 0; i < 5 && i < matches.length; i++) {
		//Set the Graph user object as the attribute "graphUser" in the Lunch Match object
		matches[i]["graphUser"] = graphUsers.filter(user => { return user.id == matches[i].user })[0];

		topMatchCards.push(CardFactory.adaptiveCard(new LunchMatchCard(matches[i].graphUser.displayName, matches[i].graphUser.jobTitle, matches[i].department, matches[i].topics, user.rowKey, matches[i].user)));
	}

	//Send all top matches as a carousel to the user (in contrast to list, which would mean a seperate message per user)
	await turnContext.sendActivity({
		attachments: topMatchCards,
		attachmentLayout: "carousel"
	});
}

export default async function handle(turnContext: TurnContext) {

	//Search all users in the Lunch Match database and return the best 5 matches to the user
	if (turnContext.activity.text.includes("search")) {
		await search(turnContext);
		return;
	}

	//Helping functionality to force the subscribe dialog for a user
	else if (turnContext.activity.text.includes("subscribe")) {
		await subscribe(turnContext);
		return;
	}

	//Default return: Bot asks for a search command
	await turnContext.sendActivity({
		text: `Hey, I unfortunately only understand to search Lunch partners for you. Please write something with "search" in it so I can react!`
	});
}

/**
 * Helper functionality to force the subscribe dialog that should show when a new user activates the bot.
 * Gives the user the possibility to subscribe to Lunch Match (create a new user Object in the Lunch Match database).
 */
async function subscribe(turnContext: TurnContext) {
	const card = CardFactory.adaptiveCard(new RegistrationCard(turnContext.activity.from.name));
	// send a reply
	await turnContext.sendActivity({
		attachments: [card]
	});
}