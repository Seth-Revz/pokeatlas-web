<script lang="ts">
    interface Props {
        existingSprites: string[];
        onAdd: (file: File, spriteName: string) => Promise<void>;
        onCancel: () => void;
    }

    let { existingSprites, onAdd, onCancel }: Props = $props();
    
    let uploadedFile = $state<File | null>(null);
    let spriteName = $state('');
    let previewUrl = $state('');
    let validationError = $state('');
    let isProcessing = $state(false);
    let fileInput: HTMLInputElement;
    let nameTouched = $state(false);

    const nameValidationError = $derived(
        !spriteName ? 'Sprite name is required' :
        !/^[a-zA-Z0-9_-]+$/.test(spriteName) ? 'Only letters, numbers, hyphens, and underscores' :
        existingSprites.includes(spriteName) ? `Sprite "${spriteName}" already exists` :
        ''
    );

    const isValid = $derived(
        uploadedFile !== null &&
        (spriteName && nameValidationError === '') &&
        !isProcessing
    );

    async function handleFileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            validationError = 'Please upload a valid image file';
            uploadedFile = null;
            previewUrl = '';
            return;
        }

        const img = new Image();
        img.src = URL.createObjectURL(file);
        
        try {
            await img.decode();
            uploadedFile = file;
            previewUrl = img.src;
            validationError = '';
        } catch (error) {
            validationError = 'Error loading image';
            uploadedFile = null;
            previewUrl = '';
        }
    }

    async function handleAdd() {
        nameTouched = true;

        if (!isValid) return;

        isProcessing = true;
        validationError = '';

        try {
            await onAdd(uploadedFile!, spriteName);
        } catch (error) {
            validationError = error instanceof Error ? error.message : 'Error adding sprite';
            isProcessing = false;
        }
    }

    function handleCancel() {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        onCancel();
    }

    function handleClickOutside(event: MouseEvent) {
        if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
            handleCancel();
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            handleCancel();
        }
    }

    function handleOverlayKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
            handleCancel();
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

<div 
    class="modal-overlay" 
    role="dialog" 
    aria-modal="true" 
    aria-labelledby="modal-title" 
    tabindex="-1" 
    onclick={handleClickOutside}
    onkeydown={handleOverlayKeydown}
>
    <div class="modal">
        <div class="modal-header">
            <h2 id="modal-title">Add New Sprite</h2>
            <button class="close-btn" onclick={handleCancel} aria-label="Close modal">✕</button>
        </div>

        <div class="modal-body">
            <div class="form-group">
                <label for="sprite-file">Image File (PNG)</label>
                <input
                    bind:this={fileInput}
                    id="sprite-file"
                    type="file"
                    accept="image/png"
                    onchange={handleFileChange}
                    disabled={isProcessing}
                />
            </div>

            {#if previewUrl}
                <div class="preview-section">
                    <div class="preview-label">Preview</div>
                    <div class="preview-container">
                        <img src={previewUrl} alt="Sprite preview" />
                    </div>
                </div>
            {/if}

            <div class="form-group">
                <label for="sprite-name">Sprite Name</label>
                <input
                    id="sprite-name"
                    type="text"
                    bind:value={spriteName}
                    placeholder="e.g: new_character"
                    disabled={isProcessing}
                    class:name-error={nameValidationError !== '' && nameTouched}
                    onblur={() => nameTouched = true}
                />
                {#if nameValidationError && nameTouched}
                    <div class="error-message">{nameValidationError}</div>
                {/if}
            </div>

            {#if validationError && !nameValidationError}
                <div class="error-message">{validationError}</div>
            {/if}
        </div>

        <div class="modal-footer">
            <button
                class="btn btn-secondary"
                onclick={handleCancel}
                disabled={isProcessing}
            >
                Cancel
            </button>
            <button
                class="btn btn-primary"
                onclick={handleAdd}
                disabled={!isValid || isProcessing}
            >
                {isProcessing ? 'Processing...' : 'Add Sprite'}
            </button>
        </div>
    </div>
</div>

<style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
    }

    .modal {
        background: var(--bg-primary);
        border-radius: 12px;
        width: 100%;
        max-width: 500px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        max-height: 90vh;
        overflow-y: auto;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid var(--border-color);
    }

    .modal-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s;
    }

    .close-btn:hover {
        background: var(--bg-secondary);
        color: var(--text-primary);
    }

    .modal-body {
        padding: 1.5rem;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: var(--text-primary);
    }

    .form-group input[type="file"] {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background: var(--bg-secondary);
        color: var(--text-primary);
        cursor: pointer;
    }

    .form-group input[type="text"] {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background: var(--bg-secondary);
        color: var(--text-primary);
        font-size: 1rem;
        box-sizing: border-box;
    }

    .form-group input[type="text"]:focus {
        outline: none;
        border-color: #007bff;
    }

    .form-group input[type="text"].name-error {
        border-color: #dc3545;
    }

    .form-group input[type="text"]:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .preview-section {
        margin-bottom: 1.5rem;
    }

    .preview-section .preview-label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: var(--text-primary);
    }

    .preview-container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1.5rem;
        border: 2px dashed var(--border-color);
        border-radius: 8px;
        background: var(--bg-secondary);
        min-height: 100px;
    }

    .preview-container img {
        max-width: 100%;
        max-height: 300px;
        object-fit: contain;
        image-rendering: pixelated;
    }

    .error-message {
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.5rem;
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        padding: 1.5rem;
        border-top: 1px solid var(--border-color);
    }

    .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-secondary {
        background: var(--bg-secondary);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
    }

    .btn-secondary:hover:not(:disabled) {
        background: var(--bg-tertiary);
    }

    .btn-primary {
        background: #007bff;
        color: white;
    }

    .btn-primary:hover:not(:disabled) {
        background: #0056b3;
    }
</style>
