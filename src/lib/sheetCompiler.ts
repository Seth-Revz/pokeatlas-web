import type { AtlasData, ExtractedSprite } from '../types';

export function compileSheet(
    sprites: ExtractedSprite[],
    originalAtlas: AtlasData
): { canvas: HTMLCanvasElement; atlasText: string } {
    const [sheetWidth, sheetHeight] = originalAtlas.size;

    const canvas = document.createElement('canvas');
    canvas.width = sheetWidth;
    canvas.height = sheetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.clearRect(0, 0, sheetWidth, sheetHeight);

    const locationKey = (sprite: ExtractedSprite) =>
        `${sprite.x},${sprite.y},${sprite.width},${sprite.height}`;

    const spritesByLocation = new Map<string, ExtractedSprite[]>();

    for (const sprite of sprites) {
        const key = locationKey(sprite);
        if (!spritesByLocation.has(key)) {
            spritesByLocation.set(key, []);
        }
        spritesByLocation.get(key)!.push(sprite);
    }

    for (const [_, spritesAtLocation] of spritesByLocation) {
        const sorted = [...spritesAtLocation].sort((a, b) =>
            (a.isModified ? 1 : 0) - (b.isModified ? 1 : 0)
        );

        for (const sprite of sorted) {
            const { originalData } = sprite;

            if (originalData.rotate) {
                ctx.save();
                ctx.translate(sprite.x + sprite.width / 2, sprite.y + sprite.height / 2);
                ctx.rotate(-Math.PI / 2);
                ctx.drawImage(sprite.canvas, -sprite.canvas.width / 2, -sprite.canvas.height / 2);
                ctx.restore();
            } else {
                ctx.drawImage(sprite.canvas, sprite.x, sprite.y);
            }
        }
    }

    const atlasText = generateAtlasText(originalAtlas);

    return { canvas, atlasText };
}

function generateAtlasText(atlas: AtlasData): string {
    let text = `${atlas.imageName}\n`;
    text += `size: ${atlas.size[0]}, ${atlas.size[1]}\n`;
    text += `format: ${atlas.format}\n`;
    text += `filter: ${atlas.filter[0]}, ${atlas.filter[1]}\n`;
    text += `repeat: ${atlas.repeat}\n`;

    for (const [name, data] of Object.entries(atlas.sprites)) {
        const originalName = name.endsWith(`_${data.index}`)
            ? name.slice(0, -(`_${data.index}`.length))
            : name;

        text += `${originalName}\n`;
        text += `  rotate: ${data.rotate}\n`;
        text += `  xy: ${data.xy[0]}, ${data.xy[1]}\n`;
        text += `  size: ${data.size[0]}, ${data.size[1]}\n`;
        text += `  orig: ${data.orig[0]}, ${data.orig[1]}\n`;
        text += `  offset: ${data.offset[0]}, ${data.offset[1]}\n`;
        text += `  index: ${data.index}\n`;
    }

    return text;
}