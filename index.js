import dotenv from "dotenv";

import { App } from "@slack/bolt";

import express from "express";

import mongoose from "mongoose";

// Initialize Slack app
const app = new App({
  token: process.env.SIGNING_SECRET_KEY,
  socketMode: true,
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

// Hnadle the approval test command
app.command("/approval-test", async ({ command, ack, say }) => {
  try {
    await ack();

    await client.views.open({
      trigger_id: command.trigger_id,
      view: {
        type: "modal",
        callback_id: "approval_test_modal",
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
            bloack_id: "approver_select",
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
    console.error(error);
  }
});
