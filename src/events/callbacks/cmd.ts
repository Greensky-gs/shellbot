import { commands } from "../../cache/commands";
import { ShellsDB, SuperUsers } from "../../cache/databases";
import { ShellEvent } from "../../structs/events";
import { ShellCommandOptionsFinder } from "../../structs/optionsFinder";
import { argumentTypeInterface } from "../../utils/interface";

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
    if (sudoing && msg.author.id != msg.guild.ownerId) {
        const list = SuperUsers.exists(`sus.${msg.guild.id}`) ? SuperUsers.getValue(`sus.${msg.guild.id}`, 'array') as string[] : [];
        if (!list.includes(msg.author.id)) return msg.reply('Permission denied.').catch(() => {});
    }

    const cmdArgs = cmd.parseArguments(msg.content, sudoing);

    const invalids = cmdArgs.invalidDashedOptions.concat(cmdArgs.invalidDdashedOptions);
    if (invalids.length > 0) {
        return msg.reply({
            content: `Invalid options usage: \`\`\`${invalids.map(x => `-${x}`).join('\n')}\`\`\`\n> Check the types of the options you give, if the texts are wrapped in between " (use \\" to include a " inside of a text), if numbers are numbers and if you mentionned the channels/roles/users`,
            allowedMentions: {}
        }).catch(() => {});
    }
    if (cmdArgs.invalidArguments.length > 0) {
        return msg.reply({
            content: `Invalid arguments usage:\`\`\`${cmdArgs.invalidArguments.map(x => `${x.name}  : ${x.description} (${argumentTypeInterface[x.type]})`)}\`\`\``,
            allowedMentions: {}
        }).catch(() => {});
    }
    if (!cmdArgs.allIncluded) {
        return msg.reply(`${cmdName}: arguments missing`).catch(() => {});
    }
    if (!cmdArgs.allDashedIncluded) return msg.reply({
        content: `${cmdName}: options missing`,
        allowedMentions: {}
    }).catch(() => {});

    const finder = new ShellCommandOptionsFinder(cmdArgs.dashedOptions.concat(cmdArgs.doubleDashedOptions), cmdArgs.arguments);
    cmd.callback(finder, msg);
})