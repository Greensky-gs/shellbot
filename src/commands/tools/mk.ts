import { ChannelType, GuildChannel } from "discord.js";
import { ShellCommand } from "../../structs/Command";

const available = {
    text: ChannelType.GuildText,
    voice: ChannelType.GuildVoice,
    category: ChannelType.GuildCategory,
    forum: ChannelType.GuildForum,
    announcements: ChannelType.GuildAnnouncement
}

export default new ShellCommand({
    name: 'makechannel',
    description: "Create a channel",
    sudoRequired: true,
    aliases: ['makechan', 'mkchannnel', 'mkchan', 'mk'],
    arguments: [
        {
            name: 'name',
            description: "Name of the channel",
            mandatory: true,
            type: 'string'
        },
        {
            name: 'type',
            description: "Type of the channel",
            mandatory: true,
            type: 'selection',
            choices: Object.keys(available)
        }
    ],
    options: [
        {
            doubleDash: true,
            prefix: 'parent',
            argument: {
                name: 'parent',
                description: "parent channel",
                type: 'channel',
                mandatory: false
            }
        },
        {
            doubleDash: true,
            prefix: 'nsfw',
            argument: {
                name: 'nsfw',
                description: "Is channel NSFW",
                type: 'presence',
                mandatory: false
            }
        },
        {
            doubleDash: true,
            prefix: 'reason',
            argument: {
                name: 'reason',
                description: "Reason of the creation",
                type: 'string',
                mandatory: false
            }
        }
    ]
}).run(async(options, message) => {
    const name = options.getArgument('name', 'string', true);
    const type = available[options.getArgument('type', 'selection', true)];
    const parentId = options.getChannel('parent', true);
    const reason = options.getString('reason', true) ?? 'N/A';
    const nsfw = options.present('nsfw', true);

    const parentChannel = !!parentId ? ((message.guild.channels.cache.get(parentId) ?? await message.guild.channels.fetch(parentId).catch(() => {})) as GuildChannel) : null;
    if (!!parentId && !parentChannel) return message.reply("``Parent channel not found````").catch(() => {});
    if (!!parentId && parentChannel.type != ChannelType.GuildCategory) return message.reply({
        content: `<#${parentId}> is not a category channel`,
        allowedMentions: {}
    }).catch(() => {});

    const channel = await message.guild.channels.create({
        name,
        type,
        parent: !!parentId ? parentChannel.id : undefined,
        nsfw,
        reason
    }).catch(() => {});
    if (!channel) return message.reply("Creation failed").catch(() => {});

    message.reply({
        content: `<#${channel.id}>`,
        allowedMentions: {}
    }).catch(() => {});
});