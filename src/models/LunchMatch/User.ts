export class StorageUser {
	/** Tenant ID of user */
	partitionKey: string;
	/** AAD ID of user */
	rowKey: string;
	/** Department in which the user is working */
	department: string;
	/** Time of day where the user likes to go to lunch */
	preferredLunchTime: string;
	/** Time in minutes that the user wants to spend on lunch */
	preferredLunchDuration: number;

	/** Indicates if the user likes to go on a coffee after lunch */
	additionalCoffee: boolean;

	/** Indicates if the user is interested in learning more about ATU department */
	atu: boolean;
	/** Indicates if the user is interested in learning more about CSU department */
	csu: boolean;
	/** Indicates if the user is interested in learning more about OCP department */
	ocp: boolean;
	/** Indicates if the user is interested in learning more about STU department */
	stu: boolean;
	/** Indicates if the user is interested in learning more about other departments */
	other: boolean;

	/** Indicates if the user is interested in talking about career at Microsoft */
	career: boolean;
	/** Indicates if the user is interested in talking about daily work at Microsoft */
	dailyWork: boolean;
	/** Indicates if the user is interested in talking about non-work related topics */
	nonWork: boolean;
	/** Indicates if the user is interested in talking about his current projects at Microsoft */
	projects: boolean;


	constructor(partitionKey: string, rowKey: string, department: string, preferredLunchTime: string, preferredLunchDuration: number, additionalCoffee: boolean, atu: boolean, csu: boolean, ocp: boolean, stu: boolean, other: boolean, career: boolean, dailyWork: boolean, nonWork: boolean, projects: boolean) {
		this.partitionKey = partitionKey;
		this.rowKey = rowKey;
		this.department = department;
		this.preferredLunchTime = preferredLunchTime;
		this.preferredLunchDuration = preferredLunchDuration;
		this.additionalCoffee = additionalCoffee;
		this.atu = atu;
		this.csu = csu;
		this.ocp = ocp;
		this.stu = stu;
		this.other = other;
		this.career = career;
		this.dailyWork = dailyWork;
		this.nonWork = nonWork;
		this.projects = projects;
	}

	/**
	 * Creates a new user from a JSON object as returned by Azure Storage
	 */
	static fromJSON(json: { [val: string]: any }): StorageUser {
		return new StorageUser(
			json.PartitionKey["_"],
			json.RowKey["_"],
			json.department["_"],
			json.preferredLunchTime["_"],
			json.preferredLunchDuration["_"],
			json.additionalCoffee["_"],
			json.atu["_"],
			json.csu["_"],
			json.ocp["_"],
			json.stu["_"],
			json.other["_"],
			json.career["_"],
			json.dailyWork["_"],
			json.nonWork["_"],
			json.projects["_"]
		);
	}
}