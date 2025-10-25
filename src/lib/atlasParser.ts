import type { AtlasData, AtlasSprite } from '../types';

export function parseAtlas(content: string): AtlasData {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const imageName = lines[0];
    const size = parseNumberArray(lines[1]);
    const format = parseValueLine(lines[2]);
    const filter = parseStringArray(lines[3]);
    const repeat = parseValueLine(lines[4]);

    const sprites: Record<string, AtlasSprite> = {};
    let i = 5;

    while (i < lines.length) {
        const line = lines[i];

        if (!line.includes(':') && !line.startsWith(' ')) {
            const spriteName = line;

            if (i + 6 >= lines.length) {
                break;
            }

            const rotate = parseValueLine(lines[i + 1]) === 'true';
            const xy = parseNumberArray(lines[i + 2]);
            const size = parseNumberArray(lines[i + 3]);
            const orig = parseNumberArray(lines[i + 4]);
            const offset = parseNumberArray(lines[i + 5]);
            const index = parseInt(parseValueLine(lines[i + 6]));

            const finalName = index !== -1 ? `${spriteName}_${index}` : spriteName;

            sprites[finalName] = {
                rotate,
                xy: xy as [number, number],
                size: size as [number, number],
                orig: orig as [number, number],
                offset: offset as [number, number],
                index
            };

            i += 7;
        } else {
            i++;
        }
    }

    return {
        imageName,
        size: size as [number, number],
        format,
        filter: filter as [string, string],
        repeat,
        sprites
    };
}

function parseValueLine(line: string): string {
    const parts = line.split(':');
    if (parts.length < 2) {
        console.warn('Invalid line format:', line);
        return '';
    }
    return parts[1].trim();
}

function parseNumberArray(line: string): number[] {
    const parts = line.split(':');
    if (parts.length < 2) {
        console.warn('Invalid line format:', line);
        return [];
    }
    const value = parts[1].trim();
    return value.split(',').map(v => Number(v.trim()));
}

function parseStringArray(line: string): string[] {
    const parts = line.split(':');
    if (parts.length < 2) {
        console.warn('Invalid line format:', line);
        return [];
    }
    const value = parts[1].trim();
    return value.split(',').map(v => v.trim());
}