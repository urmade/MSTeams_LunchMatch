import { StorageHelper } from "../util/StorageHelper";

export class lunchScheduler {

	constructor() {}

	static async findLunchPartners(userId:string) {
		let potentialPartners = await new StorageHelper().queryUsers({"ocp":true, "stu": true});
		console.log(potentialPartners);
	}
}