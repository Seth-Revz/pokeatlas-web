import type { AtlasData, ExtractedSprite } from '../types';

export function extractSprites(
    image: HTMLImageElement,
    atlasData: AtlasData
): ExtractedSprite[] {
    const sprites: ExtractedSprite[] = [];

    for (const [name, data] of Object.entries(atlasData.sprites)) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        const [x, y] = data.xy;
        const [w, h] = data.size;

        if (data.rotate) {
            canvas.width = h;
            canvas.height = w;
            ctx.translate(h / 2, w / 2);
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(image, x, y, w, h, -w / 2, -h / 2, w, h);
        } else {
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(image, x, y, w, h, 0, 0, w, h);
        }

        sprites.push({
            name,
            canvas,
            dataUrl: canvas.toDataURL('image/png'),
            originalData: data,
            x,
            y,
            width: w,
            height: h,
            index: data.index
        });
    }

    sprites.sort((a, b) => {
        if (a.name === b.name) return a.index - b.index;
        return a.name.localeCompare(b.name);
    });

    return sprites;
}