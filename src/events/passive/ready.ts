import { ApplicationCommandOptionType, ApplicationCommandType, ChannelType } from "discord.js";
import { ShellEvent } from "../../structs/events";
import { ColorCodes, ColorFonts } from "../../types/utils";
import { chalk } from "../../utils/chalk";
import { print } from "../../utils/print";
import { ShellClientChatInputDeploymentErrors } from "../../structs/errors/client";

export default new ShellEvent('clientReady', false, async(client) => {
    print(`Logged in as ${chalk(client.user.tag, ColorCodes.Yellow)}`, ColorCodes.Cyan, ColorFonts.Light);

    print(`Pushing the /shell command`, ColorCodes.Red, ColorFonts.Light);

    await client.application.commands.set([
        {
            name: 'shell',
            description: "Define the shell channel",
            type: ApplicationCommandType.ChatInput,
            options: [
                {
                    name: 'channel',
                    description: "The channel to set to",
                    required: true,
                    type: ApplicationCommandOptionType.Channel,
                    channelTypes: [ChannelType.GuildText]
                }
            ],
            dmPermission: false
        }
    ]).catch((error) => {
        throw new ShellClientChatInputDeploymentErrors(error);
    })

    print('Deployed /shell command', ColorCodes.Blue, ColorFonts.Light);
})