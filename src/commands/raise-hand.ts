import { SlashCommandBuilder } from "discord.js";
import { CommandSpec } from "../command.js";
import {
  addToQueue,
  getQueueDisplay,
  NO_RAISED_HANDS_MESSAGE,
} from "../services/raisedHandsService.js";

export const raiseHand: CommandSpec = {
  metadata: new SlashCommandBuilder()
    .setName("raise-hand")
    .setDescription("Raise your hand to be called on"),
  run: async (interaction) => {
    const result = await addToQueue(
      interaction.user.id,
      interaction.user.username,
    );
    const queueDisplay = await getQueueDisplay();
    if (queueDisplay === NO_RAISED_HANDS_MESSAGE) {
      await interaction.reply(`${result}\n\n${queueDisplay}`);
      return;
    }

    await interaction.reply(`${result}\n\nCurrent queue:\n${queueDisplay}`);
  },
};
