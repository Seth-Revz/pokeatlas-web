<script lang="ts">
    interface Props {
        label: string;
        accept: string;
        onUpload: (file: File) => void;
        currentFile?: string;
    }

    let { label, accept, onUpload, currentFile }: Props = $props();

    function handleChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
            onUpload(file);
        }
    }
</script>

<div class="uploader">
    <label>
        <span class="label-text">{label}</span>
        <input type="file" {accept} onchange={handleChange} />
        {#if currentFile}
            <span class="file-name">📄 {currentFile}</span>
        {:else}
            <span class="placeholder">Click to choose file</span>
        {/if}
    </label>
</div>

<style>
    .uploader {
        width: 100%;
        border-radius: 16px;
        background: linear-gradient(135deg, #4d12ac 0%, #0e067a 100%);
    }

    .uploader label {
        display: block;
        width: 100%;
        border-radius: 16px;
        padding: 1.5rem;
        transition: all 0.2s;
        cursor: pointer;
        box-sizing: border-box;
    }

    .uploader label:hover {
        border-color: #007bff;
        background: #0b055e;
    }

    .label-text {
        display: block;
        text-align: center;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: #ffffff;
        font-size: 1.25rem;
    }

    input[type="file"] {
        display: none;
    }

    .file-name {
        display: block;
        color: #ffffff;
        font-weight: 500;
        padding: 0.5rem;
        background: #4829bb;
        border-radius: 4px;
    }

    .placeholder {
        display: block;
        color: #999;
        padding: 0.5rem;
        text-align: center;
    }
</style>
