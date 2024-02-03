require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [
    {
        name: 'call',
        description: 'Start a phone call',
        options: [
            { name: 'number', type: 3, description: 'Phone number to call', required: true }, // Assuming 'STRING' corresponds to type 3
        ],
    },
    {
        name: 'callboth',
        description: 'Start a phone call',
        options: [
            { name: 'to', type: 3, description: 'Phone number to call', required: true }, // Assuming 'STRING' corresponds to type 3
            { name: 'from', type: 3, description: 'Phone number from call', required: true }, // Assuming 'STRING' corresponds to type 3
        ],
    },
    {
        name: 'endcall',
        description: 'End the current call',
    },
    {
        name: 'start',
        description: 'Start the bot',
    },
    {
        name: 'stop',
        description: 'Stop the bot',
    },
    {
        name: 'active',
        description: 'active class',
    },
    {
        name: 'deactivate',
        description: 'deactivate class',
    },
];

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
    try {
        const clientId = process.env.YOUR_CLIENT_ID; // Replace 'YOUR_CLIENT_ID' with your actual bot's client ID
        const guildId = process.env.YOUR_GUILD_ID; // Replace 'YOUR_GUILD_ID' with your guild ID

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );
        console.log('Successfully registered application commands for the guild.');
    } catch (error) {
        console.error(error);
    }
})();