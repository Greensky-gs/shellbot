import { AllowedMentionsTypes, Message } from "discord.js";
import { commands } from "../../cache/commands";
import { ShellsDB, SuperUsers } from "../../cache/databases";
import { confirmations } from "../../cache/maps";
import { ShellEvent } from "../../structs/events";
import { ShellCommandOptionsFinder } from "../../structs/optionsFinder";
import { argumentTypeInterface } from "../../utils/interface";
import { parseCommands } from '../../utils/parsers'
import { ShellCommand } from "../../structs/Command";
import { MixedQueue } from "../../structs/MixedQueue";
import { ShellRuntimeNeverError } from "../../structs/errors/base";

const checkValidity = (cmdList: string[]): {valid: boolean; joiners: string[]; cmds: [ShellCommand, ShellCommandOptionsFinder][]; invalids: {name: string; reason: string}[]} => {
    const invalids: {name: string; reason: string}[] = [];
    const joiners = [];
    const values: [ShellCommand, ShellCommandOptionsFinder][] = cmdList.map((content) => {
        const joinerRes = /^ *(?<val>&|\|) *$/.exec(content)
        if (joinerRes) {
            joiners.push(joinerRes.groups.val);
            return [null, null]
        };

        const args = content.replace(/^ */, '').split(/ +/g);
        const sudoing = args[0].toLowerCase() === 'sudo';

        const cmdName = args[+sudoing]?.toLowerCase();

        const cmd = commands.find(x => x.opts.name === cmdName || x.opts.aliases.includes(cmdName));
        if (!cmd) {
            invalids.push({
                name: cmdName,
                reason: "Unknown command"
            });
            return [null, null];
        }
        if (cmd.opts.sudoRequired && !sudoing) {
            invalids.push({
                name: cmd.opts.name,
                reason: "Need super user permissions."
            });
            return [null, null]
        }

        const cmdArgs = cmd.parseArguments(content.replace(/^ */, ''), sudoing);

        const invalidsOpts = cmdArgs.invalidDashedOptions.concat(cmdArgs.invalidDdashedOptions);
        if (!!invalidsOpts.length) {
            invalids.push({
                name: cmd.opts.name,
                reason: `Invalid options usage: ${invalidsOpts.map(x => `-${x}`).join(', ')} (Check the types of the options you give, if the texts are wrapped in between " (use \\" to include a " inside of a text), if numbers are numbers and if you mentionned the channels/roles/users)`
            });
            return [null, null];
        }
        if (!!cmdArgs.invalidArguments.length) {
            invalids.push({
                reason: `Invalid arguments usage: ${cmdArgs.invalidArguments.map(x => `${x.name}  : ${x.description} (${argumentTypeInterface[x.type]})`)}`,
                name: cmd.opts.name
            });
            return[null,null];
        }
        if (!cmdArgs.allIncluded) {
            invalids.push({
                reason: `Arguments missing`,
                name: cmd.opts.name
            });
            return [null,null]
        }
        if (!cmdArgs.allDashedIncluded) {
            invalids.push({
                reason: "Options missing",
                name: cmd.opts.name
            });
            return [null,null];
        }
        return [cmd, new ShellCommandOptionsFinder(cmdArgs.dashedOptions.concat(cmdArgs.doubleDashedOptions), cmdArgs.arguments)];
    }).filter(([a,b]) => a != null && b != null) as [ShellCommand, ShellCommandOptionsFinder][];

    return {
        valid: !invalids.length,
        invalids,
        joiners,
        cmds: values
    }
}
const executeCommand = async(cmd: ShellCommand, options: ShellCommandOptionsFinder, msg: Message): Promise<[boolean, string, string]> => {
    const res = await cmd.callback(options, msg);
    return [res[0] !== '0', ...res];
}

export default new ShellEvent('messageCreate', false, async(msg) => {
    if (!msg.guild || msg.author.bot || msg.webhookId) return;
    const id = `shells.${msg.guild.id}`;
    if (!ShellsDB.exists(id)) return;
    if (ShellsDB.getValue(id, 'string') != msg.channel.id) return;

    if (!msg.content.length) return;
    if (confirmations.has(`${msg.guild.id}.${msg.author.id}`)) return;

    const cmds = parseCommands(msg.content);
    const parsed = checkValidity(cmds);
    
    if (!parsed.valid) {
        return msg.reply({
            content: `\`\`\`Invalid command usage:\n${parsed.invalids.map(x => `${x.name} : ${x.reason}`).join('\n')}\`\`\``,
            allowedMentions: {}
        }).catch(() => {});
    }
    if (parsed.cmds.length !== parsed.joiners.length + 1) {
        return msg.reply({
            content: `\`\`\`Invalid command syntax: command expected in between operators\`\`\``,
            allowedMentions: {}
        }).catch(() => {});
    }
    
    const stack = new MixedQueue<string | [ShellCommand, ShellCommandOptionsFinder]>()
    let i = 0;
    const total = parsed.joiners.length + parsed.cmds.length;
    while (i < total) {
        if (i % 2) {
            stack.stack(parsed.joiners.shift());
        } else {
            stack.queue(parsed.cmds.shift());
        }
        i++;
    };

    if (stack.height === 1) {
        const val = stack.unqueue() as [ShellCommand, ShellCommandOptionsFinder];
        const res = await executeCommand(val[0], val[1], msg);
        if (!res[0]) return msg.reply({
            content: `\`\`\`${res[2]}\`\`\``,
            allowedMentions: {}
        }).catch(() => {});
        return msg.reply({
            content: `\`\`\`${res[1]}\`\`\``,
            allowedMentions: {}
        }).catch(() => {});
    }

    let latest: string;

    while (!stack.empty()) {
        const v = stack.unqueue();
        if (typeof v !== 'string') {
            await msg.reply({
                content: "```Something wrent wrong.\nContact my dev```"
            }).catch(() => {});
            throw new ShellRuntimeNeverError(`Unqueued an not-text values for command exec`);
        }
        if (!'&|'.includes(v)) {
            await msg.reply({
                content: "```Something wrent wrong.\nContact my dev```"
            }).catch(() => {});
            throw new ShellRuntimeNeverError(`Unqueued a text that is not an operator`);
        }

        const a = stack.unqueue() as [ShellCommand, ShellCommandOptionsFinder];
        const b = stack.unqueue() as [ShellCommand, ShellCommandOptionsFinder];

        const resA = await executeCommand(a[0], a[1], msg);
        if (v === '&') {
            if (!resA[0]) {
                return msg.reply({
                    content: `\`\`\`${resA[2]}\`\`\``,
                    allowedMentions: {}
                }).catch(() => {});
            } else {
                const resB = await executeCommand(b[0], b[1], msg);
                if (!resB[0]) {
                    return msg.reply({
                        content: `\`\`\`${resB[2]}\`\`\``,
                        allowedMentions: {}
                    }).catch(() => {});
                } else {
                    latest = resB[1];
                }
            }
        } else if (v === '|') {
            const resB = await executeCommand(b[0], b[1], msg);
            if (!resA[0] && !resB[0]) {
                return msg.reply({
                    content: `\`\`\`${resA[2]}\`\`\``,
                    allowedMentions: {}
                }).catch(() => {});
            } else if (!resA[0]) {
                latest = resB[1];
            } else {
                latest = resA[1]
            }
        }
    }
    msg.reply({
        content: `\`\`\`${latest}\`\`\``,
        allowedMentions: {}
    }).catch(() => {});
})