import { DiscordSDK } from "@discord/embedded-app-sdk";

const id = import.meta.env.VITE_DISCORD_CLIENT_ID;

let debugPanel: HTMLElement | null = null;
let debugLog: HTMLElement | null = null;

function ensureDebugPanel() {
  if (debugPanel) return;

  debugPanel = document.createElement("div");
  Object.assign(debugPanel.style, {
    position: "fixed",
    bottom: "16px",
    right: "16px",
    zIndex: "9999",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px",
    fontFamily: "monospace",
    fontSize: "13px",
  });

  debugLog = document.createElement("div");
  Object.assign(debugLog.style, {
    background: "rgba(0,0,0,0.85)",
    color: "#d4f5a0",
    borderRadius: "8px",
    padding: "10px 14px",
    maxWidth: "360px",
    maxHeight: "260px",
    overflowY: "auto",
    display: "none",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    lineHeight: "1.5",
  });

  const toggle = document.createElement("button");
  toggle.textContent = "🪲 Debug";
  Object.assign(toggle.style, {
    background: "rgba(0,0,0,0.75)",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    padding: "6px 14px",
    cursor: "pointer",
    fontSize: "13px",
  });
  toggle.addEventListener("click", () => {
    const hidden = debugLog!.style.display === "none";
    debugLog!.style.display = hidden ? "block" : "none";
  });

  debugPanel.appendChild(debugLog);
  debugPanel.appendChild(toggle);
  document.body.appendChild(debugPanel);
}

function print(content: string) {
  ensureDebugPanel();
  const line = document.createElement("div");
  line.textContent = content;
  debugLog!.appendChild(line);
  debugLog!.scrollTop = debugLog!.scrollHeight;
}

async function everything() {
  try {
    if (id == null) {
      throw new Error("Client ID required");
    }
    const discordSdk = new DiscordSDK(id);
    await discordSdk.ready();

    print("sdk ready");

    // Authorize and authenticate
    const { code } = await discordSdk.commands.authorize({
      client_id: id,
      response_type: "code",
      state: "",
      prompt: "none",
      scope: ["identify", "guilds"],
    });

    print(`code ready : ${code}`);

    // 2. Exchange code for token (via your backend)
    const res = await fetch("/activity-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    print("token ready");

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
    print(`${auth.user.username}`);
  } catch (e) {
    print(String(e));
  }
}

function startSSE() {
  print("SSE: connecting...");
  const source = new EventSource("/events");

  source.onopen = () => {
    print("SSE: connected");
  };

  source.onmessage = (event) => {
    print(`SSE: ${event.data}`);
  };

  source.onerror = () => {
    print("SSE: error / closed");
    source.close();
  };
}

let eventCount = 0;

async function sendEvent() {
  eventCount++;
  const message = `user action #${eventCount}`;
  print(`Sending: ${message}`);
  await fetch("/send-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
}

const button = document.getElementById("everything");
button?.addEventListener("click", everything);

startSSE();

const sendButton = document.getElementById("send-event");
sendButton?.addEventListener("click", sendEvent);
