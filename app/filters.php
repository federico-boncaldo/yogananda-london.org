<?php

namespace App;

/**
 * Add <body> classes
 */
add_filter('body_class', function (array $classes) {
    /** Add page slug if it doesn't exist */
    if (is_single() || is_page() && ! is_front_page()) {
        $permalink = get_permalink();
        $slug = is_string($permalink) ? basename($permalink) : '';

        if ($slug !== '' && ! in_array($slug, $classes, true)) {
            $classes[] = $slug;
        }
    }

    /** Add class if sidebar is active */
    if (display_sidebar()) {
        $classes[] = 'sidebar-primary';
    }

    /** Clean up class names for custom templates */
    $classes = array_filter($classes, 'is_string');
    $classes = array_map(function (string $class): string {
        return preg_replace(['/-blade(-php)?$/', '/^page-template-views/'], '', $class) ?? $class;
    }, $classes);

    return array_filter($classes);
});

/**
 * Add "… Continued" to the excerpt
 */
add_filter('excerpt_more', function () {
    return sprintf(' &hellip; <a href="%s">%s</a>', get_permalink(), __('Continued', 'sage'));
});
