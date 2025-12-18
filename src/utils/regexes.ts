export const parseMentionnable = (content: string) => {
    const regex = /<(?<type>@&|#|@)(?<id>\d+)>/g;
    const res = regex.exec(content);

    if (!res) return null;
    return [res.groups.id, {'@': 'user', '#': 'channel', '@&': 'role'}[res.groups.type]];
}
export const parseHexColor = (content: string): null | [`#${string}`, number] => {
    const regex =  /#?(?<pattern>([0-9A-F]{3}){1,2})/i;
    const res = regex.exec(content);

    if (!res) return null;
    const pattern = ((pat: string) => pat.length === 3 ? pat.concat(pat) : pat)(res.groups.pattern);
    return [`#${pattern}`, parseInt(pattern, 16)];
}