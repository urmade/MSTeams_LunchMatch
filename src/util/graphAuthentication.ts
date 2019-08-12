import * as request from "request";

export class Authenticator {
	appId:string = process.env.GRAPHAPPID;
	appSecret:string = process.env.GRAPHAPPSECRET;
	currentToken:string;

	constructor() {

		this.acquireToken().then(token => {
			this.currentToken = token;
		});
		setInterval(() => {
			this.acquireToken().then(token => {
				this.currentToken = token;
			});
		}, 1000*60*55);
	}


	acquireToken():Promise<string> {
		return new Promise((resolve,reject) => {
			request.post("https://login.microsoftonline.com/"+process.env.TENANTID+"/oauth2/v2.0/token", {form: {
				"client_id": this.appId,
				"client_secret": this.appSecret,
				"scope": "https://graph.microsoft.com/.default",
				"grant_type": "client_credentials"
			}}, (error,response,body) => {
				if(!error) resolve(JSON.parse(body).access_token);
				else reject(error);
			})
		})
	}
}