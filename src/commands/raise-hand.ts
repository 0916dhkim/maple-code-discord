import { SlashCommandBuilder } from "discord.js";
import { CommandSpec } from "../command.js";
import { addToQueue } from "../services/raisedHandsService.js";

export const raiseHand: CommandSpec = {
    metadata: new SlashCommandBuilder()
        .setName("raise-hand")
        .setDescription("Raise your hand to be called on"),
    run: async (interaction) => {
        const result = await addToQueue(interaction.user.id, interaction.user.username);
        await interaction.reply(result);
    },
}