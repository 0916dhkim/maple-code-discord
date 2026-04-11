import z from "zod";
import dotenv from "dotenv";
dotenv.config();

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1, "DISCORD_TOKEN is not set"),
  DISCORD_CLIENT_ID: z.string(),
  DISCORD_OAUTH_SECRET: z.string(),
  DISCORD_GUILD_ID: z.string(),
  DATABASE_URL: z.string(),
  QUEUE_FILE_PATH: z.string().default("src/data/queue.json"),
  SESSION_SECRET: z.string().default("dev-secret-change-me"),
});

export const env = envSchema.parse(process.env);
