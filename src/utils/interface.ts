import { GuildTextBasedChannel, Message, PermissionsString } from "discord.js";
import { shellArgumentType } from "../types/command";
import { confirmations } from "../cache/maps";
import { Bijection } from "../structs/Bijection";

export const argumentTypeInterface: Record<shellArgumentType, string> = {
    channel: 'channel',
    user: 'user',
    role: 'role',
    number: 'number',
    presence: 'trigger',
    string: "text",
    selection: 'selector'
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
    confirmations.set(`${options.guild}.${options.userId}`, true);
    const res = await options.channel.awaitMessages({
        filter: x => x.author.id === options.userId,
        time,
        max: 1
    }).catch(() => {});
    if (!res) {
        confirmations.delete(`${options.guild}.${options.userId}`);
        return reject(503)
    };

    if (!res.size) {
        confirmations.delete(`${options.guild}.${options.userId}`);
        return resolve({
            collected: false,
            reason: 'timeout',
            message: null,
            result: null
        });
    }
    confirmations.delete(`${options.guild}.${options.userId}`);

    return resolve({
        collected: true,
        reason: 'collected',
        message: res.first(),
        result: /^(y|yes)$/i.test(res.first().content)
    });
});
export const permissionsNames = new Bijection<PermissionsString, string>({
    AddReactions: 'add reactions',
    Administrator: 'administrator',
    AttachFiles: 'attach files',
    UseApplicationCommands: "use application commands",
    ViewAuditLog: "view audit logs",
    UseEmbeddedActivities: "use embedded activities",
    UseExternalApps: "use external applications",
    ManageEmojisAndStickers: "manage emojis and stickers",
    ViewCreatorMonetizationAnalytics: "view creator monetization analytics",
    BanMembers: "ban members",
    BypassSlowmode: "bypass slowmode",
    ChangeNickname: "change nickname",
    Connect: "connect to voice",
    CreateEvents: "create events",
    CreateGuildExpressions: "create guild expressions",
    CreateInstantInvite: "create instant invites",
    CreatePrivateThreads: "create private threads",
    CreatePublicThreads: "create public threads",
    ViewChannel: "view channel",
    ManageChannels: "manage channels",
    DeafenMembers: "deafen members",
    EmbedLinks: "embed links",
    UseExternalEmojis: 'use external emojis',
    UseExternalSounds: 'use external sounds',
    UseExternalStickers: "use external stickers",
    ManageEvents: 'manage events',
    MentionEveryone: "mention everyone",
    ManageGuildExpressions: "manage guild expressions",
    ViewGuildInsights: "view guild insights",
    ManageGuild: "manage server",
    ReadMessageHistory: "read messages history",
    SendMessagesInThreads: "send messages in thread",
    KickMembers: "kick members",
    ManageMessages: "manage messages",
    ManageNicknames: "manage nicknames",
    ManageRoles: "manage roles",
    ManageThreads: "manage threads",
    ManageWebhooks: "manage webhooks",
    ModerateMembers: "moderate members",
    MoveMembers: "move membres",
    MuteMembers: "mute members",
    PinMessages: "pin messages",
    SendMessages: "send messages",
    SendVoiceMessages: "send voice messages",
    PrioritySpeaker: "priority speaker",
    SendPolls: "send polls",
    RequestToSpeak: "request to speak",
    SendTTSMessages: "send tts messages",
    Speak: "speak",
    Stream: "stream",
    UseSoundboard: "use soundboard",
    UseVAD: "use voice activity detection"
})