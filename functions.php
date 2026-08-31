<?php

use App\Providers\ThemeServiceProvider;
use Roots\Acorn\Application;

if (! file_exists($composer = __DIR__.'/vendor/autoload.php')) {
    wp_die(__('Error locating autoloader. Please run <code>composer install</code>.', 'sage'));
}

require $composer;

Application::configure()
    ->withProviders([
        ThemeServiceProvider::class,
    ])
    ->boot();

collect(['helpers', 'setup', 'filters', 'admin', 'monastic-popup'])
    ->each(function ($file) {
        $path = __DIR__."/app/{$file}.php";

        if (! file_exists($path)) {
            wp_die(
                sprintf(
                    /* translators: %s is replaced with the relative file path */
                    __('Error locating <code>%s</code> for inclusion.', 'sage'),
                    "app/{$file}.php"
                )
            );
        }

        require_once $path;
    });
