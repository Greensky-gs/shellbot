import { GuildMember } from "discord.js";

export const checkMembers = (mod: GuildMember, onto: GuildMember) => {
    if (onto.id === onto.guild.ownerId) return ['0', `${onto.user.username} is the owner`];
    if (onto.roles.highest.position >= mod.roles.highest.position) return ['0', `${onto.user.username} is higher or equal to ${mod.user.username}`];
    if (onto.roles.highest.position >= mod.guild.members.me.roles.highest.position) return ['0', `${onto.user.username} is higher or equal to me`];
    return false;
}