import { shellArgumentType } from "../types/command";

export const argumentTypeInterface: Record<shellArgumentType, string> = {
    channel: 'channel',
    user: 'user',
    role: 'role',
    number: 'number',
    presence: 'trigger',
    string: "text"
}