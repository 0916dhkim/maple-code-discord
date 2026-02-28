import fs from "fs/promises";

export async function readQueue() {
    const data = await fs.readFile("src/data/queue.json", "utf-8");
    return JSON.parse(data);
}

export async function clearQueue() {
    await fs.writeFile("src/data/queue.json", JSON.stringify({}));
}

