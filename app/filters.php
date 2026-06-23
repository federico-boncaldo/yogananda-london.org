<?php

namespace App;

/**
 * Add <body> classes
 */
add_filter('body_class', function (array $classes) {
    /** Add page slug if it doesn't exist */
    if (is_single() || is_page() && ! is_front_page()) {
        $permalink = get_permalink();

        if (is_string($permalink)) {
            $slug = basename($permalink);

            if (! in_array($slug, $classes, true)) {
                $classes[] = $slug;
            }
        }
    }

    /** Add class if sidebar is active */
    if (display_sidebar()) {
        $classes[] = 'sidebar-primary';
    }

    /** Clean up class names for custom templates */
    $classes = array_map(function (mixed $class): string {
        if (! is_string($class)) {
            return '';
        }

        $class = preg_replace(['/-blade(-php)?$/', '/^page-template-views/'], '', $class);

        return is_string($class) ? $class : '';
    }, $classes);

    return array_filter($classes);
});

/**
 * Add "… Continued" to the excerpt
 */
add_filter('excerpt_more', function () {
    return sprintf(' &hellip; <a href="%s">%s</a>', get_permalink(), __('Continued', 'sage'));
});

/**
 * Add Donate as a highlighted primary navigation item.
 */
add_filter('wp_nav_menu_items', function (string $items, object $args): string {
    $themeLocation = $args->theme_location ?? '';

    if ($themeLocation !== 'primary_navigation') {
        return $items;
    }

    $donationUrl = home_url('/donate/');
    $donationPath = wp_parse_url($donationUrl, PHP_URL_PATH);

    if (! is_string($donationPath) || $donationPath === '') {
        $donationPath = '/donate/';
    }

    if (
        str_contains($items, 'menu-item-donate')
        || str_contains($items, 'href="'.esc_url($donationUrl).'"')
        || str_contains($items, 'href="'.esc_url($donationPath).'"')
    ) {
        return $items;
    }

    $classes = ['menu-item', 'menu-item-donate'];

    if (is_page('donate')) {
        $classes[] = 'current-menu-item';
    }

    return $items.sprintf(
        '<li class="%s"><a class="donate-menu-link" href="%s">%s</a></li>',
        esc_attr(implode(' ', $classes)),
        esc_url($donationUrl),
        esc_html__('Donate', 'sage')
    );
}, 10, 2);
