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

_app.use(express.static("public"));

export const app = _app;
