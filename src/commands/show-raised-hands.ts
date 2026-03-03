import { SlashCommandBuilder } from "discord.js";
import { CommandSpec } from "../command.js";
import { readQueue } from "../services/raisedHandsService.js";


export const showRaisedHands: CommandSpec = {
    metadata: new SlashCommandBuilder()
        .setName("show-raised-hands")
        .setDescription("Show the list of users who have raised their hands"),
    run: async (interaction) => {
        const queue = await readQueue();
        if (Object.keys(queue).length === 0) {
            await interaction.reply("No hands are currently raised.");
            return;
        }
        
        const queueString = Object.values(queue)
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((e) => e.nickname)
            .join("\n");

        await interaction.reply(queueString);
  
    },
}