import { REST, Routes } from "discord.js";
import { COMMAND_SPECS } from "./all-commands.js";
import z from "zod";
import { env } from "./env.js";

const responseSchema = z.array(z.unknown());

export async function deployCommands() {
  try {
    const rest = new REST().setToken(env.DISCORD_TOKEN);

    console.log(
      `Started refreshing ${COMMAND_SPECS.length} application (/) commands.`,
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const response = await rest.put(
      Routes.applicationGuildCommands(
        env.DISCORD_CLIENT_ID,
        env.DISCORD_GUILD_ID,
      ),
      { body: COMMAND_SPECS.map((spec) => spec.metadata.toJSON()) },
    );

    const data = responseSchema.parse(response);

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`,
    );
  } catch (error) {
    console.error(error);
  }
}
