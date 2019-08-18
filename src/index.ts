import * as express from "express";
import { join } from "path";
import bodyParser = require("body-parser");
import * as dotenv from "dotenv";

import { BotLogic as Bot } from "./bot/bot";
import * as LunchScheduling from "./webApi/ChatLunchScheduling";
import * as LunchMatching from "./webApi/ChannelTabLunchMatching";
import * as PreferenceSettings from "./webApi/PersonalTabSettings";

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


app.get("/api/settings", async (req, res) => {
	PreferenceSettings.get(req,res);
})
app.post("/api/settings", async (req, res) => {
	PreferenceSettings.set(req,res);
});

app.get("/api/potentialDates", (req, res) => {
	LunchMatching.default(req,res);
})

app.get("/api/schedule", async (req,res) => {
	LunchScheduling.default(req,res);
})

app.listen(process.env.PORT || 8080, () => {
	console.info("Server is running!");
})