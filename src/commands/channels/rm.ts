import { ChannelType, GuildChannel, GuildTextBasedChannel } from "discord.js";
import { ShellCommand } from "../../structs/Command";
import { confirmation } from "../../utils/interface";

export default new ShellCommand({
    name: 'removechannel',
    description: "Deletes a channel",
    sudoRequired: true,
    options: [
        {
            prefix: 'r',
            doubleDash: false,
            argument: {
                name: 'recursive',
                description: "Removes inside channels if category",
                mandatory: false,
                type: 'presence'
            }
        },
        {
            prefix: 'reason',
            doubleDash: true,
            argument: {
                name: 'reason',
                description: "Reason for the deletion",
                mandatory: false,
                type: 'string'
            }
        },
        {
            prefix: 'confirm',
            doubleDash: true,
            argument: {
                name: 'skip',
                description: "skips confirmation",
                mandatory: false,
                type: 'presence'
            }
        }
    ],
    arguments: [
        {
            name: 'channel',
            type: 'channel',
            description: "Channel to remove",
            mandatory: true
        }
    ],
    aliases: ['rmchannel', 'deletechannel', 'delchan', 'rmchan', 'rm']
}).run(async(options, message) => {
    const channelId = options.getArgument('channel', 'channel', true);
    const recursive = options.present('r', false);
    const skip = options.present('confirm', true);
    const reason = options.getString('reason', true) ?? 'N/A';

    const channel = message.guild.channels.cache.get(channelId) ?? await message.guild.channels.fetch(channelId).catch(() => {}) as GuildChannel;
    if (!channel) return ['0', 'Channel not found'];

    if (!skip) {
        const msg = await message.reply(`Are you sure to delete <#${channel.id}>${recursive && channel.type === ChannelType.GuildCategory ? " and its channels ?" : ' ?'}\n\nSend \`yes\` in the channel to proceed`).catch(() => {});
        const res = await confirmation({
            channel: message.channel as GuildTextBasedChannel,
            guild: message.guild.id,
            userId: message.author.id,
            message: message
        }).catch(() => {});
        if (!res || !res.result) return ['0', 'Canceled']
    }

    if (recursive && channel.type === ChannelType.GuildCategory) {
        await message.guild.channels.fetch().catch(() => {});
        await Promise.all(
            message.guild.channels.cache.filter(x => x.parentId === channel.id).map(x => x.delete(reason).catch(() => {}))
        ).catch(() => {});
    }
    const res = await channel.delete(reason).catch(() => {});

    if (!!res) return [res.id, "ok"];
    return ['0', 'Something wrent wrong.'];
})