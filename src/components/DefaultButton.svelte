<script lang="ts">
  export let label: string;
  export let onClick: () => void;
  export let disabled: boolean = false;
</script>

<button
  class="action-button"
  on:click={onClick}
  disabled={disabled}
>
  {label}
</button>

<style>
  .action-button {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    background-color: #3a3a3a; /* grey background */
    color: white;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
  }

  .action-button:hover {
    background-color: #4a4a4a;
  }

  .action-button:active {
    transform: scale(0.95);
  }
</style>