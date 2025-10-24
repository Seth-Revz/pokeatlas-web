export interface AtlasSprite {
    rotate: boolean;
    xy: [number, number];
    size: [number, number];
    orig: [number, number];
    offset: [number, number];
    index: number;
}

export interface AtlasData {
    imageName: string;
    size: [number, number];
    format: string;
    filter: [string, string];
    repeat: string;
    sprites: Record<string, AtlasSprite>;
}

export interface ExtractedSprite {
    name: string;
    canvas: HTMLCanvasElement;
    dataUrl: string;
    originalData: AtlasSprite;
    x: number;
    y: number;
    width: number;
    height: number;
    index: number;
}