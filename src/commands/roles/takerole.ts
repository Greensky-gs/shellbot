import { ShellCommand } from "../../structs/Command";
import { checkMembers } from "../../utils/checks";

export default new ShellCommand({
    name: "takerole",
    description: "Remove a role from an user",
    aliases: ['taker', 'tkrole'],
    sudoRequired: true,
    options: [
        {
            prefix: 'u',
            doubleDash: false,
            argument: {
                name: 'user',
                description: "User from wich the role is removed",
                type: 'user',
                mandatory: true
            }
        },
        {
            prefix: 'r',
            doubleDash: false,
            argument: {
                name: 'role',
                description: "The role to remove",
                type: 'role',
                mandatory: true
            }
        },
        {
            prefix: 'reason',
            doubleDash: true,
            argument: {
                name: 'reason',
                description: "Reason for the removal",
                type: 'string',
                mandatory: false
            }
        }
    ],
    arguments: []
}).run(async(opts, msg) => {
    const roleID = opts.getRole('r', false);
    const userID = opts.getUser('u', false);
    const reason = opts.getString('reason', true) ?? 'N/A';

    const role = msg.guild.roles.cache.get(roleID) ?? await msg.guild.roles.fetch(roleID).catch(() => {});
    if (!role) return ['0', "Role not found"];

    const member = msg.guild.members.cache.get(userID) ?? await msg.guild.members.fetch(userID).catch(() => {});
    if (!member) return ['0', "Member not found"];

    if (role.position >= msg.member.roles.highest.position && msg.author.id !== msg.guild.ownerId) return ["0", "You cannot do that"];
    if (role.position >= msg.guild.members.me.roles.highest.position) return ["0", "I cannot do that"];
    const check = checkMembers(msg.member, member);
    if (!!check) return check as [string, string];

    const res = await member.roles.remove(role, reason).catch(() => {});
    if (!res) return ["0", "Remove failed"];
    return [res.id, "never"];
})