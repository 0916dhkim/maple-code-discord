import fs from "fs/promises";
import { env } from "../env.js";

type QueueItem = {
  nickname: string;
  time: string;
};

type Queue = Record<string, QueueItem>;

const FILE_PATH = env.QUEUE_FILE_PATH;

export async function readQueue(): Promise<Queue> {
  try {
    const data = await fs.readFile(FILE_PATH, "utf-8");
    if (!data.trim()) return {};
    return sanitizeQueueData(JSON.parse(data));
  } catch {
    await fs.writeFile(FILE_PATH, JSON.stringify({}));
    return {};
  }
}

export async function clearQueue(): Promise<void> {
  await fs.writeFile(FILE_PATH, JSON.stringify({}));
}

export async function addToQueue(
  userId: string,
  username: string,
): Promise<string> {
  const queue = await readQueue();

  if (queue[userId]) {
    return "You have already raised your hand.";
  }

  queue[userId] = {
    nickname: username,
    time: new Date().toISOString(),
  };

  await fs.writeFile(FILE_PATH, JSON.stringify(queue, null, 2));
  return "Your hand has been raised.";
}

export async function removeFromQueue(userId: string): Promise<string> {
  const queue = await readQueue();

  if (!queue[userId]) {
    return "You have not raised your hand.";
  }

  delete queue[userId];
  await fs.writeFile(FILE_PATH, JSON.stringify(queue, null, 2));
  return "Your hand has been lowered.";
}

function sanitizeQueueData(input: unknown): Queue {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return {};
  }

  const clean: Queue = {};
  const obj = input as Record<string, unknown>;

  for (const id in obj) {
    if (!/^\d+$/.test(id)) continue;

    const item = obj[id];
    if (typeof item !== "object" || item === null || Array.isArray(item))
      continue;

    const it = item as Record<string, unknown>;

    if (
      typeof it.nickname === "string" &&
      typeof it.time === "string" &&
      !Number.isNaN(Date.parse(it.time))
    ) {
      clean[id] = {
        nickname: it.nickname,
        time: it.time,
      };
    }
  }

  return clean;
}
