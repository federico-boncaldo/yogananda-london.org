<?php

namespace App;

use Illuminate\Contracts\View\View;

const MONASTIC_VISIT_POPUP_OPTION = 'yogananda_monastic_visit_popup';
const MONASTIC_VISIT_POPUP_PAGE = 'monastic-visit-popup';

add_action('admin_init', function (): void {
    register_setting(
        MONASTIC_VISIT_POPUP_PAGE,
        MONASTIC_VISIT_POPUP_OPTION,
        [
            'type' => 'array',
            'sanitize_callback' => __NAMESPACE__.'\\monastic_visit_popup_sanitize',
            'default' => monastic_visit_popup_defaults(),
        ]
    );
});

add_action('admin_menu', function (): void {
    add_theme_page(
        __('Monastic Visit Popup', 'sage'),
        __('Monastic Visit Popup', 'sage'),
        'manage_options',
        MONASTIC_VISIT_POPUP_PAGE,
        __NAMESPACE__.'\\render_monastic_visit_popup_admin_page'
    );
});

add_action('wp_footer', __NAMESPACE__.'\\render_monastic_visit_popup');

/**
 * @return array{enabled: string, title: string, body: string, button_label: string, button_url: string}
 */
function monastic_visit_popup_defaults(): array
{
    return [
        'enabled' => '0',
        'title' => '',
        'body' => '',
        'button_label' => '',
        'button_url' => '',
    ];
}

/**
 * @return array{enabled: string, title: string, body: string, button_label: string, button_url: string}
 */
function monastic_visit_popup_settings(): array
{
    $stored = get_option(MONASTIC_VISIT_POPUP_OPTION, []);

    if (! is_array($stored)) {
        $stored = [];
    }

    return monastic_visit_popup_sanitize(
        array_merge(monastic_visit_popup_defaults(), $stored)
    );
}

/**
 * @param  mixed  $input
 * @return array{enabled: string, title: string, body: string, button_label: string, button_url: string}
 */
function monastic_visit_popup_sanitize($input): array
{
    if (! is_array($input)) {
        $input = [];
    }

    return [
        'enabled' => empty($input['enabled']) ? '0' : '1',
        'title' => sanitize_text_field(monastic_visit_popup_string_value($input, 'title')),
        'body' => wp_kses_post(monastic_visit_popup_string_value($input, 'body')),
        'button_label' => sanitize_text_field(
            monastic_visit_popup_string_value($input, 'button_label')
        ),
        'button_url' => esc_url_raw(monastic_visit_popup_string_value($input, 'button_url')),
    ];
}

/**
 * @param  array<mixed>  $input
 */
function monastic_visit_popup_string_value(array $input, string $key): string
{
    $value = $input[$key] ?? '';

    if (is_string($value)) {
        return $value;
    }

    if (is_int($value) || is_float($value)) {
        return (string) $value;
    }

    return '';
}

/**
 * @param  array{enabled: string, title: string, body: string, button_label: string, button_url: string}  $settings
 */
function monastic_visit_popup_is_enabled(array $settings): bool
{
    return $settings['enabled'] === '1'
        && $settings['title'] !== ''
        && trim(wp_strip_all_tags($settings['body'])) !== '';
}

/**
 * @param  array{enabled: string, title: string, body: string, button_label: string, button_url: string}  $settings
 */
function monastic_visit_popup_version(array $settings): string
{
    $payload = wp_json_encode([
        'title' => $settings['title'],
        'body' => $settings['body'],
        'button_label' => $settings['button_label'],
        'button_url' => $settings['button_url'],
    ]);

    return substr(hash('sha256', is_string($payload) ? $payload : ''), 0, 12);
}

/**
 * @param  array{enabled: string, title: string, body: string, button_label: string, button_url: string}  $settings
 * @return array{title: string, body: string, button_label: string, button_url: string, version: string}
 */
function monastic_visit_popup_view_data(array $settings): array
{
    return [
        'title' => $settings['title'],
        'body' => $settings['body'],
        'button_label' => $settings['button_label'],
        'button_url' => $settings['button_url'],
        'version' => monastic_visit_popup_version($settings),
    ];
}

function render_monastic_visit_popup(): void
{
    if (is_admin() || is_feed() || wp_doing_ajax()) {
        return;
    }

    $settings = monastic_visit_popup_settings();

    if (! monastic_visit_popup_is_enabled($settings)) {
        return;
    }

    $view = view('partials.monastic-visit-popup', monastic_visit_popup_view_data($settings));

    if (! $view instanceof View) {
        return;
    }

    // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Partial escapes scalar fields and only renders wp_kses_post body content.
    echo $view->render();
}

function render_monastic_visit_popup_admin_page(): void
{
    if (! current_user_can('manage_options')) {
        return;
    }

    $settings = monastic_visit_popup_settings();
    ?>
    <div class="wrap">
        <h1><?php echo esc_html__('Monastic Visit Popup', 'sage'); ?></h1>
        <p><?php echo esc_html__('Use this notice for short-term announcements such as the next monastic visit. It appears once per browser until the content changes.', 'sage'); ?></p>
        <?php settings_errors(MONASTIC_VISIT_POPUP_OPTION); ?>
        <form method="post" action="<?php echo esc_url(admin_url('options.php')); ?>">
            <?php settings_fields(MONASTIC_VISIT_POPUP_PAGE); ?>
            <table class="form-table" role="presentation">
                <tbody>
                    <tr>
                        <th scope="row"><?php echo esc_html__('Enable popup', 'sage'); ?></th>
                        <td>
                            <label for="monastic-visit-popup-enabled">
                                <input
                                    id="monastic-visit-popup-enabled"
                                    type="checkbox"
                                    name="<?php echo esc_attr(MONASTIC_VISIT_POPUP_OPTION); ?>[enabled]"
                                    value="1"
                                    <?php checked($settings['enabled'], '1'); ?>
                                >
                                <?php echo esc_html__('Show this notice on public pages.', 'sage'); ?>
                            </label>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="monastic-visit-popup-title"><?php echo esc_html__('Title', 'sage'); ?></label>
                        </th>
                        <td>
                            <input
                                id="monastic-visit-popup-title"
                                class="regular-text"
                                type="text"
                                name="<?php echo esc_attr(MONASTIC_VISIT_POPUP_OPTION); ?>[title]"
                                value="<?php echo esc_attr($settings['title']); ?>"
                            >
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php echo esc_html__('Message', 'sage'); ?></th>
                        <td>
                            <?php
                            wp_editor(
                                $settings['body'],
                                'monastic_visit_popup_body',
                                [
                                    'textarea_name' => MONASTIC_VISIT_POPUP_OPTION.'[body]',
                                    'textarea_rows' => 8,
                                    'media_buttons' => false,
                                ]
                            );
    ?>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="monastic-visit-popup-button-label"><?php echo esc_html__('Button label', 'sage'); ?></label>
                        </th>
                        <td>
                            <input
                                id="monastic-visit-popup-button-label"
                                class="regular-text"
                                type="text"
                                name="<?php echo esc_attr(MONASTIC_VISIT_POPUP_OPTION); ?>[button_label]"
                                value="<?php echo esc_attr($settings['button_label']); ?>"
                            >
                            <p class="description"><?php echo esc_html__('Optional. Leave blank if the notice does not need a button.', 'sage'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="monastic-visit-popup-button-url"><?php echo esc_html__('Button URL', 'sage'); ?></label>
                        </th>
                        <td>
                            <input
                                id="monastic-visit-popup-button-url"
                                class="regular-text code"
                                type="url"
                                name="<?php echo esc_attr(MONASTIC_VISIT_POPUP_OPTION); ?>[button_url]"
                                value="<?php echo esc_url($settings['button_url']); ?>"
                            >
                        </td>
                    </tr>
                </tbody>
            </table>
            <?php submit_button(__('Save popup', 'sage')); ?>
        </form>
    </div>
    <?php
}
