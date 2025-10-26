import type { AtlasData, ExtractedSprite } from '../types';
import UPNG from 'upng-js';

export function extractSprites(
    image: HTMLImageElement,
    atlasData: AtlasData
): ExtractedSprite[] {
    const sprites: ExtractedSprite[] = [];

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = image.width;
    sourceCanvas.height = image.height;
    const sourceCtx = sourceCanvas.getContext('2d', { alpha: true });
    if (!sourceCtx) return sprites;
    sourceCtx.drawImage(image, 0, 0);

    const sheetImageData = sourceCtx.getImageData(0, 0, image.width, image.height);
    const sheetData = sheetImageData.data;

    for (const [name, data] of Object.entries(atlasData.sprites)) {
        const [x, y] = data.xy;
        const [w, h] = data.size;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { alpha: true });

        if (!ctx) continue;

        const spriteImageData = ctx.createImageData(w, h);
        const dst = spriteImageData.data;

        for (let row = 0; row < h; row++) {
            const srcRow = (y + row) * image.width;
            const dstRow = row * w;

            for (let col = 0; col < w; col++) {
                const srcIdx = (srcRow + (x + col)) * 4;
                const dstIdx = (dstRow + col) * 4;

                dst[dstIdx] = sheetData[srcIdx];
                dst[dstIdx + 1] = sheetData[srcIdx + 1];
                dst[dstIdx + 2] = sheetData[srcIdx + 2];
                dst[dstIdx + 3] = sheetData[srcIdx + 3];
            }
        }

        ctx.putImageData(spriteImageData, 0, 0);

        let finalCanvas = canvas;
        let finalImageData = spriteImageData;

        const rgbaBuf = finalImageData.data.buffer;
        const pngArrayBuffer = UPNG.encode([rgbaBuf], finalCanvas.width, finalCanvas.height, 0);
        const blob = new Blob([pngArrayBuffer], { type: 'image/png' });
        const dataUrl = URL.createObjectURL(blob);

        sprites.push({
            name,
            canvas: finalCanvas,
            dataUrl,
            originalData: data,
            x,
            y,
            width: w,
            height: h,
            index: data.index,
            isModified: false
        });
    }

    sprites.sort((a, b) => {
        if (a.name === b.name) return a.index - b.index;
        return a.name.localeCompare(b.name);
    });

    return sprites;
}