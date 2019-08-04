import { Authenticator } from "./graphAuthentication";
import * as request from "request";

export class GraphQuery {
	tokenHandler = new Authenticator();
	constructor() { };

	getUserInformation(userId: string): Promise<{}> {
		return new Promise((resolve, reject) => {
			request("https://graph.microsoft.com/users/" + userId, (error, response, body) => {
				if (!error) resolve(body);
				else reject(error);
			})
		})
	}
}