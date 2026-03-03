import fs from "fs/promises";

export async function readQueue() {
    try {
        const data = await fs.readFile("src/data/queue.json", "utf-8");
        return  sanitizeQueueData(JSON.parse(data));
    } catch (error) {
        await fs.writeFile("src/data/queue.json", JSON.stringify({}));
        return {};
    }

}

export async function clearQueue() {
    await fs.writeFile("src/data/queue.json", JSON.stringify({}));
}

export async function addToQueue(userId, username) {
    if(typeof userId !== "string" || typeof username !== "string") {
        return "Invalid userId or username type.";
    } else {
        const queue = await readQueue();
        if(queue[userId]) {
            return "You have already raised your hand.";
        } else {
            queue[userId] = {
                nickname: username,
                time: new Date().toISOString()
            };
            await fs.writeFile("src/data/queue.json", JSON.stringify(queue, null, 2));
            return "Your hand has been raised.";
        }
    }
}

export async function removeFromQueue(userId) {
    const queue = await readQueue();
    if(queue[userId]) {
        delete queue[userId];
        await fs.writeFile("src/data/queue.json", JSON.stringify(queue, null, 2));
        return "Your hand has been lowered.";
    } else {
        return "You have not raised your hand.";
    }
}

function sanitizeQueueData(input) {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return {};
  }

  const clean = {};

  for (const id in input) {
    const item = input[id];

    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      continue;
    }

    if (!/^\d+$/.test(id)) {
      continue;
    }

    const nickname = item.nickname;
    const time = item.time;

    if (typeof nickname !== "string") continue;
    if (typeof time !== "string") continue;
    if (isNaN(Date.parse(time))) continue;

    clean[id] = {
      nickname: nickname,
      time: time
    };
  }

  return clean;
}