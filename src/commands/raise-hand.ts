import { SlashCommandBuilder } from "discord.js";
import { CommandSpec } from "../command.js";

export const raiseHand: CommandSpec = {
  data: new SlashCommandBuilder()
    .setName("raise-hand")
    .setDescription("Raise your hand to ask a question or make a comment during the meeting."),
  async execute(interaction) {
    await interaction.reply("You have raised your hand! The host will see that you want to speak.");
  },
};