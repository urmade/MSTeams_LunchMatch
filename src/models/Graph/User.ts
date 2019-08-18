/**
 * Minimized representation of an AAD user with the properties important for this app
 */
export class GraphUser {

	department:string;
	displayName:string;
	id:string;
	mail:string;
	jobTitle:string;

	constructor(id:string, department:string, displayName:string, mail:string, jobTitle:string) {
		this.id = id;
		this.department = department;
		this.displayName = displayName;
		this.mail = mail;
		this.jobTitle = jobTitle;
	}

	/**
	 * Create a new User object from a JSON returned by a Graph GET query
	 */
	static fromJSON(json:{[key:string]:any}):GraphUser {
		return new GraphUser(
			json["id"],
			json["department"],
			json["displayName"],
			json["mail"],
			json["jobTitle"]
		)
	}
}