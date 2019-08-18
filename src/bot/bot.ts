import { Request, Response } from "express";
import { ActivityTypes, BotFrameworkAdapter } from "botbuilder";
import * as dotenv from "dotenv";
import * as MessageExtension from "./handler/MessageExtension";
import * as Conversation from "./handler/Conversation";
import * as CardAction from "./handler/CardAction";
import * as Event from "./handler/Event";

dotenv.config();

export class BotLogic {

	static adapter = new BotFrameworkAdapter({
		appId: process.env.BOTAPPID,
		appPassword: process.env.BOTAPPSECRET
	});;

	constructor() { };

	static handle(req: Request, res: Response) {
		this.adapter.processActivity(req, res, async (turnContext) => {
			if (turnContext.activity.type === ActivityTypes.Message) {

				//Handler for user text input (a standard chat message)
				if (turnContext.activity.text) {
					await Conversation.default(turnContext);
					return;
				}

				//Handler for actions triggered by buttons inside of adaptive Cards
				else if (turnContext.activity.value) {
					await CardAction.default(turnContext);
					return;
				}
			}

			//Handler for Message extensions
			else if (turnContext.activity.type === ActivityTypes.Invoke) {
				await MessageExtension.default(turnContext.activity,res);
				return;
			}

			//Handler for newly added users in a chat with the Lunch Master
			else if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
				await Event.default(turnContext);
				return;
			}
		});
	}
}