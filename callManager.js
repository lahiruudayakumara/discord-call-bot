require('dotenv').config();
const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior } = require('@discordjs/voice');
const { VoiceConnectionStatus, StreamBuilder } = require('@discordjs/voice');

const fs = require('fs');

let twilioConnection = null;

async function startCall(number, activeCalls, interaction) {
    try {
        // Check if the user is in a voice channel
        if (!interaction.member || !interaction.member.voice || !interaction.member.voice.channel) {
            return '❌ You need to be in a voice channel to use this command.';
        }

        const voiceChannel = interaction.member.voice.channel;

        // Check if the voice channel and guild properties are valid
        if (!voiceChannel.guild) {
            return '❌ Unable to determine the guild. Make sure the bot has the necessary permissions.';
        }

        const twiMLUrl = process.env.TWIMLURL;

        const call = await twilioClient.calls.create({
            to: number,
            from: process.env.FROM_NUMBER,
            url: twiMLUrl,
        });

        // // Store the call SID in the activeCalls map
        activeCalls.set(interaction.user.id, { callSid: call.sid, voiceChannelId: interaction.member.voice.channelId });

        // Connect to the voice channel
        const connection = joinVoiceChannel({
            channelId: process.env.CHANNEL_ID,
            guildId: process.env.GUILD_ID,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: true,
        });

        // Record audio and save it to a file
        twilioConnection = connection;

        // Create an AudioPlayer and play silence to capture audio
        const audioPlayer = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });

        connection.subscribe(audioPlayer);

        // Record audio and save it to a file
        const audioStream = connection.receiver.subscribe(interaction.user.id, {
            end: {
                behavior: VoiceConnectionStatus.Disconnected,
            },
        });

        const writeStream = fs.createWriteStream('recordedAudio.pcm');
        audioStream.pipe(writeStream);

        audioStream.on('end', () => {
            connection.destroy();
            message.editReply('Recording completed and saved!');
        });

        // // Play Twilio audio stream in the voice channel
        // const player = createAudioPlayer({
        //     behaviors: {
        //         noSubscriber: NoSubscriberBehavior.Pause,
        //     },
        // });


        // connection.subscribe(player);

        // // Directly play the live Twilio call audio stream
        // const audioStream = await twilioClient.calls(call.sid).media.list().then((media) => {
        //     const streamSid = media[0].sid; // Assuming the first media entry
        //     return twilioClient.calls(call.sid).media(streamSid).stream();
        // });

        // const resource = createAudioResource(audioStream, {
        //     inputType: StreamType.Arbitrary,
        //     inlineVolume: true,
        // });

        // player.play(resource);

        //         // Wait for the call to end
        //         await new Promise((resolve) => {
        //             player.on('stateChange', (oldState, newState) => {
        //                 if (newState.status === VoiceConnectionStatus.Destroyed) {
        //                     resolve();
        //                 }
        //             });
        //         });

        //         // Remove call information from the activeCalls map after the call ends
        //         activeCalls.delete(interaction.user.id);

        return `✅ Call initiated to ${number}. Call SID: ${call.sid}`;
    } catch (error) {
        console.error('Error starting call:', error);
        console.log(`❌ Failed to start the call. Error: ${error.message}`);
        return `❌ Failed to start the call. Error: ${error.message}`;
    }
}

async function startCallBothNumber(toNumber, fromNumber) {
    try {
        const call = await twilioClient.calls.create({
            to: toNumber,
            from: fromNumber,
            url: 'http://demo.twilio.com/docs/voice.xml',
        });

        // Store the call SID in the activeCalls map
        activeCalls.set(interaction.user.id, call.sid);

        return `✅ Call initiated to ${toNumber} from ${fromNumber}. Call SID: ${call.sid}`;
    } catch (error) {
        console.error('Error starting call:', error);
        console.log(`❌ Failed to start the call. Error: ${error.message}`);
        return `❌ Failed to start the call. Error: ${error.message}`;
    }
}

async function endCall(callSid) {
    try {
        const call = await twilioClient.calls(callSid).update({ status: 'completed' });
        return `✅ Successfully ended the call. Call SID: ${call.sid}`
    } catch (error) {
        console.error('Error ending call:', error);
        return `❌ Failed to end the call. Error: ${error.message}`;
    }
}

module.exports = {
    startCall,
    startCallBothNumber,
    endCall
};