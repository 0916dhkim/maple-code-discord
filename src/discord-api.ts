import z from "zod";
import { env } from "./env.js";
import { Channel, channelSchema, Message, messageSchema } from "./api-types.js";
import { APIEmbed } from "discord.js";
import { db } from "./db/drizzle.js";
import { channelTable } from "./db/schema.js";

const baseUrl = "https://discord.com/api/v10";

async function requestDiscordApi<TSchema extends z.ZodType>(
  url: string,
  schema: TSchema
): Promise<z.infer<TSchema>> {
  const maxRetry = 5;
  for (let i = 0; i < maxRetry; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bot ${env.DISCORD_TOKEN}`,
        },
      });

      const data = await res.json();
      const parseResult = schema.safeParse(data);
      if (parseResult.success) {
        return parseResult.data;
      }
      throw data;
    } catch (e) {
      if (
        typeof e === "object" &&
        e != null &&
        "retry_after" in e &&
        typeof e.retry_after === "number"
      ) {
        const delayMs = e.retry_after * 1000;
        console.log(`waiting for ${delayMs} ms`);
        await new Promise((resolve, reject) => {
          setTimeout(() => resolve(0), delayMs);
        });
      } else {
        throw e;
      }
    }
  }
  throw new Error("Max retries.");
}

async function getAllChannels() {
  const url = `${baseUrl}/guilds/${env.DISCORD_GUILD_ID}/channels`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${env.DISCORD_TOKEN}`,
    },
  });

  const data = await res.json();

  const parsed = z.array(channelSchema).parse(data);
  return parsed;
}

function findAllArchivedChannels(
  allChannels: Channel[],
  archiveCategoryId: string
): Channel[] {
  return allChannels.filter(
    (channel) =>
      (channel.type === "TEXT" || channel.type === "VOICE") &&
      channel.parent_id === archiveCategoryId
  );
}

async function getAllMessagesFromChannel(
  channelId: string
): Promise<Message[]> {
  const LIMIT = 10;
  const result: Message[] = [];
  let isLastPage = false;
  let oldestMessageId: string | undefined = undefined;
  while (!isLastPage) {
    const params = new URLSearchParams({
      limit: LIMIT.toString(),
    });
    if (oldestMessageId != null) {
      params.append("before", oldestMessageId);
    }
    const url = `${baseUrl}/channels/${channelId}/messages?${params}`;

    const parsed = await requestDiscordApi(url, z.array(messageSchema));

    if (parsed.length === 0) {
      isLastPage = true;
    }

    for (const message of parsed) {
      result.push(message);
      oldestMessageId = message.id;
    }
  }

  return result;
}

function findArchiveCategory(allChannels: Channel[]): Channel | null {
  return (
    allChannels.find(
      (channel) => channel.type === "CATEGORY" && channel.name === "archive"
    ) ?? null
  );
}

export async function getChannelsCommandImpl() {
  const allChannels = await getAllChannels();
  const archive = findArchiveCategory(allChannels);

  if (archive == null) {
    throw "No archive";
  }

  const archivedChannels = findAllArchivedChannels(allChannels, archive.id);

  const message: APIEmbed = {
    title: "Server Summary",
    color: 0xff0000,
    fields: [
      {
        name: "📢 Total channels",
        value: `\`${allChannels.length.toString()}\``,
      },
      {
        name: "🆔 Archive channel ID",
        value: `\`${archive.id}\``,
      },
      {
        name: "🧮 Archived channel count",
        value: `\`${archivedChannels.length.toString()}\``,
      },
    ],
  };

  return message;
}

export async function archiveCommandImpl() {
  const allChannels = await getAllChannels();
  const archive = findArchiveCategory(allChannels);

  if (archive == null) {
    throw "No archive";
  }
  const archivedChannels = findAllArchivedChannels(allChannels, archive.id);
  let messageCount = 0;
  for (const channel of archivedChannels) {
    const messages = await getAllMessagesFromChannel(channel.id);
    console.log(`insert: Channel ${channel.name} (${channel.id}) has ${messages.length} messages.`);
    await db.insert(
      channelTable
    ).values({
      id: channel.id,
      name: channel.name ?? "",
      type: channel.type ?? "",
      parentId: channel.parent_id,
      messages: messages,
    })
    .onConflictDoUpdate({
        target: channelTable.id,
        set: {
        name: channel.name ?? "",
        type: channel.type ?? "",
        parentId: channel.parent_id,
        messages: messages
      }
    }
    ); 
    messageCount += messages.length;
  }

  const message: APIEmbed = {
    title: "Server Summary",
    color: 0xff0000,
    fields: [
      {
        name: "🧮 Total message count",
        value: `\`${messageCount.toString()}\``,
      },
    ],
  };

  return message;
}
