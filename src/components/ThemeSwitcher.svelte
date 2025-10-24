<script lang="ts">
    interface Props {
        darkMode: boolean;
        onToggle: () => void;
    }

    let { darkMode, onToggle }: Props = $props();
</script>

<button
    class="theme-switcher-grid"
    class:night-theme={darkMode}
    onclick={onToggle}
    aria-label="Switch theme"
>
    <div class="sun" aria-hidden="true"></div>
    <div class="moon-overlay" aria-hidden="true"></div>
    <div class="cloud-ball cloud-ball-left" aria-hidden="true"></div>
    <div class="cloud-ball cloud-ball-middle" aria-hidden="true"></div>
    <div class="cloud-ball cloud-ball-right" aria-hidden="true"></div>
    <div class="cloud-ball cloud-ball-top" aria-hidden="true"></div>
    <div class="star" id="star1" aria-hidden="true"></div>
    <div class="star" id="star2" aria-hidden="true"></div>
    <div class="star" id="star3" aria-hidden="true"></div>
    <div class="star" id="star4" aria-hidden="true"></div>
</button>

<style>
    .theme-switcher-grid {
        display: grid;
        grid-template-columns: repeat(54, 1px);
        grid-template-rows: repeat(24, 1px);
        gap: 0;
        position: relative;
        background-color: #0dbdf6;
        border-radius: 49px;
        border: 1px solid #1c2135;
        cursor: pointer;
        transition:
            background-color 0.8s ease,
            border-color 0.8s ease;
        appearance: none;
        padding: 0;
    }

    .theme-switcher-grid.night-theme {
        background-color: #272a30;
        border-color: #f0f0e8;
    }

    .sun {
        background-color: #fabc1c;
        grid-column: 3 / 23;
        grid-row: 3 / 23;
        border-radius: 50%;
        transition:
            grid-column 0.8s ease,
            background-color 0.8s ease;
        height: 20px;
    }

    .theme-switcher-grid.night-theme .sun {
        grid-column: 33 / 53;
        background-color: #fffdf2;
    }

    .moon-overlay {
        position: absolute;
        border-radius: 50%;
        transition:
            left 0.8s ease,
            background-color 0.8s ease;
        z-index: 1;
        background-color: #0dbdf6;
    }

    .theme-switcher-grid.night-theme .moon-overlay {
        display: block;
        left: calc(28 / 54 * 100%);
        top: calc(4 / 29 * 100%);
        width: 18px;
        height: 18px;
        background-color: #272a30;
    }

    .cloud-ball {
        background-color: #fffdf2;
        border-radius: 50%;
        width: 9px;
        height: 9px;
        position: absolute;
        transition: all 0.8s ease;
        z-index: 2;
    }

    .cloud-ball-left {
        top: calc((8 / 24) * 100%);
        left: calc((12 / 54) * 100%);
    }

    .cloud-ball-middle {
        top: calc((8 / 24) * 100%);
        left: calc((17 / 54) * 100%);
    }

    .cloud-ball-right {
        top: calc((8 / 24) * 100%);
        left: calc((22 / 54) * 100%);
    }

    .cloud-ball-top {
        top: calc((6 / 24) * 100%);
        left: calc((17 / 54) * 100%);
    }

    .theme-switcher-grid.night-theme .cloud-ball-left {
        top: calc((16 / 24) * 100%);
        left: calc((16 / 54) * 100%);
        width: 2px;
        height: 2px;
    }

    .theme-switcher-grid.night-theme .cloud-ball-middle {
        top: calc((3 / 24) * 100%);
        left: calc((22 / 54) * 100%);
        width: 2px;
        height: 2px;
    }

    .theme-switcher-grid.night-theme .cloud-ball-right {
        top: calc((10 / 24) * 100%);
        left: calc((29 / 54) * 100%);
        width: 2px;
        height: 2px;
    }

    .theme-switcher-grid.night-theme .cloud-ball-top {
        top: calc((5 / 24) * 100%);
        left: calc((34 / 54) * 100%);
        width: 2px;
        height: 2px;
    }

    .star {
        background-color: #fffdf2;
        width: 1px;
        height: 1px;
        position: absolute;
        opacity: 0;
        transition: opacity 0.8s ease;
        border-radius: 50%;
    }

    #star1 {
        top: calc((7 / 24) * 100%);
        left: calc((10 / 54) * 100%);
    }

    #star2 {
        top: calc((9 / 24) * 100%);
        left: calc((16 / 54) * 100%);
    }

    #star3 {
        top: calc((13 / 24) * 100%);
        left: calc((23 / 54) * 100%);
    }

    #star4 {
        top: calc((18 / 24) * 100%);
        left: calc((29 / 54) * 100%);
    }

    .theme-switcher-grid.night-theme .star {
        opacity: 1;
    }
</style>
