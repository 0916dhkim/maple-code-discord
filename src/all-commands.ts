import { archive } from "./commands/archive.js";
import { getChannels } from "./commands/get-channels.js";
import { readChannel } from "./commands/read-channel.js";
import { ping } from "./commands/ping.js";
import { listChannels } from "./commands/get-channels-list.js";

/** List of all commands */
export const COMMAND_SPECS = [ping, getChannels, archive, readChannel, listChannels];