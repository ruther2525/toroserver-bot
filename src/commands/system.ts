import { Client } from "discord.js";

export const SystemCommand = (client: Client) => {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'ping') {
            const response = await interaction.reply('Pong!');
            response.edit(`Pong! (latency: ${response.createdTimestamp - interaction.createdTimestamp}ms)`);
        }
    })
}