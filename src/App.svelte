<script lang="ts">
    import type { AtlasData, ExtractedSprite } from "./types";
    import { parseAtlas } from "./lib/atlasParser";
    import { extractSprites } from "./lib/spriteExtractor";
    import { compileSheet } from "./lib/sheetCompiler";
    import FileUploader from "./components/FileUploader.svelte";
    import SpriteList from "./components/SpriteList.svelte";
    import SpritePreview from "./components/SpritePreview.svelte";
    import ThemeSwitcher from "./components/ThemeSwitcher.svelte";
    import backgroundUrl from "./assets/background.webm";
    import JSZip from "jszip";

    let atlasFile = $state<File | null>(null);
    let spritesheetFile = $state<File | null>(null);
    let atlasData = $state<AtlasData | null>(null);
    let sprites = $state<ExtractedSprite[]>([]);
    let spritesheetImage = $state<HTMLImageElement | null>(null);
    let selectedSprite = $state<ExtractedSprite | null>(null);
    let isProcessing = $state(false);
    let darkMode = $state(false);
    // svelte-ignore non_reactive_update
    let massReplaceInput: HTMLInputElement;

    const bothFilesUploaded = $derived(
        atlasFile !== null && spritesheetFile !== null,
    );

    $effect(() => {
        const saved = localStorage.getItem("darkMode");
        darkMode = saved === "true";
        updateTheme(darkMode);
    });

    function toggleDarkMode() {
        darkMode = !darkMode;
        localStorage.setItem("darkMode", String(darkMode));
        updateTheme(darkMode);
    }

    function updateTheme(isDark: boolean) {
        if (isDark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }

    async function handleAtlasUpload(file: File) {
        atlasFile = file;
        const text = await file.text();
        atlasData = parseAtlas(text);

        if (spritesheetImage && atlasData) {
            sprites = extractSprites(spritesheetImage, atlasData);
            selectedSprite = null;
        }
    }

    async function handleSpritesheetUpload(file: File) {
        spritesheetFile = file;

        const img = new Image();
        img.src = URL.createObjectURL(file);
        await img.decode();
        spritesheetImage = img;

        if (atlasData && spritesheetImage) {
            sprites = extractSprites(spritesheetImage, atlasData);
            selectedSprite = null;
        }
    }

    async function handleSpriteReplace(file: File) {
        if (!selectedSprite) return;

        const img = new Image();
        img.src = URL.createObjectURL(file);
        await img.decode();

        const dimensionsMatch =
            img.width === selectedSprite.width &&
            img.height === selectedSprite.height;

        if (!dimensionsMatch) {
            return;
        }

        selectedSprite.canvas.width = img.width;
        selectedSprite.canvas.height = img.height;
        const ctx = selectedSprite.canvas.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, img.width, img.height);
            ctx.drawImage(img, 0, 0);
            selectedSprite.dataUrl =
                selectedSprite.canvas.toDataURL("image/png");
            selectedSprite.isModified = true;
        }

        sprites = [...sprites];
    }

    async function handleMassReplace(event: Event) {
        const target = event.target as HTMLInputElement;
        const files = target.files;
        if (!files || files.length === 0) return;

        let replacedCount = 0;

        for (const file of Array.from(files)) {
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");

            const matchingSprite = sprites.find(
                (s) => s.name === nameWithoutExt,
            );

            if (matchingSprite) {
                const img = new Image();
                img.src = URL.createObjectURL(file);
                await img.decode();

                const dimensionsMatch =
                    img.width === matchingSprite.width &&
                    img.height === matchingSprite.height;

                if (!dimensionsMatch) {
                    return;
                }

                matchingSprite.canvas.width = img.width;
                matchingSprite.canvas.height = img.height;
                const ctx = matchingSprite.canvas.getContext("2d");
                if (ctx) {
                    ctx.clearRect(0, 0, img.width, img.height);
                    ctx.drawImage(img, 0, 0);
                    matchingSprite.dataUrl =
                        matchingSprite.canvas.toDataURL("image/png");
                    matchingSprite.isModified = true;
                }
                replacedCount++;
                URL.revokeObjectURL(img.src);
            }
        }

        sprites = [...sprites];
        alert(`Replaced ${replacedCount} sprite(s)`);

        target.value = "";
    }

    function downloadSprite(sprite: ExtractedSprite) {
        const link = document.createElement("a");
        link.download = `${sprite.name}.png`;
        link.href = sprite.dataUrl;
        link.click();
    }

    async function downloadAllSprites() {
        const zip = new JSZip();

        sprites.forEach((sprite) => {
            const base64Data = sprite.dataUrl.split(",")[1];
            zip.file(`${sprite.name}.png`, base64Data, { base64: true });
        });

        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sprites.zip";
        a.click();
        URL.revokeObjectURL(url);
    }

    async function recompileAndDownload() {
        if (!atlasData || !spritesheetImage) return;

        isProcessing = true;

        try {
            const { canvas, atlasText } = compileSheet(sprites, atlasData);

            canvas.toBlob((blob) => {
                if (!blob) return;
                const link = document.createElement("a");
                link.download = atlasData!.imageName;
                link.href = URL.createObjectURL(blob);
                link.click();
            });

            const atlasBlob = new Blob([atlasText], {
                type: "text/plain",
            });
            const link = document.createElement("a");
            link.download = "main.atlas";
            link.href = URL.createObjectURL(atlasBlob);
            link.click();
        } finally {
            isProcessing = false;
        }
    }

    function reset() {
        atlasFile = null;
        spritesheetFile = null;
        atlasData = null;
        sprites = [];
        spritesheetImage = null;
        selectedSprite = null;
    }

    function selectSprite(sprite: ExtractedSprite | null) {
        selectedSprite = sprite;
    }
</script>

<div class="app">
    {#if !bothFilesUploaded}
        <div class="background">
            <video
                disablePictureInPicture
                disableRemotePlayback
                controlsList="nodownload nofullscreen noremoteplayback"
                oncontextmenu={(e) => e.preventDefault()}
                autoplay
                loop
                muted
                playsinline
            >
                <source src={backgroundUrl} type="video/webm" />
            </video>
            <div class="upload-container">
                <div class="branding">
                    <h1>PokeAtlas</h1>
                    <p>
                        Upload an atlas file and spritesheet to extract, edit,
                        and recompile sprites
                    </p>
                </div>

                <div class="upload-section">
                    <FileUploader
                        label="Atlas File (.atlas)"
                        accept=".atlas"
                        onUpload={handleAtlasUpload}
                        currentFile={atlasFile?.name}
                    />

                    <FileUploader
                        label="Spritesheet Image (.png)"
                        accept="image/*"
                        onUpload={handleSpritesheetUpload}
                        currentFile={spritesheetFile?.name}
                    />
                </div>
            </div>
        </div>
    {:else}
        <div class="toolbar">
            <button onclick={reset} class="btn btn-danger"> Back </button>

            <button
                onclick={() => massReplaceInput?.click()}
                class="btn btn-primary"
            >
                Mass Replace
            </button>
            <input
                bind:this={massReplaceInput}
                type="file"
                accept="image/*"
                multiple
                onchange={handleMassReplace}
                style="display: none;"
            />

            <div class="logo">
                <span class="logo-text">PokeAtlas</span>
            </div>

            <div class="toolbar-right">
                <a
                    href="https://github.com/Seth-Revz/pokeatlas-web"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View on GitHub"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        class="w-6 h-6"
                        fill={darkMode ? "white" : "black"}
                    >
                        <path
                            d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.42 7.86 10.95.58.1.79-.25.79-.56v-2.01c-3.2.7-3.87-1.39-3.87-1.39-.53-1.36-1.28-1.72-1.28-1.72-1.04-.72.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.67 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.14 1.17a10.9 10.9 0 0 1 5.72 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.59.23 2.76.11 3.05.73.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.37-5.25 5.66.41.35.78 1.03.78 2.09v3.1c0 .31.21.67.8.55A10.52 10.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z"
                        />
                    </svg>
                </a>
                <ThemeSwitcher {darkMode} onToggle={toggleDarkMode} />
            </div>
        </div>

        <div class="main-content">
            <SpriteList
                {sprites}
                {selectedSprite}
                onSelect={selectSprite}
                onDownloadAll={downloadAllSprites}
                onRecompileAndDownload={recompileAndDownload}
                {isProcessing}
            />

            <SpritePreview
                sprite={selectedSprite}
                fullSpritesheet={spritesheetImage}
                onReplace={handleSpriteReplace}
                onDownload={() =>
                    selectedSprite && downloadSprite(selectedSprite)}
            />
        </div>
    {/if}
</div>

<style>
    :global(html) {
        --bg-primary: #ffffff;
        --bg-secondary: #f8f9fa;
        --bg-tertiary: #fafafa;
        --text-primary: #213547;
        --text-secondary: #666;
        --border-color: #ddd;
        --border-light: #f0f0f0;
        --shadow: rgba(0, 0, 0, 0.1);
    }

    :global(html.dark) {
        --bg-primary: #1a1a1a;
        --bg-secondary: #2d2d2d;
        --bg-tertiary: #242424;
        --text-primary: #e0e0e0;
        --text-secondary: #a0a0a0;
        --border-color: #404040;
        --border-light: #333333;
        --shadow: rgba(0, 0, 0, 0.3);
    }

    .app {
        height: 100vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .background {
        position: relative;
        width: 100%;
        height: 100vh;
        overflow: hidden;
    }

    .background video {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 0;
        pointer-events: none;
    }

    .upload-container {
        z-index: 1;
        position: relative;
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        padding-bottom: 10rem;
    }

    .branding {
        text-align: center;
        margin-bottom: 3rem;
        color: white;
    }

    .branding h1 {
        font-size: 4rem;
        margin: 0 0 1rem 0;
        font-weight: 700;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    .branding p {
        font-size: 1.3rem;
        margin: 0;
        opacity: 0.95;
    }

    .upload-section {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 400px));
        gap: 1.5rem;
        justify-content: center;
        align-items: start;
        width: 100%;
        max-width: 900px;
        margin: 0 auto;
    }

    .toolbar {
        display: flex;
        gap: 1rem;
        padding: 0.5rem 1rem;
        background: var(--bg-primary);
        border-bottom: 1px solid var(--border-color);
        flex-wrap: wrap;
        flex-shrink: 0;
        align-items: center;
        position: relative;
    }

    .toolbar-right {
        display: flex;
        align-items: center;
        margin-left: auto;
    }

    .toolbar-right a {
        line-height: 0;
        margin-right: 0.5rem;
    }

    .toolbar-right a svg {
        width: 2rem;
        height: 2rem;
    }

    .logo {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .logo-text {
        font-size: 2rem;
        font-weight: 700;
        background: linear-gradient(135deg, #4d12ac 0%, #007bff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .btn {
        padding: 0.4rem 1.5rem;
        border: none;
        border-radius: 6px;
        font-size: 1rem;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
    }

    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-danger {
        background: #dc3545;
        color: white;
    }

    .btn-danger:hover {
        background: #c82333;
    }

    .btn-primary {
        background: #007bff;
        color: white;
    }

    .btn-primary:hover:not(:disabled) {
        background: #0056b3;
    }

    .main-content {
        display: grid;
        grid-template-columns: 300px 1fr;
        flex: 1;
        overflow: hidden;
        min-height: 0;
    }
</style>
