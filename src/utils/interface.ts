import { GuildTextBasedChannel, Message } from "discord.js";
import { shellArgumentType } from "../types/command";

export const argumentTypeInterface: Record<shellArgumentType, string> = {
    channel: 'channel',
    user: 'user',
    role: 'role',
    number: 'number',
    presence: 'trigger',
    string: "text"
}
type confirmationOptions = {
    userId: string;
    guild: string;
    channel: GuildTextBasedChannel;
    message: Message;
    time?: number;
}
type confirmationPromiseType<T extends boolean> = {
    collected: T;
    reason: T extends false ? 'timeout' : T extends true ? 'collected' : never;
    message: T extends false ? null : T extends true ? Message : never;
    result: T extends false ? null : T extends true ? boolean : never;
}
export const confirmation = ({ time = 120000, ...options }: confirmationOptions): Promise<confirmationPromiseType<boolean>> => new Promise(async(resolve, reject) => {
    const res = await options.channel.awaitMessages({
        filter: x => x.author.id === options.userId,
        time,
        max: 1
    }).catch(() => {});
    if (!res) return reject(503);

    if (!res.size) return resolve({
        collected: false,
        reason: 'timeout',
        message: null,
        result: null
    });
    return resolve({
        collected: true,
        reason: 'collected',
        message: res.first(),
        result: /^(y|yes)$/i.test(res.first().content)
    });
});