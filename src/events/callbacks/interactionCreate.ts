import { ChannelType } from "discord.js";
import { ShellInternalNeverError } from "../../structs/errors/base";
import { ShellEvent } from "../../structs/events";
import { ColorCodes } from "../../types/utils";
import { chalk } from "../../utils/chalk";
import { ShellsDB } from "../../cache/databases";

export default new ShellEvent('interactionCreate', false, async(interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName != 'shell') {
        throw new ShellInternalNeverError(`Got a different command of shell (got ${chalk(interaction.commandName, ColorCodes.Yellow)})`, 'interactionCreate.ts');
    }

    if (!interaction.guild) return interaction.reply(`This command is only executable into a guild`).catch(() => {});
    if (interaction.user.id != interaction.guild.ownerId) return interaction.reply({
        content: `This command is executable only by the **super user** (guild owner)`,
        flags: ['Ephemeral']
    }).catch(() => {});

    const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]);
    if (!channel) return interaction.reply({
        content: `Channel not found. Please try again.`
    }).catch(() => {});

    await interaction.reply({
        content: 'Please hold on...',
    }).catch(() => {});

    const res = await channel.send({
        content: 'Testing the shell channel...'
    }).catch(() => {});
    if (!res) {
        return interaction.editReply({
            content: "I can't send messages in the channel."
        }).catch(() => {});
    }

    ShellsDB.writeValue(`shells.${interaction.guild.id}`, 'string', channel.id);
    interaction.editReply({
        content: `The shell channel has been set to <#${channel.id}> !\nNow everytime a message is posted in it, I will try to run the command\n\n\n⚠️ **WARNING**\n> If you set the shell channel to a public channel, any user can run a command`
    }).catch(() => {});
})