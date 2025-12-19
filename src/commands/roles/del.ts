import { GuildTextBasedChannel, Role } from "discord.js";
import { ShellCommand } from "../../structs/Command";
import { confirmation } from "../../utils/interface";

export default new ShellCommand({
    name: "deleterole",
    aliases: ['delrole', 'delr', 'rmrole'],
    description: "Deletes a role from the server",
    sudoRequired: true,
    options: [
        {
            prefix: 'confirm',
            doubleDash: true,
            argument: {
                name: "confirmation",
                description: "Skips confirmation",
                type: 'presence',
                mandatory: false
            }
        },
        {
            prefix: "reason",
            doubleDash: true,
            argument: {
                name: "reason",
                description: "Reason of the deletion",
                type: 'string',
                mandatory: false
            }
        }
    ],
    arguments: [
        {
            name: 'role',
            description: "Role to delete",
            type: 'role',
            mandatory: true
        }
    ]
}).run(async(options, msg) => {
    const roleID = options.getArgument('role', 'role', true);
    const skipConfirm = options.present('confirm', true);
    const reason = options.getString('reason', true) ?? 'N/A';

    const role = msg.guild.roles.cache.get(roleID) ?? await msg.guild.roles.fetch(roleID).catch(() => {}) as Role;
    if (!role) return ['0', "Role not found"];

    if (role.position >= msg.member.roles.highest.position && msg.author.id !== msg.guild.ownerId) return ['0', "You cannot do that"];
    if (role.position >= msg.guild.members.me.roles.highest.position) return ['0', "I cannot do that"];
    
    if (!skipConfirm) {
        await msg.reply({
            content: `Are you sure to delete role <@&${role.id}> ?\n\nTypes \`yes\` in the chat to confirm`
        }).catch(() => {});
        const confirm = await confirmation({
            channel: msg.channel as GuildTextBasedChannel,
            guild: msg.guild.id,
            userId: msg.author.id,
            message: msg
        }).catch(() => {});
        if (!confirm || !confirm.result) return ['0', 'Canceled']
    }

    const attempt = await role.delete(reason).catch(() => {});
    if (!attempt) return ['0', 'deletion failed'];
    return [role.id, "never"];
})