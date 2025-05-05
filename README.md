# Slack Approval Bot

A Slack bot that handles approval workflows within an organization. Users can request approvals from other team members and get notified of the decisions.

## Features

- `/approval-test` slash command to initiate approval requests
- Modal interface for selecting approver and entering request details
- Interactive buttons for approving/rejecting requests
- Real-time notifications for requesters
- MongoDB integration for request tracking

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Slack workspace with admin privileges
- Slack App with necessary permissions

## Setup

1. Create a new Slack App at https://api.slack.com/apps
2. Enable Socket Mode
3. Add the following bot token scopes:
   - `chat:write`
   - `commands`
   - `users:read`
   - `users:read.email`
4. Create a slash command `/approval-test`
5. Install the app to your workspace

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   SLACK_BOT_TOKEN=xoxb-your-bot-token
   SLACK_SIGNING_SECRET=your-signing-secret
   SLACK_APP_TOKEN=xapp-your-app-token
   MONGODB_URI=mongodb://localhost:27017/slack-approval-bot
   PORT=3000
   ```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Usage

1. Type `/approval-test` in any Slack channel
2. Select an approver from the dropdown
3. Enter your approval request details
4. Click Submit
5. The approver will receive a message with Approve/Reject buttons
6. The requester will be notified of the decision


## Architecture

The application uses:
- Slack Bolt Framework for Slack integration
- Express.js for the web server
- MongoDB for data persistence
- Socket Mode for real-time communication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Workflow Diagram
[Click here](https://app.eraser.io/workspace/BZPD9AZNaZuxx4t5Gins?origin=share)
