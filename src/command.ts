import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SlashCommandOptionsOnlyBuilder } from "@discordjs/builders";

export type CommandSpec = {
  metadata: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  run: (interaction: ChatInputCommandInteraction) => Promise<void>;
};
