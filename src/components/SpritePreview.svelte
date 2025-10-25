<script lang="ts">
    import type { ExtractedSprite } from "../types";

    interface Props {
        sprite: ExtractedSprite | null;
        fullSpritesheet: HTMLImageElement | null;
        onReplace: (file: File) => void;
        onDownload: () => void;
    }

    let { sprite, fullSpritesheet, onReplace, onDownload }: Props = $props();
    let zoom = $state(1);
    // svelte-ignore non_reactive_update
    let fileInput: HTMLInputElement;
    let previewContent: HTMLElement;

    function handleFileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
            onReplace(file);
        }
    }

    function handleReplaceClick() {
        fileInput?.click();
    }

    const imageUrl = $derived(
        sprite ? sprite.dataUrl : fullSpritesheet?.src || "",
    );

    $effect(() => {
        if (sprite && previewContent) {
            const containerWidth = previewContent.clientWidth - 64;
            const containerHeight = previewContent.clientHeight - 64;

            const zoomToFitWidth = containerWidth / sprite.width;
            const zoomToFitHeight = containerHeight / sprite.height;

            const optimalZoom = Math.min(zoomToFitWidth, zoomToFitHeight, 20);
            zoom = Math.max(0.5, Math.round(optimalZoom * 10) / 10);
        } else if (fullSpritesheet && previewContent) {
            const containerWidth = previewContent.clientWidth - 64;
            const containerHeight = previewContent.clientHeight - 64;

            const zoomToFitWidth = containerWidth / fullSpritesheet.width;
            const zoomToFitHeight = containerHeight / fullSpritesheet.height;

            const optimalZoom = Math.min(zoomToFitWidth, zoomToFitHeight, 20);
            zoom = Math.max(0.5, Math.round(optimalZoom * 10) / 10);
        }
    });
</script>

<div class="preview-container">
    <div class="preview-header">
        {#if sprite}
            <div class="preview-title">
                <h2>{sprite.name}</h2>
                <p class="dimensions">{sprite.width} × {sprite.height} px</p>
            </div>
            <div class="header-actions">
                <button class="btn btn-primary" onclick={onDownload}>
                    Download
                </button>
                <button class="btn btn-primary" onclick={handleReplaceClick}>
                    Replace
                </button>
                <input
                    bind:this={fileInput}
                    type="file"
                    accept="image/*"
                    onchange={handleFileChange}
                    style="display: none;"
                />
            </div>
        {:else}
            <div class="preview-title">
                <h2>Full Spritesheet</h2>
                <p class="dimensions">
                    {fullSpritesheet
                        ? `${fullSpritesheet.width} × ${fullSpritesheet.height} px`
                        : ""}
                </p>
            </div>
        {/if}
    </div>

    <div class="preview-content" bind:this={previewContent}>
        <div class="preview-content-inner">
            {#if imageUrl}
                <img
                    src={imageUrl}
                    alt={sprite?.name || "Full spritesheet"}
                    style="
                transform: scale({zoom});
                image-rendering: pixelated;
                "
                />
            {:else}
                <div class="empty-state">
                    <p>Select a sprite to preview</p>
                </div>
            {/if}
        </div>
    </div>

    {#if imageUrl}
        <div class="zoom-controls">
            <label>
                <span>Zoom: {Math.round(zoom * 100)}%</span>
                <input
                    type="range"
                    min="0.5"
                    max="20"
                    step="0.1"
                    bind:value={zoom}
                    class="zoom-slider"
                />
            </label>
            <button class="btn-small" onclick={() => (zoom = 1)}>Reset</button>
        </div>
    {/if}
</div>

<style>
    .preview-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--bg-tertiary);
    }

    .preview-header {
        padding: 0.5rem 2rem;
        background: var(--bg-primary);
        border-bottom: 1px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .preview-title {
        display: flex;
        align-items: baseline;
        gap: 8px;
    }

    .preview-title h2,
    .preview-title p {
        margin: 0;
        color: var(--text-primary);
    }

    .dimensions {
        margin: 0.25rem 0 0 0;
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    .header-actions {
        display: flex;
        gap: 0.5rem;
    }

    .btn {
        padding: 0.5rem 1rem;
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

    .btn-primary {
        background: #007bff;
        color: white;
    }

    .btn-primary:hover:not(:disabled) {
        background: #0056b3;
    }

    .preview-content {
        flex: 1;
        overflow: auto;
        padding: 2rem;
        background: repeating-conic-gradient(
                var(--border-light) 0% 25%,
                transparent 0% 50%
            )
            50% / 16px 16px;
        background-color: var(--bg-tertiary);
    }

    .preview-content-inner {
        min-width: 100%;
        min-height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .preview-content img {
        display: block;
    }

    .empty-state {
        text-align: center;
        color: var(--text-secondary);
        font-size: 1.2rem;
    }

    .zoom-controls {
        padding: 1rem 2rem;
        background: var(--bg-primary);
        border-top: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .zoom-controls label {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .zoom-controls span {
        font-weight: 500;
        min-width: 80px;
        color: var(--text-primary);
    }

    .zoom-slider {
        flex: 1;
        height: 6px;
        border-radius: 3px;
        background: var(--border-color);
        outline: none;
        appearance: none;
        -webkit-appearance: none;
    }

    .zoom-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #007bff;
        cursor: pointer;
    }

    .zoom-slider::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #007bff;
        cursor: pointer;
        border: none;
    }

    .btn-small {
        padding: 0.5rem 1rem;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background: var(--bg-primary);
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
        color: var(--text-primary);
    }

    .btn-small:hover {
        background: var(--bg-secondary);
    }
</style>
