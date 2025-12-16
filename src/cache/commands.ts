import { Collection } from "discord.js";
import { ShellCommand } from "../structs/Command";

export const commands = new Collection<string, ShellCommand>();