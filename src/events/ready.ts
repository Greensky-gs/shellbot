import { ShellEvent } from "../structs/events";
import { ColorCodes, ColorFonts } from "../types/utils";
import { chalk } from "../utils/chalk";
import { print } from "../utils/print";

export default new ShellEvent('clientReady', false, (client) => {
    print(`Logged in as ${chalk(client.user.tag, ColorCodes.Yellow)}`, ColorCodes.Cyan, ColorFonts.Light);
})