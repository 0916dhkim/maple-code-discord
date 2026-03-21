import { createClient } from "./create-client.js";
import { deployCommands } from "./deploy-commands.js";
import { env } from "./env.js";
import express from "express";

async function startBot() {
  await deployCommands();

  const client = await createClient();
  client.login(env.DISCORD_TOKEN);
}

await startBot();

const app = express();

app.get("*", (req, res) => {
  res.send("Hello world!");
});

app.listen(3000, () => {
  console.log("Server running...");
});
