import { DiscordSDK } from "@discord/embedded-app-sdk";

const id = import.meta.env.VITE_DISCORD_CLIENT_ID;

document.body.innerHTML = "wow";

if (id == null) {
  throw new Error("Client ID required");
}

const discordSdk = new DiscordSDK(id);

await discordSdk.ready();

// Authorize and authenticate
const { code } = await discordSdk.commands.authorize({
  client_id: id,
  response_type: "code",
  state: "",
  prompt: "none",
  scope: ["identify", "guilds"],
});

// 2. Exchange code for token (via your backend)
const res = await fetch("/api/token", {
  method: "POST",
  body: JSON.stringify({ code }),
});

const body = await res.json();

if (
  typeof body !== "object" ||
  body == null ||
  !("access_token" in body) ||
  typeof body.access_token != "string"
) {
  throw new Error("Invalid body");
}

const { access_token } = body;

// 3. Authenticate with the SDK
const auth = await discordSdk.commands.authenticate({ access_token });

// ✅ User ID is here
// console.log(auth.user.id); // e.g. "123456789012345678"
// console.log(auth.user.username); // e.g. "serj"
// console.log(auth.user.avatar); // avatar hash
const output = document.createElement("p");
output.innerHTML = `${auth.user.id} ${auth.user.username}`;
document.body.appendChild(output);
