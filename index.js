const dotenv = require("dotenv");
const { App } = require("@slack/bolt");
const express = require("express");
const mongoose = require("mongoose");
const Approval = require("./schema/approvalSchema");

dotenv.config();

// Initialize Slack app
const app = new App({
  token: process.env.BOT_TOKEN_KEY,
  signingSecret: process.env.SIGNING_SECRET_KEY,
  socketMode: true,
  appToken: process.env.APP_TOKEN_KEY,
});

// Initialize Express app
const expressApp = express();
expressApp.use(express.json());

// Initialize MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

// Handle the approval test command
app.command("/approval-test", async ({ command, ack, client }) => {
  try {
    await ack();

    await client.views.open({
      trigger_id: command.trigger_id,
      view: {
        type: "modal",
        callback_id: "approval_modal",
        title: {
          type: "plain_text",
          text: "Approval Test",
        },
        submit: {
          type: "plain_text",
          text: "Submit",
        },
        blocks: [
          {
            type: "input",
            block_id: "approver_select",
            element: {
              type: "users_select",
              placeholder: {
                type: "plain_text",
                text: "Select an approver",
              },
              action_id: "approver",
            },
            label: {
              type: "plain_text",
              text: "Approver",
            },
          },
          {
            type: "input",
            block_id: "approval_text",
            element: {
              type: "plain_text_input",
              multiline: true,
              action_id: "text",
            },
            label: {
              type: "plain_text",
              text: "Approval Request Details",
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error("Command error:", error);
  }
});

// Handle modal submission
app.view("approval_modal", async ({ ack, body, view, client }) => {
  try {
    await ack();

    const approverId = view.state.values.approver_select.approver.selected_user;
    const requestText = view.state.values.approval_text.text.value;
    const requesterId = body.user.id;

    await client.chat.postMessage({
      channel: approverId,
      text: `New approval request from ${requesterId}: ${requestText}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*New Approval Request from <@${requesterId}>*\n\n${requestText}`,
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "✅ Approve" },
              style: "primary",
              action_id: "approve_action",
              value: requesterId,
            },
            {
              type: "button",
              text: { type: "plain_text", text: "❌ Reject" },
              style: "danger",
              action_id: "reject_action",
              value: requesterId,
            },
          ],
        },
      ],
    });
  } catch (error) {
    console.error("Modal error:", error);
  }
});

// Handle approval
app.action("approve", async ({ ack, body, client }) => {
  await handleApprovalAction(ack, body, client, "approved");
});

// Handle rejection
app.action("reject", async ({ ack, body, client }) => {
  await handleApprovalAction(ack, body, client, "rejected");
});

// Handle approve action
app.action("approve_action", async ({ ack, body, client }) => {
  await ack();
  // Get approver's info
  const approverInfo = await client.users.info({
    user: body.user.id,
  });
  const approverName = approverInfo.user.real_name || approverInfo.user.name;
  await client.chat.postMessage({
    channel: body.actions[0].value, // requesterId
    text: `Your request was approved by *${approverName}*!`,
  });
});

// Handle reject action
app.action("reject_action", async ({ ack, body, client }) => {
  await ack();
  // Get approver's info
  const approverInfo = await client.users.info({
    user: body.user.id,
  });
  const approverName = approverInfo.user.real_name || approverInfo.user.name;
  await client.chat.postMessage({
    channel: body.actions[0].value, // requesterId
    text: `Your request was rejected by *${approverName}*!`,
  });
});

// Shared handler for approval/rejection
async function handleApprovalAction(ack, body, client, action) {
  try {
    await ack();

    const approvalId = body.actions[0].value;
    const approverId = body.user.id;

    // Update approval status in database
    const approval = await Approval.findById(approvalId);
    approval.status = action;
    await approval.save();

    // Notify requester
    await client.chat.postMessage({
      channel: approval.requesterId,
      text: `Your approval request has been ${action} by <@${approverId}>`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Approval Request Update*\n\nYour request has been *${action}* by <@${approverId}>\n\nOriginal request: ${approval.text}`,
          },
        },
      ],
    });

    // Update the original message
    await client.chat.update({
      channel: body.channel.id,
      ts: body.message.ts,
      text: `Approval request ${action} by <@${approverId}>`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Approval Request ${action}*\n\nFrom: <@${approval.requesterId}>\n\n${approval.text}\n\nStatus: ${action} by <@${approverId}>`,
          },
        },
      ],
    });
  } catch (error) {
    console.error(error);
  }
}

const PORT = process.env.PORT || 3000;

// Start the app
(async () => {
  await app.start(PORT);
  console.log(`Slack Bolt app is running on Port ${PORT}!`);
})();
