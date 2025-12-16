import { ColorCodes, ColorFonts } from "../types/utils";
import { chalk } from "./chalk"

const pad = (int: number) => int.toString().padStart(2, '0');
const formatDate = (date: Date) => `${pad(date.getDate())}/${pad(date.getMonth())}/${date.getFullYear()}-${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

export const print = (...args: Parameters<typeof chalk>) => {
    const date = new Date();
    console.log(`${chalk(`[${formatDate(date)}]`, ColorCodes.Purple, ColorFonts.Light)} | ${chalk(...args)}`);
}