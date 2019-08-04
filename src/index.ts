import * as express from "express";
import { join } from "path";
import bodyParser = require("body-parser");
import { BotLogic as Bot } from "./bot/bot";
import * as storage from "azure-storage";
import { StorageHelper } from "./util/StorageHelper";
import * as dotenv from "dotenv";

const app = express();
dotenv.config();

app.use(express.static(join(__dirname, "..", "pages")));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get("/", (req, res) => {
	res.redirect("/settings.html");
})

app.post("/api/bot/messages", (req, res) => {
	Bot.handle(req, res);
})

app.get("/api/settings", async (req,res) => {
	const userProfiles = await new StorageHelper().queryUsers({"RowKey": req.query.userId});
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
	if(await new StorageHelper().insertOrReplaceUser(entity)) res.send();
	else res.status(500).send();
});
//TODO: Pre-fill settings with current values when loading

app.get("/api/potentialDates", (req, res) => {
	//TODO: Get query with group Id and user Id
	//TODO: Ask Graph about all members in this group
	//TODO: Look up all members if they have registered for lunch date
	//TODO: Return all members that signed up sorted by matching score (eg how many common settings)

	res.send("This is a placeholder");
})

app.listen(process.env.PORT || 8080, () => {
	console.info("Server is running!");
})