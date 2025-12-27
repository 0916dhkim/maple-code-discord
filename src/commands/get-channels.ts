import { SlashCommandBuilder } from "discord.js";
import { CommandSpec } from "../command.js";
import { getChannelsCommandImpl } from "../discord-api.js";

export const getChannels: CommandSpec = {
  metadata: new SlashCommandBuilder()
    .setName("get-channels")
    .setDescription("Summarize channels"),
  run: async (interaction) => {
    const message = await getChannelsCommandImpl();
    await interaction.reply({ embeds: [message] });
  },
};
