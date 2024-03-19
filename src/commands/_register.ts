import { REST, Routes } from "discord.js";
import dotenv from "dotenv";

export const commands = [
    {
        name: 'ping',
        description: 'Pong!を返します。',
    }
];

dotenv.config();

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN ?? '');

try {
    console.log('Started refreshing application (/) commands.');

    (async () => {
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID ?? ''),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    })();
} catch (error) {
    console.error(error);
}