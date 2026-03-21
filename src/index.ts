import { createClient } from "./create-client.js";
import { deployCommands } from "./deploy-commands.js";
import { env } from "./env.js";
import express from "express";

const app = express();

async function startBot() {
  await deployCommands();

  const client = await createClient();
  client.login(env.DISCORD_TOKEN);
}

app.use(express.static("public"));

app.listen(3000, () => {
  console.log("Server running...");
});

await startBot();
