import { Message } from "discord.js";
import { ShellCommandOptionsFinder } from "../structs/optionsFinder";

export type shellArgumentType = "channel" | "user" | "role" | "number" | "string" | "presence";
export type shellArgument = {
    name: string;
    description: string;
    type: shellArgumentType;
    mandatory: boolean;
};
export type shellOption = {
    prefix: string;
    doubleDash: boolean;
    argument: shellArgument;
};
export type shellOptions = {
    name: string;
    aliases: string[];
    sudoRequired: boolean;
    options: shellOption[];
    arguments: shellArgument[];
    description: string;
};
export type commandCallbackType = (options: ShellCommandOptionsFinder, message: Message) => void | unknown;
export type shellArgumentTypeReturn<T extends shellArgumentType> = T extends "number" ? number : string;