import z from "zod";
import dotenv from "dotenv";
dotenv.config();

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1, "DISCORD_TOKEN is not set"),
  DISCORD_CLIENT_ID: z.string(),
  DISCORD_GUILD_ID: z.string(),
  DATABASE_URL: z.string(),
});

export const env = envSchema.parse(process.env);
