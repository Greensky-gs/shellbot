import { ShellCommand } from "../../structs/Command";
import { parseHexColor } from "../../utils/regexes";

export default new ShellCommand({
    name: 'roleedit',
    description: "Edit a role",
    aliases: ['redit', 're'],
    options: [
        {
            prefix: 'name',
            doubleDash: true,
            argument: {
                name: 'name',
                description: "The new name of the role",
                type: "string",
                mandatory: false
            }
        },
        {
            prefix: 'color',
            doubleDash: true,
            argument: {
                name: 'color',
                description: "The new color of the role",
                type: 'string',
                mandatory: false
            }
        },
        {
            prefix: 'secondcolor',
            doubleDash: true,
            argument: {
                name: 'secondcolor',
                description: "Second color of the role (gradient)",
                type: 'string',
                mandatory: false
            }
        },
        {
            prefix: 'hoist',
            doubleDash: true,
            argument: {
                name: 'hoist',
                description: "Role hoisted from other roles",
                type: 'selection',
                mandatory: false,
                choices: ['yes', 'no']
            }
        },
        {
            prefix: 'mention',
            doubleDash: true,
            argument: {
                name: 'mention',
                description: "If the role is mentionable or not",
                type: 'selection',
                mandatory: false,
                choices: ['yes', 'no']
            }
        },
        {
            prefix: 'reason',
            doubleDash: true,
            argument: {
                name: 'reason',
                description: "Reason of the modification",
                type: 'string',
                mandatory: false
            }
        }
    ],
    arguments: [
        {
            name: 'role',
            description: "Role to edit",
            type: "role",
            mandatory: true
        }
    ],
    sudoRequired: true
}).run(async(options, msg) => {
    const roleID = options.getArgument('role', 'role', true);
    const role = msg.guild.roles.cache.get(roleID) ?? await msg.guild.roles.fetch(roleID).catch(() => {});
    if (!role) return ['0', "Role not found"];

    if (role.position >= msg.member.roles.highest.position && msg.author.id !== msg.guild.ownerId) return ['0', "You cannot do that"];
    if (role.position >= msg.guild.members.me.roles.highest.position) return ["0", "I cannot do that"];
    if (!role.editable) return ["0", `${role.name} is not editable`];

    const name = options.getString('name', true);
    const color = options.getString('color', true);
    const secondcol = options.getString('secondcolor', true);
    const reason = options.getString('reason', true) ?? 'N/A';
    const hoist = options.getChoice('hoist', true) ? options.getChoice('hoist', true) === 'yes' : role.hoist;
    const mentionnable = options.getChoice('mention', true) ? options.getChoice('mention', true) === 'yes' : role.mentionable;

    const opts = [name, color, secondcol];

    if (!opts.filter(x => ![null, undefined].includes(x)).length) return ["0", "No modification to do"];
    
    const parsed = parseHexColor(color);
    if (!parsed && color) return ['0', "Invalid color. Try with something like #0A4bF9"];
    
    const secondParsed = parseHexColor(secondcol);
    if (!secondParsed && secondcol) return ["0", "Invalid (second) color"];
    
    const res = await role.edit({
        name: name ?? role.name,
        hoist,
        mentionable: mentionnable,
        colors: {
            primaryColor: !!color ? parsed[0] : role.colors.primaryColor,
            secondaryColor: !!secondcol ? secondParsed[0] : role.colors.secondaryColor
        },
        reason
    }).catch(() => {});

    if (!res) return ['0', 'Edit failed'];
    return [role.id, 'NEVER'];
})