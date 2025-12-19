import { ShellCommand } from "../../structs/Command";

export default new ShellCommand({
    name: 'moverole',
    aliases: ['mover', 'mvrole', 'mvr'],
    description: "Moves a role",
    sudoRequired: true,
    options: [
        {
            prefix: 'a',
            doubleDash: false,
            argument: {
                name: 'amount',
                description: "Amount of the modification",
                type: 'number',
                mandatory: true
            }
        },
        {
            prefix: 'u',
            doubleDash: false,
            argument: {
                name: 'up',
                description: "Move the role up",
                type: 'presence',
                mandatory: false
            }
        },
        {
            prefix: 'd',
            doubleDash: false,
            argument: {
                name: 'down',
                description: "Move the role down",
                type: 'presence',
                mandatory: false
            }
        },
        {
            prefix: 'abs',
            doubleDash: true,
            argument: {
                name: 'absolute',
                description: "Sets the role position as absolute",
                type: 'presence',
                mandatory: false
            }
        },
        {
            prefix: 'reason',
            doubleDash: true,
            argument: {
                name: 'reason',
                description: "Reason of the move",
                type: 'string',
                mandatory: false
            }
        }
    ],
    arguments: [
        {
            name: 'role',
            description: "Role",
            type: 'role',
            mandatory: true
        }
    ]
}).run(async(opts, msg) => {
    const roleID = opts.getArgument('role', 'role', true);
    const amount = Math.abs(opts.getNumber('a', false));
    const reason = opts.getString('reason', true) ?? 'N/A';

    const role = msg.guild.roles.cache.get(roleID) ?? await msg.guild.roles.fetch(roleID).catch(() => {});
    if (!role) return ['0', 'Role not found'];
    const direction = opts.present('u', false) ? 'up' : opts.present('d', false) ? 'down' : 'abs';

    if (role.position >= msg.member.roles.highest.position && msg.author.id != msg.guild.ownerId) return ['0', "You cannot do that"];
    const newPositionVal = direction === 'abs' ? amount : role.position + amount * (direction === 'up' ? 1 : -1);
    const limit = msg.author.id === msg.guild.ownerId ? msg.guild.members.me.roles.highest.position - 1 : Math.min(msg.guild.members.me.roles.highest.position - 1, msg.member.roles.highest.position - 1);
    const newPosition = Math.max(Math.min(newPositionVal, limit), 0);

    const res = await role.setPosition(newPosition, {reason}).catch(() => {});
    if (!res) return ['0', "Move failed"];
    return [res.id, 'never'];
})