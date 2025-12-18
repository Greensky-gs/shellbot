import { ChannelType, GuildChannel } from "discord.js";
import { ShellCommand } from "../../structs/Command";
import { ShellRuntimeNeverError } from "../../structs/errors/base";

export default new ShellCommand({
    name: 'move',
    aliases: ['mv'],
    description: "Moves a channel",
    sudoRequired: false,
    arguments: [
        {
            name: "channel",
            description: "Channel to move",
            mandatory: true,
            type: 'channel'
        }
    ],
    options: [
        {
            prefix: 'parent',
            doubleDash: true,
            argument: {
                name: 'parent',
                type: 'channel',
                mandatory: false,
                description: "Category to set the channel into"
            }
        },
        {
            prefix: 'u',
            doubleDash: false,
            argument: {
                name: 'up',
                description: "Moves the channel upward",
                type: 'presence',
                mandatory: false
            }
        },
        {
            prefix: 'd',
            doubleDash: false,
            argument: {
                name: 'down',
                description: "Moves the channel downwards",
                type: 'presence',
                mandatory: false
            }
        },
        {
            prefix: 'abs',
            doubleDash: true,
            argument: {
                name: 'absolute',
                description: "Sets the absolute position of the channel",
                type: 'presence',
                mandatory: false
            }
        },
        {
            prefix: 'a',
            doubleDash: false,
            argument: {
                name: 'amount',
                description: "Amount of the channel to move",
                type: 'number',
                mandatory: false
            }
        },
        {
            prefix: 'reason',
            doubleDash: true,
            argument: {
                name: 'reason',
                description: "Reason",
                type: 'string',
                mandatory: false
            }
        },
        {
            prefix: 'un-parent',
            doubleDash: true,
            argument: {
                name: 'unparent',
                description: "Removes the channel from its parent",
                type: 'presence',
                mandatory: false
            }
        }
    ]
}).run(async(options, message) => {
    const channelID = options.getArgument('channel', 'channel', true);
    const parent = options.getChannel('parent', true);
    const reason = options.getString('reason', false) ?? 'N/A';
    const rm = options.present('un-parent', true)

    const channel = (message.guild.channels.cache.get(channelID) ?? await message.guild.channels.fetch(channelID).catch(() => {})) as GuildChannel;
    if (!channel) return ['0', 'Channel not found'];
    if (!rm && parent) {
        const parentChannel = (message.guild.channels.cache.get(parent) ?? await message.guild.channels.fetch(parent).catch(() => {})) as GuildChannel;
        if (!parentChannel) return ['0', "Parent channel not found"];
        if (parentChannel.type != ChannelType.GuildCategory) return ['0', `${parentChannel.name} is not a category channel`];

        if (channel.type === ChannelType.GuildCategory) return ['0', `Cannot move ${channel.name} into ${parentChannel.name} : ${channel.name} is a category`];
        channel.setParent(parentChannel.id, {
            reason
        }).catch(() => {});
    }

    const amount = options.getNumber('a', false);
    if (!amount) return ['0', "No amount specified"];

    const direction: 'up' | 'down' | 'abs' = options.present('u', false) ? 'up' : options.present('d', false) ? 'down' : options.present('abs', true) ? 'abs' : 'abs';
    const newPlace = direction == 'abs' ? amount : (channel.position + amount * (direction == 'up' ? -1 : 1));

    channel.setPosition(newPlace, {
        reason
    }).catch(() => {});
    if (rm) channel.setParent(null, {reason}).catch(() => {});

    message.reply({
        content: "channel moved"
    }).catch(() => {});

    return [channel.id, 'never'];
})