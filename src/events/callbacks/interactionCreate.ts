import { ShellInternalNeverError } from "../../structs/errors/base";
import { ShellEvent } from "../../structs/events";
import { ColorCodes } from "../../types/utils";
import { chalk } from "../../utils/chalk";

export default new ShellEvent('interactionCreate', false, (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName != 'shell') {
        throw new ShellInternalNeverError(`Got a different command of shell (got ${chalk(interaction.commandName, ColorCodes.Yellow)})`, 'interactionCreate.ts');
    }

    if (!interaction.guild) return interaction.reply(`This command is only executable into a guild`).catch(() => {});
    if (interaction.user.id != interaction.guild.ownerId) return interaction.reply({
        content: `This command is executable only by the **super user** (guild owner)`,
        flags: ['Ephemeral']
    }).catch(() => {});

    
})