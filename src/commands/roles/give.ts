import { ShellCommand } from "../../structs/Command";
import { checkMembers } from "../../utils/checks";

export default new ShellCommand({
    name: 'giverole',
    aliases: ['giver'],
    description: "Give a role to an user",
    options: [
        {
            prefix: 'u',
            doubleDash: false,
            argument: {
                name: 'user',
                description: "User to give the role to",
                mandatory: true,
                type: 'user'
            }
        },
        {
            prefix: 'r',
            doubleDash: false,
            argument: {
                name: 'role',
                description: "Role to give to",
                mandatory: true,
                type: 'role'
            }
        },
        {
            prefix: 'reason',
            doubleDash: true,
            argument: {
                name: 'reason',
                description: "Reason of the give",
                mandatory: false,
                type: 'string'
            }
        }
    ],
    arguments: [],
    sudoRequired: false
}).run(async(opts, msg) => {
    const roleID = opts.getRole('r', false);
    const userID = opts.getUser('u', false);
    const reason = opts.getString('reason', true) ?? 'N/A';

    const member = msg.guild.members.cache.get(userID) ?? await msg.guild.members.fetch(userID).catch(() => {});
    if (!member) return ['0', 'User not found'];

    const role = msg.guild.roles.cache.get(roleID) ?? await msg.guild.roles.fetch(roleID).catch(() => {});
    if (!role) return ['0', 'Role not found'];

    const comparison = checkMembers(msg.member, member);
    if (!!comparison) return comparison as [string, string];

    if (role.position >= msg.member.roles.highest.position && msg.member.id != msg.guild.ownerId) return ['0', `${role.name} is too high for you`];
    if (role.position >= msg.guild.members.me.roles.highest.position) return ['0', `${role.name} is too high for me`];

    const res = await member.roles.add(role, reason).catch(() => {});
    if (!res) return ['0', 'Addition failed'];
    return [res.id, 'never'];
})