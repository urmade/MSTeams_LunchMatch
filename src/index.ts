import * as express from "express";
import { join } from "path";
import bodyParser = require("body-parser");
import { BotLogic as Bot } from "./bot/bot";
import * as storage from "azure-storage";
import { StorageHelper } from "./util/StorageHelper";
import * as dotenv from "dotenv";
import { GraphQuery } from "./util/graphQueries";
import { LunchMatching } from "./util/lunchMatching";

const app = express();
dotenv.config();

//Necessary to fetch AAD token at startup
const graphQuery = new GraphQuery();

app.use(express.static(join(__dirname, "..", "pages")));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get("/", (req, res) => {
	res.redirect("/settings.html");
})

app.post("/api/bot/messages", (req, res) => {
	Bot.handle(req, res);
})

app.get("/api/settings", async (req, res) => {
	const userProfiles = await new StorageHelper().queryUsers({ "RowKey": req.query.userId });
	res.send(userProfiles[0]);
})
app.post("/api/settings", async (req, res) => {
	const settings = req.body.settings;

	var entGen = storage.TableUtilities.entityGenerator;
	var entity = {
		PartitionKey: entGen.String(process.env.TENANTID),
		RowKey: entGen.String(req.body.user),
		preferredLunchTime: entGen.String(settings.lunchStart),
		preferredLunchDuration: entGen.Int32(settings.lunchDuration),
		additionalCoffee: entGen.Boolean(settings.additionalCoffee),
		department: entGen.String(settings.department),
		ocp: entGen.Boolean(settings.ocp),
		stu: entGen.Boolean(settings.stu),
		atu: entGen.Boolean(settings.atu),
		csu: entGen.Boolean(settings.csu),
		other: entGen.Boolean(settings.other),
		career: entGen.Boolean(settings.career),
		dailyWork: entGen.Boolean(settings.dailyWork),
		projects: entGen.Boolean(settings.projects),
		nonWork: entGen.Boolean(settings.nonWork)
	};
	if (await new StorageHelper().insertOrReplaceUser(entity)) res.send();
	else res.status(500).send();
});
//TODO: Pre-fill settings with current values when loading

app.get("/api/potentialDates", (req, res) => {
	const user = new Promise((resolve,reject) => {
		new StorageHelper().queryUsers({"RowKey": req.query.user}).then((users) => {
			resolve(users[0]);
		})
	})


	const groupUsers = new Promise((resolve,reject) => {
		graphQuery.getGroupMembers(req.query.group).then((userArray) => {
			let userPreferences:Array<Promise<any>> = [];
			for(let i = 0; i < userArray.length; i++) {
				userPreferences.push(new StorageHelper().queryUsers({"RowKey": userArray[i]}));
			}
			Promise.all(userPreferences).then((preferencesArray) => {
				let preferences = [];
				for(let i = 0; i < preferencesArray.length; i++) {
					preferences.push(preferencesArray[i][0]);
				}
				resolve(preferences);
			})
		})
	})

	Promise.all([user,groupUsers]).then((values) => {
		let matches = LunchMatching.match(values[0] as any,values[1] as any);

		let userQueries = [];

		for(let i = 0; i < matches.length; i++) {
			userQueries.push(new Promise((resolve,reject) => {
				new GraphQuery().getUser(matches[i].user).then(graphUser => {
					matches[i].userName = graphUser.displayName;
					resolve(matches[i]);
				})
			}))
		}
		Promise.all(userQueries).then(matchUsers => {
				res.send(matchUsers)
			}
			);
	})
	//TODO: Return all members that signed up sorted by matching score (eg how many common settings)
})

app.get("/api/schedule", async (req,res) => {
	let user = await new StorageHelper().queryUsers({"RowKey": req.query.user});
	let lunchPartner = await new StorageHelper().queryUsers({"RowKey": req.query.lunchUser});

	let lunchTime = await new GraphQuery().findLunchTime([user[0],lunchPartner[0]]);
	let lunchDate = new Date(lunchTime.start.dateTime);

	res.send(lunchDate);
})

app.listen(process.env.PORT || 8080, () => {
	console.info("Server is running!");
})