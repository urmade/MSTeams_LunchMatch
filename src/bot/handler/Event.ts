import { TurnContext, CardFactory } from "botbuilder";
import { RegistrationCard } from "../cards/registration";

/**
 * Function to handle all Events that get emitted by Teams systematically (in this case ConversationUpdate).
 */
export default async function handle(turnContext:TurnContext) {
	for (let i = 0, members = turnContext.activity.membersAdded; i < members.length; i++) {
		if (members[i].id != turnContext.activity.recipient.id) {
			const card = CardFactory.adaptiveCard(new RegistrationCard(members[i].name));
			// send a reply
			await turnContext.sendActivity({
				attachments: [card]
			});
		}
	}
}