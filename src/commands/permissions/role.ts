import { ShellCommand } from "../../structs/Command";
import { permissionsNames } from "../../utils/interface";

export default new ShellCommand({
    name: "rolepermission",
    aliases: ['roleperm', 'rp'],
    description: "Manage permissions of a role",
    options: [
        {
            prefix: 'p',
            doubleDash: false,
            argument: {
                name: 'permission',
                description: "Permission to manage",
                type: 'string',
                mandatory: true
            }
        },
        {
            prefix: 'l',
            doubleDash: false,
            argument: {
                name: 'list',
                description: "List all available permissions",
                type: "presence",
                mandatory: false
            }
        },
        {
            prefix: 'a',
            doubleDash: false,
            argument: {
                name: "allow",
                description: "Allow the permission for the role",
                mandatory: false,
                type: 'presence'
            }
        },
        {
            prefix: 'd',
            doubleDash: false,
            argument: {
                name: "deny",
                description: "Deny the permission for the role",
                mandatory: false,
                type: 'presence'
            }
        },
        {
            prefix: 'reason',
            doubleDash: true,
            argument: {
                name: "reason",
                description: "Reason of the edit",
                mandatory: false,
                type: 'string'
            }
        }
    ],
    arguments: [
        {
            name: 'role',
            description: "Role to manage",
            type: 'role',
            mandatory: true
        }
    ],
    sudoRequired: true
}).run(async(opts,msg) => {
    if (opts.present('l', false)) {
        msg.reply(`\`\`\`Here are all the available permissions :\n${Object.values(permissionsNames.res).map(x => `- ${x}`).join('\n')}\`\`\``).catch(() => {});
        return [permissionsNames.size.toString(), "never"]
    }

    const rid = opts.getArgument('role', 'role', true);
    const role = msg.guild.roles.cache.get(rid) ?? await msg.guild.roles.fetch(rid).catch(() => {});
    const reason = opts.getString('reason', true) ?? 'N/A';
    if (!role) return ['0', "Role not found"];

    if (role.position >= msg.member.roles.highest.position && msg.author.id != msg.guild.ownerId) return ["0", "You cannot do that"];
    if (role.position >= msg.guild.members.me.roles.highest.position) return ["0", "I cannot do that"];

    const pT = opts.getString('p', false);
    if (!permissionsNames.exists(pT)) return ["0", "Invalid permission. Try using -l to see all the available permissions"];

    const action = opts.present('a', false) ? 'add' : opts.present('d', false) ? 'remove' : 'none';
    if (action === 'none') return ["0", "No action specified. Use either -a or -d"];

    const p = permissionsNames.toStart(pT);
    const res = await role.setPermissions(role.permissions[action](p), reason).catch(() => {});

    if (!res) return ["0", "Something wrent wrong"];
    return [role.id, "never"];
})