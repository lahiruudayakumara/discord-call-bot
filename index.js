const express = require('express');
const app = express();
require('dotenv').config();
const commandModule = require('./commands');
const { Client, GatewayIntentBits } = require('discord.js');
const winston = require('winston');
const { startCall, startCallBothNumber, endCall } = require('./callManager');
const { stopBot, startBot } = require('./functionManager');

const port = process.env.PORT || 3000;

app.use(express.static(__dirname));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

// Logger Configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console({ format: winston.format.simple() })
    ],
});

const activeCalls = new Map();
let activatedChannels = [];

// Unhandled Rejection Handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught Exception Handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1); // Exit the process with an error code (1)
});
// Command Cooldowns Map
const cooldowns = new Map();

// Function to validate a phone number
function isValidPhoneNumber(phoneNumber) {
    // Regular expression for a basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;

    return phoneRegex.test(phoneNumber);
}

// Bot Ready Event
client.on('ready', () => {
    const BOT_VERSION = '0.0.1';

    logger.info(`Logged in as ${client.user.tag}`);
    console.log(`Discord Call Bot v${BOT_VERSION} is now connected and ready.`);

    // Get the channel where you want to send the message
    const channelId = process.env.DISCORD_CHANNEL_ID; // Discord channel ID
    const channel = client.channels.cache.get(channelId);

    // Check if the channel is found
    if (channel) {
        // Send a message to the channel
        // channel.send('☎️ Call-Bot is now online and ready!');
    } else {
        logger.error(`Channel with ID ${channelId} not found.`);
    }
});


// Message Create Event
client.on('messageCreate', async (message) => {
    if (message.content === 'hi call bot') {
        message.channel.send("Hi I'm Call-bot");
        message.channel.send("Yo can use following commands!");
        message.channel.send('🔗  "/call" - you can call')
    }
})

// Interaction Create Event
client.on('interactionCreate', async (interaction) => {
    // Bot Ready Event
    if (!interaction.isChatInputCommand()) {
        console.log('Interaction 📢:', interaction);
        interaction.reply({ content: 'Waiting...' });  // Fix the typo here
    } else {
        await interaction.deferReply();
    }

    const { commandName } = interaction;

    // Command Handling
    try {
        if (commandName === 'call') {
            const number = interaction.options.getString('number');
            const startCallMessage = await startCall(number, activeCalls, interaction);
            console.log(startCallMessage);
            await interaction.editReply({ content: startCallMessage });  // Fix the typo here
        } else if (commandName === 'callboth') {
            const toNumber = interaction.options.getString('to');
            const fromNumber = interaction.options.getString('from');
            const startBothCallMessage = await startCallBothNumber(toNumber, fromNumber);
            console.log(startBothCallMessage);
            await interaction.editReply({ content: startBothCallMessage });  // Fix the typo here
        } else if (commandName === 'endcall') {
            const author = activeCalls.get(interaction.user.id);
            const endCallMessage = await endCall(author.callSid);
            console.log(endCallMessage);
            await interaction.editReply({ content: endCallMessage });
        } else if (commandName === 'active') {
            // Get the channel ID where the command was used
            const channelId = interaction.channelId;

            // Set the activation state for the specific channel
            if (!activatedChannels.includes(channelId)) {
                activatedChannels.push(channelId);
                await interaction.editReply('Bot activation is now true for this channel!');
            } else {
                await interaction.reply('Bot is already activated for this channel!');
            }
        } else if (commandName === 'deactivate') {
            // Get the channel ID where the command was used
            const channelId = interaction.channelId;

            // Remove the channel from the activated list
            const index = activatedChannels.indexOf(channelId);
            if (index !== -1) {
                activatedChannels.splice(index, 1);
                await interaction.editReply('Bot deactivation is now true for this channel!');
            } else {
                await interaction.editReply('Bot is not activated for this channel!');
            }
        }
        // Handle other commands as needed
    } catch (error) {
        logger.error(`Error handling command ${commandName}:`, error);
        await interaction.editReply('An error occurred while executing the command.');
    }
});

//--------------------------------------------------------
client.on('messageCreate', async message => {
    if (message.author.bot) return; // Ignore messages from bots

    const channelId = message.channel.id;

    // Check if the activation state is true for the specific channel
    if (activatedChannels.includes(channelId)) {
        // Your logic for handling messages when activated
        let msg = message.content.toLowerCase()
        if (msg === 'hello bot') {
            message.reply('Hello! How can I assist you today?');
        }
    }
});


client.login(process.env.DISCORD_BOT_TOKEN);

app.post('/twilio-webhook', twilio.webhook(process.env.TWILIO_AUTH_TOKEN, {
    url: 'http://localhost:3000/twiml.xml', // Replace with the actual URL where your twiml.xml is hosted
}));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});