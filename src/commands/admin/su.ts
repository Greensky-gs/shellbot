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
    ]
}).run(async(options, message) => {
    if (message.author.id !== message.guild.ownerId) return message.reply(`\`\`\`Need to be owner\`\`\``).catch(() => {});

    const action = options.present('a', false) ? 'add' : options.present('r', false) ? 'remove' : options.present('l', false) ? 'list' : 'none';

    if (action == 'none') return message.reply(`\`\`\`No action specified\nusage:\n    sudo sus -a --user @user : add user as super user\n    sudo sus -r --user @user : removes @user from super users\n    sudo sus -l : display the list of super users\`\`\``).catch(() => {});

    const list = SuperUsers.exists(`sus.${message.guild.id}`) ? (SuperUsers.getValue(`sus.${message.guild.id}`, 'array') as string[]) : [];
    if (action == 'list') {
        if (!list.length) return message.reply("```Empty list```").catch(() => {});

        message.reply({
            content: list.map(x => `- <@${x}>`).join('\n'),
            allowedMentions: {}
        }).catch(() => {});
        return;
    }

    const uid = options.getArgument('user', 'user', false);
    if (!uid) return message.reply(`\`\`\`No user specified.\nTry using mention\`\`\``).catch(() => {});

    const member = await message.guild.members.fetch(uid);
    if (!member) return message.reply(`\`\`\`User not found.\`\`\``).catch(() => {});

    if (action == 'add') {
        if (list.includes(uid)) return message.reply("```User already super user```").catch(() => {});
        list.push(uid);

        SuperUsers.writeValue(`sus.${message.guild.id}`, 'array', list);

        return message.reply({
            content: `<@${uid}> has been added as super user`,
            allowedMentions: {}
        }).catch(() => {});
    }
    if (action === 'remove') {
        if (!list.includes(uid)) return message.reply("```User is not a super user```").catch(() => {});
        SuperUsers.writeValue(`sus.${message.guild.id}`, 'array', list.filter(x => x != uid));

        return message.reply({
            content: `<@${uid}> has been removed from super users`,
            allowedMentions: {}
        }).catch(() => {});
    }
})