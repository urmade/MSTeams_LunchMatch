# Challenges for the Lunch Match Teams Lab

## Establish a ngrok tunnel to start developing
Open the ngrok file you downloaded and type in `ngrok http 8080` in the console that opens. An overview with two URLs, your public tunnelings URLs, should open. Do not close this, as you will need it later.

## Prepare your .env file
At the root level of your directory, create a new file called `.env`. Insert the following parameters into the file (you should get the concrete values from your instructor):

```
#AAD Application registration for tenant-wide interactions with Microsoft Graph
GRAPHAPPID=
GRAPHAPPSECRET=

#AAD Application registration for the chatbot
BOTAPPID=
BOTAPPSECRET=

#Connection string to Azure Storage account that holds user management
TABLESTORAGECONNECTIONSTRING=

#ID to the Tenant for which the App is hosted
TENANTID=
```

Insert the values your instructor gave you into the .env file.

## Log into your Teams account
Your instructor should have given you the credentials for a new Teams tenant. Log into Teams with these credentials and try out the Lunch Match application before you start to implement it on your own.

## Build your app manifest
To install any Teams app, you will need to create a manifest.json that describes your application. Your instructor will give you a Bot ID, Bot Secret as well as an URL where a finished version of the App is running. Use these to build your own manifest:
1. Install the App Studio App from the Teams Store.
2. Open it, go to the Manifest Editor tab and click on `Create a new app`
3. Fill out the App details (Give your app a creative name, as you want to identify later on which app was yours).
4. Create a Team tab on configurePotentialDates.html and a personal tab on settings.html.
5. Register a chatbot with the bot credentials provided. The bot should have the personal scope. Add a `search` command.
6. Set up the Messaging Extension with the same bot. Give it the `GroupLunch` command (mind the spelling, this is important!). The command should trigger an action in our service and has a static set of parameters. Configure a Date parameter and give it the ID `Date` (again, spelling is important!).
7. Go to "Test and distribute" and download your manifest. After this, install the app. Select the team "Teams power users" to install the team functionalities.
8. Play around with your new app and check if everything is working.

## Build your own Teams application
Create a new Teams app in App Studio. This time, register a new bot and use your ngrok tunnel URLs to configure the tabs, messaging extensions and bot. Install the app and make sure you started your application on your local machine (preferably in debug mode). Most of the functionality will not work right now, but we will get there!

## Implement the getUser query
In your code, go to src -> util -> graphQueries.ts . Here you will find a function called getUser(...). Implement the Graph query to get a single user object.

## Get the current user that wants to search lunch partners
Go to src -> bot -> handler -> Conversation.ts . In the function search(...), you will find the variable `conversationPartner`. Find a way to get the Azure Active Directory ID of the user that made the search request.
<details>
<summary>Tip 1:</summary>
<p>
Go into debug mode with the f5 key and set a breakpoint at the very top of the function. Inspect the variables that are currently available. 
</p>
</details>
<details>
<summary>Tip 2:</summary>
<p>
In the turnContext object, search for an attribute called "activity". Look at its attributes.
</p>
</details>

## Implement a deep link to the preferences tab
Go to src -> handler -> CardAction.ts . In the function subscribe(...) towards the end you will find a message that gets sent out to a newly registered user (first `turnContext.sendActivity()` call). Implement a Teams deep link into this message so that the user can get directly to the preferences tab with a link in the message.
<details>
<summary>Tip 1:</summary>
<a href="https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/deep-links">
Check the documentation on Deep Links.
</a>
</details>
<details>
<summary>Tip 2:</summary>
<p>
In debug mode, inspect the turnContext object. It contains a lot of information necessary to create your deep link. Also remember your manifest from App Studio. Here you could set an ID for your tab.
</p>
</details>

##Build an adaptive card for the confirmation of a lunch date
Go to src -> handler -> CardAction.ts . In the function scheduleLunch(...) you can find a `turnContext.sendActivity()` call that currently sends out a text confirmation to the user. Replace the text with an adaptive card to display the same information in a more fancy way.
<details>
<summary>Tip 1:</summary>
<p>
Go to <a href="https://adaptivecards.io/designer/">AdaptiveCards.io</a> to start designing your card. They also have samples if you want to look for inspiration.
</p>
</details>
<details>
<summary>Tip 2:</summary>
<p>
All JSON card representations have to be converted into adaptive cards before Teams can interpret them. Use the function <code>CardFactory.adaptiveCard(<i>Your JSON</i>)</code> and send out the returning Attachment object.
</p>
</details>

## Get the user AAD ID and the group ID in the potentialDates tab
Go to pages -> potentialDates.html. In the script tag, you will find a userId and a groupId variable. Set those to the current user that looks at the tab and the current group that the tab is hosted in.
<details>
<summary>Tip 1:</summary>
<p>
Teams offers its own client-side JavaScript SDK. You can find it <a href="https://docs.microsoft.com/en-us/javascript/api/overview/msteams-client?view=msteams-client-js-latest">here</a>.
</p>
</details>

## Make a final check on your app
Go through your app and check all functionality. If everything is working, you successfully finished the lab!