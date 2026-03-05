import { SlashCommandBuilder } from "discord.js";
import { CommandSpec } from "../command.js";
import { clearQueue as clearQueueStorage } from "../services/raisedHandsService.js";

export const clearQueue: CommandSpec = {
  metadata: new SlashCommandBuilder()
    .setName("clear-queue")
    .setDescription("Clear the queue of raised hands"),
  run: async (interaction) => {
    await clearQueueStorage();
    await interaction.reply("Queue cleared.");
  },
};
