import { Client, GatewayIntentBits } from "discord.js";

import dotenv from "dotenv";
import { SystemCommand } from "./commands/system";
import { VC } from "./module/vc";

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [],
});

client.once('ready', () => {
    console.log('✨Ready!');

    if (client.user) {
        console.log(`Logged in as ${client.user.tag}`);
    }
});

SystemCommand(client);

VC(client);

client.login(process.env.TOKEN ?? '');
