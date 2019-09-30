# Teams Workshop: Lunch Match
Welcome to the Teams Lab "Lunch Match". We will program a Teams application that allows users to go on lunch with new users in their organization that they do not currently know. 

## Before you start
This lab is meant to be led by an instructor. If you do this on your own, you will have to prepare the lab environment by yourself. To do so, click on this link (Instructions will follow soon). Furthermore you are required to have a few basic sofware components installed. These are:
- [Node.js](https://nodejs.org/en/download/)
- [ngrok](https://ngrok.com/download) (You need a free ngrok account for this lab, this can be created [here](https://dashboard.ngrok.com/signup))
- (Optional) [Visual Studio Code](https://code.visualstudio.com/download) (It's not a must, but the lab already has a debug configuration for VS Code that seamlessly works)
- This lab. Clone it to your local computer and run npm install. You're ready to go now!

## What you will do
This lab consists of multiple challenges tha will introduce you to development with Microsoft Teams. These are:
1. Register your first Teams Application.
2. Implement a Microsoft Graph query.
3. Inspect a message sent by Microsoft Teams.
4. Implement a deep link to route users within Microsoft Teams.
5. Build an Adaptive Card to engage your users
6. Use the JavaScript SDK to get aware of your context.

## Some comments on the developing tasks
We expect you to heavily use the debug functionality in this lab. You will need it to observe your data flow and learn more about what is happening inside of your browser. Do help you achieving this goal, this lab already contains a debug configuration for Visual Studio Code. Just run `npm install` when you first clone the app and then press `F5` to start the server in a debug session. 

Furthermore it is strongly recommended to use ngrok. ngrok is a tunneling software that opens a public internet tunnel to a specific port on your local system. Or, to put it simple: You can make your local server addressable publicly from the internet, without uploading it to some kind of hosting server. As Teams is an online SaaS application, it can only interact with other online resources. Therefore you cannot display a locahlhost page in Microsoft Teams, although your client might be installed on your machine.  

The last thing to mention: Your instructor will hand you out an Office 365 account to a test tenant where you can do whatever you want without messing with a production environment. Please use this test tenant, many of the lab features will not work on the tenant of your company account. It is also recommended to open teams.microsoft.com in an Incognito tab with the test account login, as the Teams Web version makes Tab debugging a lot easier.

## Challenge #1: Register your first Teams Application
This challenge will make you more familiar with the process of publishing a new Teams application. You should have received following information from your instructor:
- A Microsoft Bot ID
- An URL to a personal tab page.
- An URL to a channel tab configuration page.

To complete the lab, follow these steps:
1. In your Teams client, go to the App Store (located at the bottom of the left navigation bar).
2. Search for the "App Studio" app.
3. Install the "App Studio" app.
4. Open the "App Studio" app.
5. Choose the "Manifest editor" tab.
6. Click on "Create a new app".
7. Enter all information on the "App Details" page. Important: Make sure to fill out all required input fields. Also only use fully qualified URLs (e.g. https://www.something.com).
8. On the "Tabs" page, add a new team tab. Your tab should not allow to update the configuration, is available in teams and group chats and should not be integrated into SharePoint.
9. On the "Tabs" page, add a new personal tab. Make sure to note down the Entity ID as you will need that later. You can insert the same value in both Content URL and Website URL.
10. On the "Bots" page, register a new bot for your app. Import an existing bot and reference it by the ID that you received. Your bot does not need to handle files, it isn't a notification bot only and it doesn't support calling. It is available only in a personal context.
11. On the "Test and Distribute" page, click on "Download". This will download a zip file containing a manifest.json file. Open that file and familiarize yourself with the JSON attributes.
12. Click on "Install" and add your app to your Teams client. Test the chatbot, and the personal tab. Optionally, you can also add your app to a channel and test the channel tab. 
13. Awesome! You successfully launched your first, fully functional Teams application!

## Preperation for the coding challenges: Set up your development environment
Before you can actually start developing, you have to set up a few very basic configurations to make your app running. Just follow these steps:
1. Clone this repository to your local machine.
2. Run npm install in the root directory of this project.
3. In the same root directory (where the package.json, .gitignore and many other files are stored), create a file called .env .
4. Your instructor should have provided you with the values that you should put into the .env file. Insert these values and save the file.
5. Open ngrok on your machine. If you haven't done by now, log in with your account that you created. After that, type `ngrok http 8080` to open a public internet tunnel to your local port 8080.
6. You should now see two links in the format `<id>.ngrok.io` in the ngrok console. Note down the https link. Then open App Studio again and create a new application. Re-register the entire application from Challenge #1, but give it a different name and exchange the instructor URL with your ngrok https URL (so for example https://lunchmatch.azurewebsites.com/settings.html becomes https://<yourid>.ngrok.io/settings.html).
7. Save the new application and install it to your own Teams client. The functionalities will not work right now, but you will fix that in the upcoming challenges!

## Challenge #2: Implement a Microsoft Graph query
In your local project, navigate to the following file: src -> util -> graphQueries.ts . Here you will find a function called getUser(...). The HTTP Method (line 17) as well as the request URL (line 22) are missing. Your goal is it to receive a single user object from Microsoft Graph. You have an user ID to specify which user object you want to receive. Go to the [Microsoft Graph Documentation](https://docs.microsoft.com/en-us/graph/api/overview), look up the right query and correct the HTTP method and the request URL in the code.

## Challenge #3: Inspect a message sent by Microsoft Teams
Press `F5` to start your server. Set a breakpoint in line 13 of the following file: src -> bot -> handler -> Conversation.ts. Your task is to set the variable `conversationPartner` in line 16 with the Azure Active Directory user ID of the user who sent the message to your server. Use the debugging tools to inspect the message you received from the user.

<details>
<summary>Hint 1:</summary>
<p>
Go into debug mode with the f5 key. Send a chat message to your server by navigating to your newly registered Teams app and sending the bot some message with any text in it. Inspect the variables that are currently known to your server in the debug console.
</p>
</details>
<details>
<summary>Hint 2:</summary>
<p>
In the turnContext object that you should see when you've set your breakpoint in search(), search for an attribute called "activity". Look at its JSON representation and search its attributes.
</p>
</details>

## Challenge #4: Implement a deep link to route users within Microsoft Teams
Your task in this challenge is to set a link that navigates a user from one Teams tab to another. This way, you can guide users through their Teams client and point them to resources that are interesting for them. 
To get started, navigate to the following file: src -> handler -> CardAction.ts . In line 66 in the function subscribe(...), you will find a generic question that greets a newly created user. In that message, create a Deep Link that guides the user to the preferences tab in his personal scope.
To test your feature, send your Teams bot a message that contains the word `subscribe`. This way you can manually trigger a New-subscription message.
<details>
<summary>Hint 1:</summary>
<a href="https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/deep-links">
Check the documentation on Deep Links to learn more about how to configure these.
</a>
</details>
<details>
<summary>Hint 2:</summary>
<p>
In your application, set a breakpoint to get a user message in its JSON representation (see challenge 3). Inspect the turnContext object. It contains most of the information necessary to create your deep link. Also remember your manifest.json that you created in App Studio. Here you have set an ID for your tab.
</p>
</details>

## Challenge #5: Build an Adaptive Card to engage your users
Adaptive Cards are a great way to display information to your users in an engaging way and to show buttons and input forms to your users with which they can provide information in a structured form. In this challenge, you will build your own Adaptive Card to send out a confirmation to an user that scheduled a lunch date with another user.
To get started, navigate to the following file: src -> handler -> CardAction.ts. In line 24, you will find a text message that gets sent out whenever an user schedules a lunch date. Replace that text with an Adaptive Card that displays at least the date at which the two users will meet. 
Optional: To keep your code clean and readable, you can create a new class which constructor returns your Adaptive Card JSON in this folder: src -> bot -> cards. Look into the other cards to get some inspiration on how to do this.

<details>
<summary>Hint 1:</summary>
<p>
Go to <a href="https://adaptivecards.io/designer/">AdaptiveCards.io</a> to start designing your card. They also have samples if you want to look for inspiration.
</p>
</details>
<details>
<summary>Hint 2:</summary>
<p>
All JSON card descriptions have to be converted into adaptive cards before you can send them out to Teams. Call the function <code>CardFactory.adaptiveCard(<i>Your Adaptive Card JSON</i>)</code> and send the return value of this operation to your users Teams client.
</p>
<summary>Hint 3:</summary>
<p>
Adaptive Cards are always handled as attachments. If you want to see a sample of how to send out an Adaptive Card inspect line 76 of Conversation.ts .
</p>
</details>

## Challenge #6: Use the JavaScript SDK to get aware of your context
The previous challenges covered how to communicate with Microsoft Teams on a backend site. But Microsoft Teams also offers a frontend JavaScript SDK that gives your Teams tabs a lot of information about the context they are currently in. In this challenge we will use that SDK to get our current user and the channel in which this tab was called.
To start, navigate to this file: src -> pages -> potentialDates.html. In line 19 and in line 21 you will find to variables initialized with empty strings. Here you should insert the user Id and the group Id (ID of the channel that the Tab is called in) that you receive from the SDK. The SDK is initialized in a variable called microsoftTeams. You can find the documentation of the SDK [here](https://docs.microsoft.com/en-us/javascript/api/overview/msteams-client?view=msteams-client-js-latest)
<details>
<summary>Hint 1:</summary>
<p>
The variables are not intialized at a global level, but they are already nested in another function call named microsoftTeams.getContext(). Through this, we get a context object that we can work with. Use the SDK documentation to understand which attributes this object contains. 
</p>
<summary>Hint 2:</summary>
<p>
We are searching for the attributes userObjectId and groupId in the context object.
</p>
</details>

## Make a final check on your app
You did it! All functionality should now properly work in your application. Click through all the different integrations of your Teams app. Does the Bot respond properly to all your messages? Does your channel tab show you interesting people you should grab lunch with? If so: Congratulations on your very first Teams Application!