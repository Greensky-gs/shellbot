import { ShellCommand } from "../../structs/Command";
import { parseHexColor } from "../../utils/regexes";

export default new ShellCommand({
    name: 'createrole',
    description: "Create a role",
    sudoRequired: true,
    aliases: ['crrole', 'mkrole'],
    arguments: [
        {
            name: 'name',
            description: "Name of the role",
            type: 'string',
            mandatory: true
        }
    ],
    options: [
        {
            doubleDash: true,
            prefix: 'color',
            argument: {
                name: 'color',
                description: "Color of the role",
                mandatory: false,
                type: 'string'
            }
        },
        {
            doubleDash: true,
            prefix: 'reason',
            argument: {
                name: 'reason',
                description: "Reason of the creation",
                mandatory: false,
                type: 'string'
            }
        },
        {
            doubleDash: true,
            prefix: "hoist",
            argument: {
                name: "hoist",
                description: "Role is separated from others",
                mandatory: false,
                type: 'presence'
            }
        },
        {
            doubleDash: true,
            prefix: 'mention',
            argument: {
                name: 'mention',
                mandatory: false,
                description: "Role is mentionnable",
                type: 'presence'
            }
        }
    ]
}).run(async(opts, msg) => {
    const name = opts.getArgument('name', 'string', true);
    const color = opts.getString('color', true) ?? '000';
    const hoist = opts.present('hoist', true);
    const mention = opts.present('mention', true);
    const reason = opts.getString('reason', true) ?? 'N/A';

    const hexColor = parseHexColor(color);
    if (!hexColor) return ['0', `\`${color}\` : invalid hex color. Something like : \`#ef93e1\``]

    const role = await msg.guild.roles.create({
        name,
        colors: { primaryColor: hexColor[1] },
        hoist,
        mentionable: mention,
        reason
    }).catch(() => {});
    if (!role) return ['0', 'creation failed'];

    return [role.id, '']
});