import { ShellCommand } from "../structs/Command";

export default new ShellCommand({
    name: 'ping',
    sudoRequired: false,
    aliases: [],
    options: [
        {
            doubleDash: false,
            prefix: 'user',
            argument: {
                description: "a random text",
                name: 'ze text',
                mandatory: false,
                type: 'user'
            }
        },
        {
            doubleDash: false,
            prefix: 'channel',
            argument: {
                description: "a random  text",
                name: 'ze text',
                mandatory: false,
                type: 'channel'
            }
        },
        {
            doubleDash: true,
            prefix: 'role',
            argument: {
                description: "a random text",
                name: 'ze text',
                mandatory: false,
                type: 'role'
            }
        },
        {
            doubleDash: false,
            prefix: 'txt',
            argument: {
                description: "un texte",
                name: "le texte",
                mandatory: false,
                type: 'string'
            }
        }
    ]
}).run(async(options, msg) => {
    const res = await msg.reply(`pong !`).catch(() => {});
    if (!res) return;
    
    const time = Date.now() - res.createdTimestamp;

    res.edit(`pong ! *${time}ms*`)
})
