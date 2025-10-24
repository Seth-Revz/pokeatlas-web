<script lang="ts">
    import type { ExtractedSprite } from "../types";

    interface Props {
        sprites: ExtractedSprite[];
        selectedSprite: ExtractedSprite | null;
        onSelect: (sprite: ExtractedSprite | null) => void;
        onDownloadAll: () => void;
        onRecompileAndDownload: () => void;
        isProcessing: boolean;
    }

    let {
        sprites,
        selectedSprite,
        onSelect,
        onDownloadAll,
        onRecompileAndDownload,
        isProcessing,
    }: Props = $props();
    let searchQuery = $state("");

    const filteredSprites = $derived(
        sprites.filter((sprite) =>
            sprite.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );
</script>

<div class="sprite-list">
    <div class="list-header">
        <div class="search">
            <input
                type="text"
                placeholder="Search sprites..."
                bind:value={searchQuery}
                class="search-input"
            />
        </div>
        <button
            class="view-all-btn"
            onclick={() => onSelect(null)}
            class:active={selectedSprite === null}
        >
            View Full Spritesheet
        </button>
    </div>

    <div class="list-items">
        {#each filteredSprites as sprite}
            <button
                class="list-item"
                class:selected={selectedSprite?.name === sprite.name}
                onclick={() => onSelect(sprite)}
            >
                <div class="sprite-thumb">
                    <img src={sprite.dataUrl} alt={sprite.name} />
                </div>
                <div class="sprite-info">
                    <div class="sprite-name">{sprite.name}</div>
                    <div class="sprite-size">
                        {sprite.width}×{sprite.height}
                    </div>
                </div>
            </button>
        {/each}
    </div>
    <div class="list-footer">
        <button onclick={() => onDownloadAll()} class="btn btn-primary">
            Download All ({sprites.length})
        </button>
        <div class="line"></div>
        <button
            onclick={() => onRecompileAndDownload()}
            class="btn btn-primary"
            disabled={isProcessing}
        >
            {isProcessing ? "Processing..." : "Recompile & Download"}
        </button>
    </div>
</div>

<style>
    .sprite-list {
        display: flex;
        flex-direction: column;
        background: var(--bg-primary);
        border-right: 1px solid var(--border-color);
        height: 100%;
        overflow: hidden;
    }

    .list-header {
        padding: 1rem;
        border-bottom: 1px solid var(--border-color);
        flex-shrink: 0;
    }

    .list-footer {
        display: block;
        width: 100%;
        text-align: center;
    }

    .line {
        background-color: var(--border-color);
        width: 100%;
        height: 1px;
        margin: 0px;
    }

    .btn {
        display: block;
        width: 100%;
        margin: 0;
        padding: 0.5rem 1rem;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 0px;
        font-size: 1rem;
        font-weight: 500;
        transition: all 0.2s;
        cursor: pointer;
        box-sizing: border-box;
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

    .search {
        display: flex;
        align-items: center;
    }

    .search-input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
        background: var(--bg-primary);
        color: var(--text-primary);
    }

    .search-input:focus {
        outline: none;
        border-color: #007bff;
    }

    .view-all-btn {
        width: 100%;
        padding: 0.75rem;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
        text-align: left;
        color: var(--text-primary);
    }

    .view-all-btn:hover {
        background: var(--bg-tertiary);
    }

    .view-all-btn.active {
        background: #007bff;
        color: white;
        border-color: #007bff;
    }

    .list-items {
        overflow-y: auto;
        flex: 1;
        min-height: 0;
    }

    .list-item {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        border: none;
        border-bottom: 1px solid var(--border-light);
        background: var(--bg-primary);
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
    }

    .list-item:hover {
        background: var(--bg-secondary);
    }

    .list-item.selected {
        background: #e7f3ff;
        border-left: 3px solid #007bff;
    }

    :global(.dark) .list-item.selected {
        background: #1a3a52;
    }

    .sprite-thumb {
        width: 40px;
        height: 40px;
        background: repeating-conic-gradient(
                var(--border-light) 0% 25%,
                var(--bg-primary) 0% 50%
            )
            50% / 10px 10px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .sprite-thumb img {
        max-width: 100%;
        max-height: 100%;
        image-rendering: pixelated;
    }

    .sprite-info {
        flex: 1;
        min-width: 0;
    }

    .sprite-name {
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .sprite-size {
        font-size: 0.75rem;
        color: var(--text-secondary);
    }
</style>
