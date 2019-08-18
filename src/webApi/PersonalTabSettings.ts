import { Request, Response } from "express";
import { StorageQuery } from "../util/StorageQueries";
import * as storage from "azure-storage";

export async function get(req: Request, res: Response) {
	const userProfiles = await new StorageQuery().queryUsers({ "RowKey": req.query.userId });
	res.send(userProfiles[0]);
}

export async function set(req: Request, res: Response) {
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
	if (await new StorageQuery().insertOrReplaceUser(entity)) res.send();
	else res.status(500).send();
}