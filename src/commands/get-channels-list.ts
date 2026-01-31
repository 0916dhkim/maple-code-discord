import { SlashCommandBuilder } from "discord.js";
import { CommandSpec } from "../command.js";
import { listChannelsCommandImpl } from "../discord-api.js";

export const listChannels: CommandSpec = {
  metadata: new SlashCommandBuilder()
    .setName("list-channels")
    .setDescription("List all archived channels"),
  run: async (interaction) => {
    await interaction.deferReply();
    const message = await listChannelsCommandImpl();
    await interaction.editReply("Listing channels...");
    var index = 0;
    var chunk = 20;
    while (index < message.length) {
      await interaction.followUp(message.slice(index, index + chunk).map(channel => `Name: ${channel.name}, ID: ${channel.id}`).join("\n"));
      index += chunk;
    }
  },
};
