import { ShellCommand } from "../../structs/Command";
import { ms } from "../../utils/parsers";

export default new ShellCommand({
    name: "invitelink",
    description: "Manage invite links",
    aliases: ['invites', 'inv'],
    sudoRequired: false,
    options: [
        {
            prefix: 'view',
            doubleDash:  true,
            argument: {
                name: "view",
                description: "View an invitation",
                mandatory: false,
                type: "presence"
            }
        },
        {
            prefix: 'delete',
            doubleDash: true,
            argument: {
                name: "delete",
                description: "Delete the invitation link",
                mandatory: false,
                type: "presence"
            }
        },
        {
            prefix: 'create',
            doubleDash: true,
            argument: {
                name: "create",
                description: "Creates an invite link",
                mandatory: false,
                type: "presence"
            }
        },
        {
            prefix: 'max-uses',
            doubleDash: true,
            argument: {
                name: "max-uses",
                description: "Max usage",
                mandatory: false,
                type: "number"
            }
        },
        {
            prefix: 'max-age',
            doubleDash: true,
            argument: {
                name: "max-age",
                description: "Duration of the invitation",
                mandatory: false,
                type: "string"
            }
        },
        {
            prefix: 'c',
            doubleDash: false,
            argument: {
                name: "channel",
                description: "Channel where the link sends",
                mandatory: false,
                type: "channel"
            }
        },
        {
            prefix: 'i',
            doubleDash: false,
            argument: {
                name: "invitation",
                description: "Link of the invitation",
                mandatory: false,
                type: "string"
            }
        },
        {
            prefix: 'reason',
            doubleDash: true,
            argument: {
                name: "reason",
                description: "Reason for the action",
                mandatory: false,
                type: "string"
            }
        }
    ],
    arguments: []
}).run(async(opts, msg) => {
    const action = opts.present('view', true) ? 'view' : opts.present('delete', true) ? 'delete' : opts.present('create', true) ? 'create' : 'none';
    const link = opts.getString('i', false);
    const reason = opts.getString('reason', true) ?? 'N/A';

    if (action === 'view') {
        const invite = msg.guild.invites.cache.get(link) ?? await msg.guild.invites.fetch(link).catch(() => {});
        if (!invite) return ["0", "Invitation not found"];

        msg.reply({
            content: `\`\`\`Link: ${invite.url}\n    Into: ${invite?.channel?.name ?? "N/A"} (${invite.channelId})\n    Inviter: ${invite.inviter?.username} ( ${invite.inviterId} )\n    Uses: ${invite.uses}/${invite.maxUses === 0 ? 'infinite' : invite.maxUses}\n    Expires: ${invite.expiresTimestamp ? invite.expiresAt.toUTCString() : 'infinite'}\`\`\``
        }).catch(() => {});
        return [invite.code, "0"];
    }
    if (action === 'delete') {
        const invite = msg.guild.invites.cache.get(link) ?? await msg.guild.invites.fetch(link).catch(() => {});
        if (!invite) return ["0", "Invitation not found"];

        if (!invite.deletable) return ["0", "Invitation not deleteable"];
        const res = await invite.delete(reason).catch(() => {});

        if (!res) return ["0", "Something wrent wrong"];
        return [res.code, "never"];
    }
    if (action === 'create') {
        const maxUses = Math.max(1, opts.getNumber('max-uses', true) ?? 1);
        const maxAgeStr = opts.getString('max-age', true) ?? '0s';
        const maxAge = ms(maxAgeStr) / 1000;
        
        const cid = opts.getString('c', false);
        const chan = !!cid ? msg.guild.channels.cache.get(cid) ?? await msg.guild.channels.fetch(cid).catch(() => {}) : null;
        if (cid && !chan) return ['0', "Channel not found"]

        const invite = await msg.guild.invites.create((!!chan ? chan : msg.channel).id, {
            maxUses,
            maxAge,
            reason,
        }).catch(() => {});

        if (!invite) return ["0", "Something wrent wrong"];
        return [invite.url, "never"];
    }

    return ["0", "never"];
})