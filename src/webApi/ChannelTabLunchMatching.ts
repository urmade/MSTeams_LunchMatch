import { Request, Response } from "express";
import { StorageQuery } from "../util/StorageQueries";
import { GraphQuery } from "../util/graphQueries";
import { Match } from "../models/LunchMatch/Match";
import { StorageUser } from "../models/LunchMatch/user";

/**
 * Looks up all members of a Teams group, creates a lunch interest match score in reference to the user who called the function, and returns the top 5 matches.
 */
export default async function handle(req: Request, res: Response) {

	//Get the Lunch preferences of the user who called the function
	const user = new Promise((resolve, reject) => {
		new StorageQuery().queryUsers({ "RowKey": req.query.user }).then((users) => {
			resolve(users[0]);
		})
	})

	//Get all AAD IDs of users that are in the group, and then get their preferences
	const groupUsers = getGroupUsersLunchPreferences(req.query.group);

	Promise.all([user, groupUsers]).then((values) => {

		//Calculate a matching score for all group users in reference to the calling user
		let matches = Match.match(values[0] as StorageUser, values[1] as Array<StorageUser>);

		//Get the full AAD profile of all users
		let userQueries = [];
		for (let i = 0; i < matches.length; i++) {
			userQueries.push(new Promise((resolve, reject) => {
				new GraphQuery().getUser(matches[i].user).then(graphUser => {
					matches[i].userName = graphUser.displayName;
					resolve(matches[i]);
				})
			}))
		}
		Promise.all(userQueries).then(matchUsers => {
			res.send(matchUsers)
		}
		);
	})
}

function getGroupUsersLunchPreferences(groupId: string): Promise<Array<StorageUser>> {
	return new Promise((resolve, reject) => {

		//Get AAD IDs of all users in the group
		new GraphQuery().getGroupMemberIDs(groupId).then((userArray) => {

			//Create a query that gets the lunch preferences of all users in the group
			let userPreferenceQueries: Array<Promise<Array<StorageUser>>> = [];
			for (let i = 0; i < userArray.length; i++) {
				userPreferenceQueries.push(new StorageQuery().queryUsers({ "RowKey": userArray[i] }));
			}

			//Wait until all users lunch preferences are fetched, then return 
			Promise.all(userPreferenceQueries).then((preferencesArray) => {

				let preferences = [];
				for (let i = 0; i < preferencesArray.length; i++) {
					preferences.push(preferencesArray[i][0]);
				}
				resolve(preferences);
			})
		})
	})
}