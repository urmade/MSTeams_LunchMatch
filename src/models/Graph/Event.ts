export class GraphEvent {

	id:string;
	body: {contentType:string, content:string};
	start: {dateTime:string, timeZone:string};
	end: {dateTime:string, timeZone:string};
	attendees: Array<{type:string, emailAddress: {name:string, address:string}}>;

	constructor(id:string, body:{[key:string]:any}, start:{[key:string]:any}, end:{[key:string]:any}, attendees:[{[key:string]:any}]) {
		this.id = id;
		this.body = {contentType: "", content: ""};
		this.body.contentType = body.contentType;
		this.body.content = body.content;
		this.start = {dateTime: "", timeZone: ""};
		this.start.dateTime = start.dateTime;
		this.start.timeZone = start.timeZone;
		this.end = {dateTime: "", timeZone: ""};
		this.end.dateTime = end.dateTime;
		this.end.timeZone = end.timeZone;
		this.attendees = [];

		attendees.forEach(attendee => {
			this.attendees.push({
				type: attendee.type,
				emailAddress: {
					name: attendee.emailAddress.name,
					address: attendee.emailAddress.address
				}
			})
		})
	}

	static fromJSON(json:{[key:string]:any}):GraphEvent {
		return new GraphEvent(
			json.id,
			json.body,
			json.start,
			json.end,
			json.attendees
		)
	}
}