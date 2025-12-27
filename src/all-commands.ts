import { getChannels } from "./commands/get-channels.js";
import { ping } from "./commands/ping.js";

/** List of all commands */
export const COMMAND_SPECS = [ping, getChannels];
