import express from "express";
import z from "zod";
import { env } from "./env.js";

const tokenRequestBodySchema = z.object({
  code: z.string(),
});

const discordTokenApiResponseSchema = z.object({
  access_token: z.string(),
});

export const _app = express();

_app.use(express.json());
_app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

_app.post("/activity-token", async (req, res) => {
  try {
    const reqBody = tokenRequestBodySchema.parse(req.body);
    const { code } = reqBody;

    const apiRes = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: env.DISCORD_CLIENT_ID,
        client_secret: env.DISCORD_OAUTH_SECRET,
        code,
      }),
    });

    const body = await apiRes.json();
    const parsedBody = discordTokenApiResponseSchema.parse(body);
    const { access_token } = parsedBody;

    res.json({
      access_token,
    });
  } catch (e) {
    console.error(e);
    res.status(500);
    res.json({
      error: String(e),
    });
  }
});

const sseClients = new Set<express.Response>();

_app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.add(res);

  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 15_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

const sendEventBodySchema = z.object({
  message: z.string(),
});

_app.post("/send-event", (req, res) => {
  const body = sendEventBodySchema.parse(req.body);
  const data = JSON.stringify({ message: body.message, timestamp: Date.now() });

  for (const client of sseClients) {
    client.write(`data: ${data}\n\n`);
  }

  res.json({ sent: sseClients.size });
});

_app.use(express.static("public"));

export const app = _app;
