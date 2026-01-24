import { SlashCommandBuilder } from "discord.js";
import { CommandSpec } from "../command.js";
import { readChannelCommandImpl } from "../discord-api.js";
import { z } from "zod";

export const readChannel: CommandSpec = {
  metadata: new SlashCommandBuilder()
    .setName("read-channel")
    .setDescription("returns channel messages")
    .addStringOption((option) =>
      option
        .setName("channel-id")
        .setRequired(true)
        .setDescription("The ID of the channel to read messages from"),
    ),
  run: async (interaction) => {
    const channelId = interaction.options.getString("channel-id");
    if (!channelId) {
      await interaction.reply("No channel ID provided");
      return;
    }
    const channelMessages = (await readChannelCommandImpl(channelId))[0]
      ?.messages;

    const messageSchema = z.object({
      id: z.string(),
      author: z.object({
        id: z.string(),
        username: z.string(),
        global_name: z.string().nullable(),
        discriminator: z.string(),
      }),
      content: z.string(),
      channel_id: z.string(),
    });
    const parsed = z.array(messageSchema).parse(channelMessages);
    const message = parsed
      .map((msg) => `${msg.author.username}: ${msg.content}`)
      .join("\n");
    await interaction.reply(message);
  },
};
