import { Request, Response } from "express";
import { ActivityTypes, BotFrameworkAdapter, CardFactory } from "botbuilder";
import { RegistrationCard } from "./cards/registration";
import { SchedulerCard } from "./cards/scheduler";
import * as storage from "azure-storage";
import { StorageHelper } from "../util/StorageHelper";
import { lunchScheduler } from "./lunchScheduler";
import * as dotenv from "dotenv";

dotenv.config();

export class BotLogic {

	static adapter = new BotFrameworkAdapter({
		appId: process.env.BOTAPPID,
		appPassword: process.env.BOTAPPSECRET
	});;

	constructor() { };

	static handle(req: Request, res: Response) {
		console.info("We got a Hit!");
		this.adapter.processActivity(req, res, async (turnContext) => {
			if (turnContext.activity.type === ActivityTypes.Message) {
				//turnContext.sendActivity({ type: ActivityTypes.Typing });

				if (turnContext.activity.text) {


					//Helper clause for developing
					if(turnContext.activity.text.includes("subscribe")) {
						const card = CardFactory.adaptiveCard(new RegistrationCard(turnContext.activity.from.name));
						// send a reply
						console.log(card);
						await turnContext.sendActivity({
							attachments: [card]
						});
						return;
					}
					//End of Helper clause


					//TODO: Send smart time proposals
					const card = CardFactory.adaptiveCard(new SchedulerCard());
					// send a reply
					await turnContext.sendActivity({
						text: `Alright, I think I got this`,
						attachments: [card]
					});
				}
				else if (turnContext.activity.value) {
					if (turnContext.activity.value.action == "schedule") {
						const date = new Date(turnContext.activity.value.date);
						const time = turnContext.activity.value.time;
						await lunchScheduler.findLunchPartners(turnContext.activity.from.aadObjectId);
						await turnContext.sendActivity("Aight mate, you got yourself a Date at " + date.toDateString() + " starting at " + time + ".");
						//TODO: Write to calendar
						return;
					}
					else if (turnContext.activity.value.action == "subscribe") {
						const user = turnContext.activity.from.aadObjectId;
						if(user) {
						var entGen = storage.TableUtilities.entityGenerator;
						var entity = {
							PartitionKey: entGen.String('TestTenant'),
							RowKey: entGen.String(user),
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
						let successfulOperation = await new StorageHelper().insertOrReplaceUser(entity);
						if(successfulOperation) {
							//TODO Implement Deep Link
							await turnContext.sendActivity({
								text: "Great, welcome onboard! You can now either set up your [preferences](https://teams.microsoft.com/l/entity/ab5fc739-8e9a-47ee-9927-95bce8447333/settings?label=Preferences) or start directly by scheduling your first lunch date.",
								attachments: [CardFactory.adaptiveCard(new SchedulerCard())]							
							});
						} 
						else await turnContext.sendActivity("Something went wrong. In a 99.9% chance it wasn't your fault, but for excuses purposes we'd like to keep the chance.");
						}
						else {
							await turnContext.sendActivity("Sorry, but you need to be within a Microsoft connected chat (e.g. Teams, Skype, ...) in order to use this service. :/");
						}

						
					}
				}
			}


			//A new user was added to a group conversation or the bot gets opened by an user in a 1:1 chat
			else if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
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
		});
	}

	parseTime(timeString: string) {
		const timeSplit = timeString.split(":");
		return {
			hour: parseInt(timeSplit[0]),
			minute: parseInt(timeSplit[1])
		}
	}

	parseDate(dateString: string) {
		const dateSplit = dateString.split("-");
		return {
			year: parseInt(dateSplit[0]),
			month: parseInt(dateSplit[1]),
			day: parseInt(dateSplit[2])
		}
	}

}