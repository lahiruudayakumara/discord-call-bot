require('dotenv').config();

const Discord = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const client = new Discord.Client();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = new twilio(accountSid, authToken);
const BOT_VERSION = '0.0.1';

client.once('ready', () => {
    console.log(`Discord Call Bot v${BOT_VERSION} is now connected and ready.`);
});

let currentCall = null;

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
client.login(DISCORD_BOT_TOKEN);