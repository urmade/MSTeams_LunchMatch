import { StorageUser } from "./user";

export class Match {

	/** AAD ID of a person that is compared (matched) to another person sitting outside of this object */
	user:string;
	/** Placeholder for user name (displayName) stored in AAD */
	userName:string;
	/** Numeric score how many interests this user has in common with the reference person */
	matchScore:number;
	/** Department in which this user works */
	department:string;
	/** Shared interests of this person with the reference person */
	topics:Array<string>;
	/** Tenant ID of this user */
	tenant:string;
	/** Placeholder for the MS Graph object of this user */
	graphUser:{[val:string]:any};

	constructor() {
		this.matchScore = 0;
		this.department = "";
		this.topics = [];
		this.user = "";
		this.tenant = "";
		this.graphUser = {};
		this.userName = "";
	}

	static match(userPreferences:StorageUser, poolPreferences:Array<StorageUser>):Array<Match> {
		let userMatches:Array<Match> = [];
		poolPreferences.forEach(user => {
			if(user.rowKey == userPreferences.rowKey) return;
			let matchProfile = new Match();

			matchProfile.user = user.rowKey;
			matchProfile.tenant = user.partitionKey;
			matchProfile.department = user.department;

			if(userPreferences.atu && user.department == "ATU") {matchProfile.matchScore += 1; matchProfile.topics.push("ATU")}
			if(userPreferences.stu && user.department == "STU") {matchProfile.matchScore += 1; matchProfile.topics.push("STU")}
			if(userPreferences.csu && user.department == "CSU") {matchProfile.matchScore += 1; matchProfile.topics.push("CSU")}
			if(userPreferences.ocp && user.department == "OCP") {matchProfile.matchScore += 1; matchProfile.topics.push("OCP")}

			if(userPreferences.career && user.career) {matchProfile.matchScore += 1; matchProfile.topics.push("career")}
			if(userPreferences.nonWork && user.nonWork) {matchProfile.matchScore += 1; matchProfile.topics.push("non-work topics")}
			if(userPreferences.projects && user.projects) {matchProfile.matchScore += 1; matchProfile.topics.push("projects")}
			if(userPreferences.dailyWork && user.dailyWork) {matchProfile.matchScore += 1; matchProfile.topics.push("daily work")}

			userMatches.push(matchProfile);
		})
		userMatches.sort((a,b) => {
			return b.matchScore - a.matchScore
		})

		return userMatches;
	}
}