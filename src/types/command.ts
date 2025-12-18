import { Message } from "discord.js";
import { ShellCommandOptionsFinder } from "../structs/optionsFinder";

export type shellArgumentType = "channel" | "user" | "role" | "number" | "string" | 'selection' | "presence";
export type shellArgument<T extends shellArgumentType = shellArgumentType> = {
    name: string;
    description: string;
    type: T;
    mandatory: boolean;
} & (T extends 'selection' ? {
    choices: string[];
} : {});
export type shellOption = {
    prefix: string;
    doubleDash: boolean;
    argument: shellArgument<shellArgumentType>;
};
export type shellOptions = {
    name: string;
    aliases: string[];
    sudoRequired: boolean;
    options: shellOption[];
    arguments: shellArgument<shellArgumentType>[];
    description: string;
};
type returnValue = string;
type returnMessage = string;
type callbackReturnValue = [returnValue, returnMessage];

/**
 * test
 * @returns [returnValue, returnMessage] returnMessage is displayed only if returnValue === 0
 */
export type commandCallbackType = (options: ShellCommandOptionsFinder, message: Message) => callbackReturnValue | Promise<callbackReturnValue>;
export type shellArgumentTypeReturn<T extends shellArgumentType> = T extends "number" ? number : string;