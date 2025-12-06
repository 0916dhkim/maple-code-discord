import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const foldersPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(foldersPath);

function _collect() {
  const ret: string[] = [];
  for (const commandFile of commandFiles) {
    const filePath = path.join(foldersPath, commandFile);
    ret.push(filePath);
  }
  return ret;
}

export const commandFullPath = _collect();
