export class LunchMatching {
	constructor() {}

	static match(userPreferences:any, poolPreferences:Array<any>) {
		let userMatches:Array<any> = [];
		poolPreferences.forEach(user => {
			if(user.RowKey == userPreferences.RowKey) return;
			let matchProfile = {
				matchScore: 0,
				department: "",
				topics: [] as Array<string>,
				user: "",
				tenant: ""
			};

			matchProfile.user = user.RowKey;
			matchProfile.tenant = user.PartitionKey;
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