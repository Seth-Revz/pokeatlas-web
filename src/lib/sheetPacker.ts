import type { ExtractedSprite } from '../types';

export interface PackResult {
    x: number;
    y: number;
    newWidth: number;
    newHeight: number;
    expanded: boolean;
}

export function findFreeSpace(
    sprites: ExtractedSprite[],
    newWidth: number,
    newHeight: number,
    sheetWidth: number,
    sheetHeight: number
): PackResult | null {
    if (newWidth > sheetWidth || newHeight > sheetHeight) {
        return expandAndFindSpace(sprites, newWidth, newHeight, sheetWidth, sheetHeight);
    }

    const position = scanForFreeSpace(sprites, newWidth, newHeight, sheetWidth, sheetHeight);
    
    if (position) {
        return {
            x: position.x,
            y: position.y,
            newWidth: sheetWidth,
            newHeight: sheetHeight,
            expanded: false
        };
    }

    return expandAndFindSpace(sprites, newWidth, newHeight, sheetWidth, sheetHeight);
}

function scanForFreeSpace(
    sprites: ExtractedSprite[],
    newWidth: number,
    newHeight: number,
    sheetWidth: number,
    sheetHeight: number
): { x: number; y: number } | null {
    const step = Math.max(1, Math.min(newWidth, newHeight));

    for (let y = 0; y <= sheetHeight - newHeight; y += step) {
        for (let x = 0; x <= sheetWidth - newWidth; x += step) {
            if (!checkOverlap(sprites, x, y, newWidth, newHeight)) {
                return { x, y };
            }
        }
    }

    return null;
}

function expandAndFindSpace(
    sprites: ExtractedSprite[],
    newWidth: number,
    newHeight: number,
    sheetWidth: number,
    sheetHeight: number
): PackResult | null {
    const maxAttempts = 5;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const newW = nextPowerOfTwo(sheetWidth * Math.pow(2, attempt + 1));
        const newH = nextPowerOfTwo(sheetHeight * Math.pow(2, attempt + 1));
        
        if (newW > 4096 || newH > 4096) {
            continue;
        }

        const position = scanForFreeSpace(sprites, newWidth, newHeight, newW, newH);
        
        if (position) {
            return {
                x: position.x,
                y: position.y,
                newWidth: newW,
                newHeight: newH,
                expanded: true
            };
        }
    }

    return null;
}

function nextPowerOfTwo(n: number): number {
    return Math.pow(2, Math.ceil(Math.log2(n)));
}

export function checkOverlap(
    sprites: ExtractedSprite[],
    x: number,
    y: number,
    width: number,
    height: number
): boolean {
    for (const sprite of sprites) {
        if (rectsOverlap(x, y, width, height, sprite.x, sprite.y, sprite.width, sprite.height)) {
            return true;
        }
    }
    return false;
}

function rectsOverlap(
    x1: number,
    y1: number,
    w1: number,
    h1: number,
    x2: number,
    y2: number,
    w2: number,
    h2: number
): boolean {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

export function validateSpriteName(name: string, existingSprites: ExtractedSprite[]): string | null {
    if (!name || name.trim().length === 0) {
        return 'Sprite name cannot be empty';
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
        return 'Name can only contain letters, numbers, hyphens, and underscores';
    }

    if (existingSprites.some(s => s.name === name)) {
        return `Sprite "${name}" already exists in the atlas`;
    }

    return null;
}

export function calculateRequiredSize(
    sprites: ExtractedSprite[],
    currentSize: [number, number]
): [number, number] {
    const hasNewSprites = sprites.some(s => s.isNew);
    
    if (!hasNewSprites) {
        return currentSize;
    }

    let maxWidth = currentSize[0];
    let maxHeight = currentSize[1];

    for (const sprite of sprites) {
        if (sprite.isNew) {
            maxWidth = Math.max(maxWidth, sprite.x + sprite.width);
            maxHeight = Math.max(maxHeight, sprite.y + sprite.height);
        }
    }

    return [nextPowerOfTwo(maxWidth), nextPowerOfTwo(maxHeight)];
}
