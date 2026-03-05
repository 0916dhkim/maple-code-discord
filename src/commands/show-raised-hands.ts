import { SlashCommandBuilder } from "discord.js";
import { CommandSpec } from "../command.js";
import { getQueueDisplay } from "../services/raisedHandsService.js";

export const showRaisedHands: CommandSpec = {
  metadata: new SlashCommandBuilder()
    .setName("show-raised-hands")
    .setDescription("Show the list of users who have raised their hands"),
  run: async (interaction) => {
    const queueDisplay = await getQueueDisplay();
    await interaction.reply(queueDisplay);
  },
};
