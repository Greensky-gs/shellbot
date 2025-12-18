import { SuperUsers } from "../../cache/databases";
import { ShellCommand } from "../../structs/Command";

export default new ShellCommand({
    name: 'superusers',
    aliases: ['sus'],
    sudoRequired: true,
    options: [
        {
            doubleDash: false,
            argument: {
                name: 'add',
                description: "Add superuser",
                mandatory: false,
                type: 'presence'
            },
            prefix: 'a'
        },
        {
            doubleDash: false,
            argument: {
                name: 'remove',
                description: "Remove superuser",
                mandatory: false,
                type: 'presence'
            },
            prefix: 'r'
        },
        {
            doubleDash: false,
            argument: {
                name: 'list',
                description: "List super users",
                mandatory: false,
                type: 'presence'
            },
            prefix: 'l'
        }
    ],
    arguments: [
        {
            name: 'user',
            description: "User to manage",
            type: 'user',
            mandatory: false
        }
    ],
    description: "Manage super users"
}).run(async(options, message) => {
    if (message.author.id !== message.guild.ownerId) return ['0', "Command accessible only by the owner."];

    const action = options.present('a', false) ? 'add' : options.present('r', false) ? 'remove' : options.present('l', false) ? 'list' : 'none';

    if (action == 'none') {
        message.reply(`\`\`\`No action specified\nusage:\n    sudo sus -a --user @user : add user as super user\n    sudo sus -r --user @user : removes @user from super users\n    sudo sus -l : display the list of super users\`\`\``).catch(() => {});
        return ['1', 'never']
    };

    const list = SuperUsers.exists(`sus.${message.guild.id}`) ? (SuperUsers.getValue(`sus.${message.guild.id}`, 'array') as string[]) : [];
    if (action == 'list') {
        if (!list.length) {
            message.reply("Empty list").catch(() => {})
            return ['1', 'never']
        };

        message.reply({
            content: list.map(x => `- <@${x}>`).join('\n'),
            allowedMentions: {}
        }).catch(() => {});
        return [list.length.toString(), 'never'];
    }

    const uid = options.getArgument('user', 'user', false);
    if (!uid) return ['0', `No user specified.\nTry using mention`];

    const member = await message.guild.members.fetch(uid);
    if (!member) return ['0', `User not found.`];

    if (action == 'add') {
        if (list.includes(uid)) return ['0', "User already super user"];
        list.push(uid);

        SuperUsers.writeValue(`sus.${message.guild.id}`, 'array', list);

        message.reply({
            content: `<@${uid}> has been added as super user`,
            allowedMentions: {}
        }).catch(() => {});
        return [uid, 'never']
    }
    if (action === 'remove') {
        if (!list.includes(uid)) return ['0', "User is not a super user"]
        SuperUsers.writeValue(`sus.${message.guild.id}`, 'array', list.filter(x => x != uid));

        message.reply({
            content: `<@${uid}> has been removed from super users`,
            allowedMentions: {}
        }).catch(() => {});
        return [uid,'never']
    }
    return ['0', "something that shouldn't happen"];
})