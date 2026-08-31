<?php

namespace App\Controllers;

class App
{
    public function siteName(): string
    {
        return get_bloginfo('name', 'display');
    }

    public static function title(): string
    {
        if (is_home()) {
            $home = get_option('page_for_posts');
            $home = is_numeric($home) ? (int) $home : 0;

            if ($home > 0) {
                return get_the_title($home);
            }

            return __('Latest Posts', 'sage');
        }
        if (is_archive()) {
            return get_the_archive_title();
        }
        if (is_search()) {
            return sprintf(__('Search Results for %s', 'sage'), get_search_query());
        }
        if (is_404()) {
            return __('Not Found', 'sage');
        }

        return get_the_title();
    }
}
