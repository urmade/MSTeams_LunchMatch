import { Request, Response } from "express";
import { ActivityTypes, BotFrameworkAdapter, CardFactory } from "botbuilder";
import { RegistrationCard } from "./cards/registration";
import { SchedulerCard } from "./cards/scheduler";
import * as storage from "azure-storage";
import { StorageHelper } from "../util/StorageHelper";
import { lunchScheduler } from "./lunchScheduler";
import * as dotenv from "dotenv";
import { LunchMatching } from "../util/lunchMatching";
import { GraphQuery } from "../util/graphQueries";
import { LunchMatchCard } from "./cards/lunchMatch";

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
					else if(turnContext.activity.text.includes("search")) {
						let userArr = await new StorageHelper().queryUsers({"RowKey": turnContext.activity.from.aadObjectId});
						let user:any = userArr[0];
						let users = await new StorageHelper().getAllUsers();
						let matches = LunchMatching.match(user,users);

						let userIds:Array<string> = [];
						for(let i = 0; i < 5 && i < matches.length; i++) {
							userIds.push(matches[i].user);
						}
						let graphUsers = await new GraphQuery().getUsers(userIds);

						let topMatches:Array<any> = [];
						for(let i = 0; i < 5 && i < matches.length; i++) {
							matches[i]["graphUser"] = graphUsers.filter(user => {return user.id == matches[i].user})[0];

							topMatches.push(CardFactory.adaptiveCard(new LunchMatchCard(matches[i].graphUser.displayName, matches[i].graphUser.jobTitle, matches[i].department, matches[i].topics, user.RowKey, matches[i].user)));
						}
						
						await turnContext.sendActivity({
							attachments: topMatches,
							attachmentLayout: "carousel"
						});
						return;
					}

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
						return;
					}
					if (turnContext.activity.value.action.startsWith("scheduleLunch")) {

						let users = turnContext.activity.value.action as string;
						let u1 = users.substring(users.indexOf("u1"), users.indexOf("&u2")).split("=")[1];
						let u2 = users.substring(users.indexOf("u2")).split("=")[1];

						let matchUserOne = await new StorageHelper().queryUsers({"RowKey": u1});
						let matchUserTwo = await new StorageHelper().queryUsers({"RowKey": u2});

						let userOne = matchUserOne[0];
						let userTwo = matchUserTwo[0];

						let dateObj = await new GraphQuery().findLunchTime([userOne,userTwo]);
						let date = new Date(dateObj.start.dateTime);


						await turnContext.sendActivity({
							text: `Awesome, check your calendars! You two will meet at ${date.getDate()}.${date.getMonth()} at ${date.getHours()+2}:${date.getMinutes()}`
						});
						//TODO Actual lunch scheduling
					}
					else if (turnContext.activity.value.action == "subscribe") {
						const user = turnContext.activity.from.aadObjectId;
						if(user) {
						var entGen = storage.TableUtilities.entityGenerator;
						var entity = {
							PartitionKey: entGen.String(process.env.TENANTID),
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
								text: "Great, welcome onboard! You can now either set up your [preferences](https://teams.microsoft.com/l/entity/4b5e020f-3400-4dca-ab4f-4fcac69f7cbd/settings?label=Preferences) or start directly by scheduling your first lunch date.",
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