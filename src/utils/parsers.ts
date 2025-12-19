export const parseCommands = (input: string): string[] => {
    const splitters = '&|';
    let i = 0;
    const splittersIndex = [];
    let inText = false;
    let backslashed = false;
    let atted = false;

    while (i < input.length) {
        if (input[i] === '\\') {
            backslashed = true;
            i++;
            continue;
        }
        if (input[i] === '@') {
            if (backslashed) backslashed = false;
            atted = true;
            i++;
            continue;
        }
        if (input[i] === '"' && !backslashed) {
            inText = !inText;
        }
        if (splitters.includes(input[i]) && !inText && !atted) {
            splittersIndex.push(i);
        }

        if (backslashed) backslashed = false;
        if (atted) atted = false;
        i++;
    }

    if (!splittersIndex.length) return [input];
    return splittersIndex.map((x, i, a) => ([ i > 0 ? "" : input.slice((i == 0 ? 0 : a[i - 1] + 1), x), input[x], input.slice(x + 1, (i === a.length - 1) ? input.length  : a[i + 1]) ])).flat().filter(x => x.length);
}