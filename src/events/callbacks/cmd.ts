import { commands } from "../../cache/commands";
import { ShellsDB } from "../../cache/databases";
import { ShellEvent } from "../../structs/events";
import { ShellCommandOptionsFinder } from "../../structs/optionsFinder";

export default new ShellEvent('messageCreate', false, async(msg) => {
    if (!msg.guild || msg.author.bot || msg.webhookId) return;
    const id = `shells.${msg.guild.id}`;
    if (!ShellsDB.exists(id)) return;
    if (ShellsDB.getValue(id, 'string') != msg.channel.id) return;

    if (!msg.content.length) return;
    const args = msg.content.split(/ +/g);
    const sudoing = args[0].toLowerCase() == 'sudo';

    const cmdName = args[+sudoing]?.toLowerCase?.();

    const cmd = commands.find(x => x.opts.name == cmdName || x.opts.aliases.includes(cmdName));
    if (!cmd) return msg.reply({
        content: `${cmdName}: unknown command`,
        allowedMentions: {
            parse: []
        }
    }).catch(() => {});
    if (cmd.opts.sudoRequired && !sudoing) return msg.reply(`Need super user permissions`).catch(() => {});

    const cmdArgs = cmd.parseArguments(msg.content)

    const invalids = cmdArgs.invalidDashedOptions.concat(cmdArgs.invalidDdashedOptions);
    if (invalids.length > 0) {
        return msg.reply({
            content: `Invalid options usage: \`\`\`${invalids.map(x => `-${x}`).join('\n')}\`\`\`\n> Check the types of the options you give, if the texts are wrapped in between " (use \\" to include a " inside of a text), if numbers are numbers and if you mentionned the channels/roles/users`,
            allowedMentions: {}
        }).catch(() => {});
    }
    if (!cmdArgs.allIncluded) return msg.reply({
        content: `${cmdName}: arguments missing`,
        allowedMentions: {}
    }).catch(() => {});

    const finder = new ShellCommandOptionsFinder(cmdArgs.dashedOptions.concat(cmdArgs.doubleDashedOptions));
    cmd.callback(finder, msg);
})