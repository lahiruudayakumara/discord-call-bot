const { startCallBothNumber } = require("./callManager");

client.ws.on('INTERACTION_CREATE', async interaction => {
    const { name, options } = interaction.data;
    const command = name.toLowerCase();

    switch (command) {
        case 'call':
            const number = options.find(opt => opt.name === 'number').value;
            await startCall(number);
            await replyToInteraction(interaction, `Calling ${number}...`);
            break;
        case 'callboth':
            const toNumber = options.find(opt => opt.name === 'to').value;
            const fromNumber = options.find(opt => opt.name === 'from').value;
            await startCallBothNumber(toNumber, fromNumber)
            await replyToInteraction(interaction, `Calling to ${toNumber} from ${fromNumber}...`);
            break;
        case 'endcall':
            await endCall();
            await replyToInteraction(interaction, 'Call ended.');
            break;
    }
});

async function replyToInteraction(interaction, response) {
    await client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
            data: {
                content: response,
            },
        },
    });
}