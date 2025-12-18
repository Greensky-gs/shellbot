import { GuildChannel } from "discord.js";
import { ShellCommand } from "../../structs/Command";

export default new ShellCommand({
    name: "rename",
    description: "Rename a channel",
    sudoRequired: false,
    arguments: [
        {
            name: "channel",
            description: "Channel to rename",
            mandatory: true,
            type: 'channel'
        },
        {
            name: "name",
            description: "new name for the channel",
            mandatory: true,
            type: 'string'
        }
    ],
    options: [
        {
            prefix: 'reason',
            doubleDash: true,
            argument: {
                name: "reason",
                description: "Reason",
                mandatory: false,
                type: "string"
            }
        }
    ],
    aliases: []
}).run(async(options, message) => {
    const channelID = options.getArgument('channel', 'channel', true);
    const name = options.getArgument('name', 'string', true);
    const reason = options.getString('reason', true) ?? 'N/A';

    const channel = message.guild.channels.cache.get(channelID) ?? (await message.guild.channels.fetch(channelID).catch(() => {})) as GuildChannel;
    if (!channel) return message.reply({
        content: "```Channel not found```",
        allowedMentions: {}
    }).catch(() => {});

    await channel.setName(name, reason).catch(() => {});
    message.reply({
        content: `<#${channel.id}>`,
        allowedMentions: {}
    }).catch(() => {});
});