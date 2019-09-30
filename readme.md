# Lunch Match (MS Teams sample project)

This repository is meant to showcase Microsoft Teams extension canvases. It does not contain any production-ready code and is meant to be used in small demo tenants.

## The idea

The basic idea of this solution is to make networking in an organization easier by finding people with similar interests and bring them together over lunch. This is done via Microsoft Teams. The project contains four solutions:
- A personal chatbot that finds potential lunch partners throughout the whole organization
- A personal tab that lets users configure their lunch preferences
- A channel tab that looks up the interests of all channel members and makes recommendations about who matches your interests most
- A messaging extension that can be used to easily set up a group lunch

## Setup for training participants

To use this lab in an instructor-led training, you will need [ngrok](https://ngrok.com/download), [Visual Studio Code](https://code.visualstudio.com/download) and [Node.js](https://nodejs.org/en/download/). Clone this repository to your local machine, and then navigate (preferably in your browser) to the Challenges.md page. Here you will find all instructions for the lab.

## Setup for instructors or self-paced learners

This lab requires a Microsoft Teams tenant for your users, an Azure Storage instance, a hosted website (this lab is tested on an Azure Web App) and an up-and-running instance of Lunch Master that is already installed on Teams. If you already participated in a training with this lab, ask your instructor for these resources.
If you need a new tenant, sign up to the [Office Developer Program](https://developer.microsoft.com/en-us/office/dev-program) and create a new tenant with a lifetime of three months. Set up users at least for your participants (recommendation is to use all 25 user licenses).
When your tenant has finished deploying, you should be able to log into [Azure](https://portal.azure.com) with your newly scheduled credentials. Go to the Azure Active Directory Tab, and [register a new app](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app). Your app only needs to access its own tenant and needs no Redirect URL. Schedule a secret (and don't forget to store it) and go the API permissions. Your app needs three application permissions: Calendars.ReadWrite, Group.Read.all, User.Read.all. Configure these permissions and click on "Grant admin consent for your-tenant".
After that, switch to the sol branch and clone the project. Deploy the code on a host of your choice.
When your solution is up and running, configure a new Teams app by using [App Studio](https://docs.microsoft.com/en-us/microsoftteams/platform/get-started/get-started-app-studio). Deploy the App to your tenant and [pin it to the app bar](https://docs.microsoft.com/en-us/microsoftteams/teams-app-setup-policies).
Store all information gathered during the process (Tenant ID, Bot ID, Bot Secret, Table Storage Connecting String, AAD App ID, AAD App Secret) as your participants will need it later.
If you have any questions setting this lab up, feel free to contact [tobias.urban@microsoft.com](mailto:tobias.urban@microsoft.com).