import { commands } from "../../cache/commands";
import { ShellCommand } from "../../structs/Command";
import { ShellInternalNeverError } from "../../structs/errors/base";
import { shellArgument } from "../../types/command";
import { ColorCodes } from "../../types/utils";
import { chalk } from "../../utils/chalk";

export default new ShellCommand({
    name: 'help',
    aliases: ['h'],
    sudoRequired: false,
    options: [],
    arguments: [
        {
            name: 'command',
            description: "Command to display",
            mandatory: false,
            type: 'string'
        }
    ],
    description: "help page"
}).run(async(options, message) => {
    const cmdName = options.getArgument('command', 'string', false);
    if (!cmdName) {
        message.reply({
            content: `\`\`\`Commands list:\n${commands.map((cmd => `    ${cmd.opts.sudoRequired ? 'sudo ' : ''}${cmd.opts.name} : ${cmd.opts.description}`)).join('\n')}\`\`\``,
            allowedMentions: {}
        }).catch(() => {});
        return ['1', 'never']
    }

    const cmd = commands.find(x => x.opts.name === cmdName.toLowerCase() || x.opts.aliases.includes(cmdName.toLowerCase()));
    if (!cmd) return ['0', `${cmdName}: Unknown command`];

    message.reply({
        allowedMentions: {},
        content: `\`\`\`${cmd.opts.sudoRequired ? 'sudo ':''}${cmd.opts.name} : ${cmd.opts.description}\n    Alias: ${cmd.opts.aliases.length > 0 ? cmd.opts.aliases.join(', ') : 'None'}\n    Options: ${cmd.opts.options.length > 0 ? cmd.opts.options.map(opt => `${'<['[+opt.argument.mandatory]}${opt.doubleDash ? '--' : '-'}${opt.prefix}${'>]'[+opt.argument.mandatory]}${opt.argument.type === 'string' ? ' "some text"' : opt.argument.type === 'channel' ? ' #channel' : opt.argument.type === 'number' ? ' number' : opt.argument.type === 'presence' ? '' : opt.argument.type === 'role' ? '@role' : opt.argument.type === 'user' ? '@user' : opt.argument.type === 'selection' ? `selector` : (() => {
            throw new ShellInternalNeverError(`Option type ${chalk(opt.argument.type, ColorCodes.Yellow)} does not exist`, 'help.ts');
            return 'never'
        })()}`).join(' ') : 'no option'}\n    Arguments: ${cmd.opts.arguments.length > 0 ? cmd.opts.arguments.map(opt => `${'<['[+opt.mandatory]}${opt.name}${'>]'[+opt.mandatory]} : ${opt.type === 'string' ? ' "some text"' : opt.type === 'channel' ? ' #channel' : opt.type === 'number' ? ' number' : opt.type === 'presence' ? '' : opt.type === 'role' ? '@role' : opt.type === 'user' ? '@user' : opt.type === 'selection' ? `selector` :(() => {
            throw new ShellInternalNeverError(`Argument type ${chalk(opt.type, ColorCodes.Yellow)} does not exist`, 'help.ts');
            return 'never'
        })()}`).join(' ') : 'no argument'}\n\nOptions: ${!cmd.opts.options.length ? 'None' : '\n    ' + cmd.opts.options.map(o => `${['-', '--'][+o.doubleDash]}${o.prefix} : ${o.argument.description}${o.argument.type === 'selection' ? `: ${(o.argument as shellArgument<'selection'>).choices.join('|')}` :''}`).join('\n    ')}\nArguments: ${!cmd.opts.arguments.length ? 'None' : '\n    ' + cmd.opts.arguments.map(a => `${a.name} : ${a.description}${a.type === 'selection' ? `: ${(a as shellArgument<'selection'>).choices.join('|')}` :''}`)}\nNote : [] indicates mandatory arguments/options, and <> indicates optional arguments/options\`\`\``
    })

    return ['1', 'never'];
})