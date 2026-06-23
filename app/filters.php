<?php

namespace App;

/**
 * Add <body> classes
 */
add_filter('body_class', function (array $classes) {
    /** Add page slug if it doesn't exist */
    if (is_single() || is_page() && ! is_front_page()) {
        if (! in_array(basename(get_permalink()), $classes)) {
            $classes[] = basename(get_permalink());
        }
    }

    /** Add class if sidebar is active */
    if (display_sidebar()) {
        $classes[] = 'sidebar-primary';
    }

    /** Clean up class names for custom templates */
    $classes = array_map(function ($class) {
        return preg_replace(['/-blade(-php)?$/', '/^page-template-views/'], '', $class);
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
add_filter('wp_nav_menu_items', function ($items, $args) {
    if (($args->theme_location ?? '') !== 'primary_navigation') {
        return $items;
    }

    $donationUrl = home_url('/donate/');

    if (str_contains($items, 'href="' . esc_url($donationUrl) . '"')) {
        return $items;
    }

    $classes = ['menu-item', 'menu-item-donate'];

    if (is_page('donate')) {
        $classes[] = 'current-menu-item';
    }

    return $items . sprintf(
        '<li class="%s"><a class="donate-menu-link" href="%s">%s</a></li>',
        esc_attr(implode(' ', $classes)),
        esc_url($donationUrl),
        esc_html__('Donate', 'sage')
    );
}, 10, 2);
