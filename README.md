# Discord Call Bot

A Discord bot that integrates with Twilio to handle calls.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/username/discord-call-bot.git
   cd discord-call-bot
   ```

2. **Install the dependencies:**

   ```bash
   npm install
   ```

## Configuration

Create a `.env` file in the root directory with the following content:

```env
# Discord bot token
DISCORD_TOKEN=your_discord_token

# Twilio account SID
TWILIO_ACCOUNT_SID=your_twilio_account_sid

# Twilio authentication token
TWILIO_AUTH_TOKEN=your_twilio_auth_token

# Twilio phone number (the number you will use to make calls)
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# TwiML URL for handling incoming calls
TWIMLURL=your_twiml_url

# Phone number to be used as the caller ID
FROM_NUMBER=your_caller_id_phone_number

# Discord channel ID where the bot will send messages
CHANNEL_ID=your_discord_channel_id

# Discord guild (server) ID where the bot will operate
GUILD_ID=your_discord_guild_i
```

## Usage

To start the bot, run the following command:

```bash
npm run dev
```
