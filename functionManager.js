const { Client } = require('discord.js');

require('dotenv').config();

const startBot = async (client, interaction) => {
    console.log('Restarting the bot...');

    try {
        await interaction.followUp('Restarting the bot...');

        // Create a new instance of the bot and log in
        const newClient = new Client();
        const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
        newClient.login(DISCORD_BOT_TOKEN);
    } catch (error) {
        console.error('Error restarting bot:', error);
        await interaction.followUp('An error occurred while restarting the bot.');
        return;  // Add a return statement to exit the function
    }

    // This line will be reached only if there is no error
    await interaction.followUp('Bot restarted successfully.');
};

const stopBot = async (client, interaction) => {
    try {
        // Optional: Add any cleanup logic before stopping the bot
        console.log('Stopping bot...');
        await interaction.followUp('Bot stopped gracefully.');
        client.user.setPresence({
            status: 'invisible', // or 'dnd'
        });
    } catch (error) {
        console.error('Error stopping bot:', error);
        await interaction.followUp('An error occurred while stopping the bot.');
    }
}

module.exports = {
    startBot,
    stopBot,
};