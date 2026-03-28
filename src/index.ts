import { app } from "./activity-server.js";
import { createClient } from "./create-client.js";
import { deployCommands } from "./deploy-commands.js";
import { env } from "./env.js";

async function startBot() {
  await deployCommands();

  const client = await createClient();
  client.login(env.DISCORD_TOKEN);
}

app.listen(3000, () => {
  console.log("Server running...");
});

await startBot();
