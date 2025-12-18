import { ShellCommand } from "../../structs/Command";

export default new ShellCommand({
    name: 'ping',
    sudoRequired: false,
    aliases: [],
    options: [],
    arguments: [],
    description: "Ping the shell"
}).run(async(options, msg) => {
    const res = await msg.reply(`pong !`).catch(() => {});
    if (!res) return ['0', ' fail'];
    
    const time = Date.now() - res.createdTimestamp;

    res.edit(`pong ! *${time}ms*`).catch(() => {});
    return [Math.abs(time).toString(), 'pong'];
})
