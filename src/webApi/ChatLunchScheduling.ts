import { Request, Response } from "express";
import { StorageQuery } from "../util/StorageQueries";
import { GraphQuery } from "../util/graphQueries";

export default async function handle(req:Request,res:Response) {
	let user = await new StorageQuery().queryUsers({"RowKey": req.query.user});
	let lunchPartner = await new StorageQuery().queryUsers({"RowKey": req.query.lunchUser});

	let lunchTime = await new GraphQuery().findLunchTime([user[0],lunchPartner[0]]);
	let lunchDate = new Date(lunchTime.start.dateTime);

	res.send(lunchDate);
}