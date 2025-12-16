import { ColorCodes, ColorFonts } from "../types/utils";

export const chalk = (str: string, color: ColorCodes, font: ColorFonts = ColorFonts.Dark) => `\x1b[${font}${color}m${str}\x1b[0m`