import { ShellCommand } from "../structs/Command";

export default new ShellCommand({
    name: 'ping',
    sudoRequired: false,
    aliases: [],
    options: []
}).run(async(options, msg) => {
    const res = await msg.reply(`pong !`).catch(() => {});
    if (!res) return;
    
    const time = Date.now() - res.createdTimestamp;

    res.edit(`pong ! *${time}ms*`)
})
