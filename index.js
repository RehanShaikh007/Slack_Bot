import dotenv from 'dotenv';

import { App } from '@slack/bolt';

import express from 'express';

import mongoose from 'mongoose';

// Initialize Slack app
const app = new App({
    token: process.env.SIGNING_SECRET_KEY,
    socketMode: true,
})

// Initialize Express app
const expressApp = express();
expressApp.use(express.json());

// Initialize MongoDB connection
mongoose.connect(process.env.MONGO_URI) 
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB', err);
    });

    