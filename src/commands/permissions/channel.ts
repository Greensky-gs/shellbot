import { GuildBasedChannel, GuildChannel, OverwriteType } from "discord.js";
import { ShellCommand } from "../../structs/Command";
import { permissionsNames } from "../../utils/interface";

export default new ShellCommand({
    name: 'channelpermission',
    aliases: ['chanpermission', 'chanperm', "chanp", "chp"],
    description: "Manage channel permissions",
    sudoRequired: true,
    options: [
        {
            prefix: 'p',
            doubleDash: false,
            argument: {
                name: 'permission',
                description: "Permission",
                type: 'string',
                mandatory: true
            }
        },
        {
            prefix: 'a',
            doubleDash: false,
            argument: {
                name: "add",
                description: "Allow the permission",
                type: "presence",
                mandatory: false
            }
        },
        {
            prefix: 'd',
            doubleDash: false,
            argument: {
                name: "deny",
                description: "Deny the permission",
                type: "presence",
                mandatory: false
            }
        },
        {
            prefix: 'u',
            doubleDash: false,
            argument: {
                name: "user",
                description: "User to manage the permission to",
                type: 'user',
                mandatory: false
            }
        },
        {
            prefix: 'r',
            doubleDash: false,
            argument: {
                name: "role",
                description: "Role to manage the permission to",
                type: 'role',
                mandatory: false
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
        },
        {
            prefix: 'l',
            doubleDash: false,
            argument: {
                name: 'list',
                description: "Show the permissions list",
                mandatory: false,
                type: 'presence'
            }
        }
    ],
    arguments: [
        {
            name: 'channel',
            description: "Channel to edit",
            type: 'channel',
            mandatory: true
        }
    ]
}).run(async(opts, msg) => {
    if (opts.present('l', false)) {
        msg.reply(`\`\`\`You can use these texts as permissions :\n${permissionsNames.res.map(x => `- ${x}`).join('\n')}\`\`\``).catch(() => {});
        return [permissionsNames.size.toString(), "never"];
    }

    const cid = opts.getArgument('channel', 'channel', true);
    const channel = (msg.guild.channels.cache.get(cid) ?? await msg.guild.channels.fetch(cid).catch(() => {})) as GuildChannel;
    if (!channel) return ['0', 'channel not found'];

    const reason = opts.getString('reason', true) ?? 'N/A';
    const uid = opts.getUser('u', false);
    const rid = opts.getRole('r', false);
    
    const permText = opts.getString('p', false);
    if (!permissionsNames.exists(permText)) return ["0", `${permText} is not a valid permission. Try using -l to get the list of all availables permissions`];

    const action = opts.present('a', false) ? 'allow' : opts.present('d', false) ? 'deny' : 'none';
    if (action === 'none') return ['0', "No action specified. Use -a or -d"];

    const role = !!rid ? (msg.guild.roles.cache.get(rid) ?? await msg.guild.roles.fetch(rid).catch(() => {})) : null;
    const member = !!uid ? (msg.guild.members.cache.get(uid) ?? await msg.guild.members.fetch(uid).catch(() => {})) : null;

    if (!(role || member)) return ['0', "No target specified. Specify user with -u and role with -r"];
    if (channel.isDMBased()) return ['0', "You are in DM (never)"];

    const permission = permissionsNames.toStart(permText);

    const results = [];
    const expectedLength: number = +!!role+ +!!member;

    if (!!role) {
        const x = channel.permissionOverwrites.cache.get(role.id)?.toJSON() ?? {};
        x[permission] = action == 'allow';
    
        if (channel.permissionOverwrites.cache.has(role.id))
            results.push(await channel.permissionOverwrites.cache.get(role.id).edit(x, reason).catch(() => {}));
        else results.push(await channel.permissionOverwrites.create(role, x, {
            reason,
            type: OverwriteType.Role
        }).catch(() => {}));
    }
    if (!!member) {
        const x = channel.permissionOverwrites.cache.get(member.id)?.toJSON() ?? {};
        x[permission] = action == 'allow';
    
        if (channel.permissionOverwrites.cache.has(member.id))
            results.push(await channel.permissionOverwrites.cache.get(member.id).edit(x, reason).catch(() => {}));
        else results.push(await channel.permissionOverwrites.create(member, x, {
            reason,
            type: OverwriteType.Member
        }).catch(() => {}));
    }
    if (results.filter(x=>!!x).length != expectedLength) return ['0', "Something wrent wrong"];
    return [channel.id, "never"];
})