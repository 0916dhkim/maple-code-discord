import express from "express";
import session from "express-session";
import z from "zod";
import { env } from "./env.js";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    username?: string;
  }
}

const tokenRequestBodySchema = z.object({
  code: z.string(),
});

const discordTokenApiResponseSchema = z.object({
  access_token: z.string(),
});

const discordUserApiResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
});

export const _app = express();

_app.use(express.json());
_app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax" },
  })
);
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

    // Fetch Discord user info and store in session
    const userRes = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const user = discordUserApiResponseSchema.parse(await userRes.json());
    req.session.userId = user.id;
    req.session.username = user.username;

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

const sendEventBodySchema = z.object({
  message: z.string(),
});

// EventEmitter-style: SSE clients just listen, POST broadcasts to all
const { on, emit } = (() => {
  type Listener = (data: string) => void;
  const listeners = new Set<Listener>();
  return {
    on: (fn: Listener) => { listeners.add(fn); return () => listeners.delete(fn); },
    emit: (data: string) => { for (const fn of listeners) fn(data); },
  };
})();

_app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const off = on((data) => res.write(`data: ${data}\n\n`));

  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 15_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    off();
  });
});

_app.post("/send-event", (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const body = sendEventBodySchema.parse(req.body);
  const data = JSON.stringify({
    username: req.session.username,
    message: body.message,
    timestamp: Date.now(),
  });

  emit(data);

  res.json({ ok: true });
});

_app.use(express.static("public"));

export const app = _app;
