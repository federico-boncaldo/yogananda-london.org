<?php

namespace App;

use Illuminate\Support\Facades\Vite;

/**
 * Resolve a Vite-managed theme asset.
 */
function asset_path(string $asset): string
{
    $asset = ltrim($asset, '/');

    if (str_starts_with($asset, 'resources/')) {
        return Vite::asset($asset);
    }

    return Vite::asset("resources/assets/{$asset}");
}

/**
 * Determine whether to show the sidebar
 */
function display_sidebar(): bool
{
    static $display;

    isset($display) || $display = apply_filters('sage/display_sidebar', false);

    return $display;
}
