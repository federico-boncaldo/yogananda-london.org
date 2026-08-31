<?php

namespace App;

/**
 * Theme customizer
 */
add_action('customize_register', function (\WP_Customize_Manager $wp_customize) {
    // Add postMessage support
    $blogname = $wp_customize->get_setting('blogname');

    if ($blogname !== null) {
        $blogname->transport = 'postMessage';
    }

    if ($wp_customize->selective_refresh !== null) {
        $wp_customize->selective_refresh->add_partial('blogname', [
            'selector' => '.brand',
            'render_callback' => function (): void {
                bloginfo('name');
            },
        ]);
    }
});

/**
 * Customizer JS
 */
add_action('customize_preview_init', function () {
    wp_enqueue_script(
        'sage/customizer.js',
        asset_path('scripts/customizer.js'),
        ['customize-preview'],
        wp_get_theme()->get('Version'),
        true
    );
});
