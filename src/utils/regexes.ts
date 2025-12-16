export const parseMentionnable = (content: string) => {
    const regex = /<(?<type>@&|#|@)(?<id>\d+)>/g;
    const res = regex.exec(content);

    if (!res) return null;
    return [res.groups.id, {'@': 'user', '#': 'channel', '@&': 'role'}[res.groups.type]];
}