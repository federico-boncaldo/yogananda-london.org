<?php

namespace App;

use Illuminate\Contracts\View\View;

const MONASTIC_VISIT_POPUP_OPTION = 'yogananda_monastic_visit_popup';
const MONASTIC_VISIT_POPUP_PAGE = 'monastic-visit-popup';
const MONASTIC_VISIT_POPUP_FREQUENCY_CONTENT_UPDATE = 'content_update';
const MONASTIC_VISIT_POPUP_FREQUENCY_DAILY = 'daily';
const MONASTIC_VISIT_POPUP_FREQUENCY_SESSION = 'session';

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

add_action('admin_enqueue_scripts', function (string $hook_suffix): void {
    if ($hook_suffix !== 'appearance_page_'.MONASTIC_VISIT_POPUP_PAGE) {
        return;
    }

    wp_enqueue_media();
    wp_enqueue_script(
        'sage/monastic-popup-admin.js',
        asset_path('scripts/admin/monastic-popup-admin.js'),
        ['media-editor'],
        wp_get_theme()->get('Version'),
        true
    );
    wp_localize_script(
        'sage/monastic-popup-admin.js',
        'yoganandaMonasticPopupAdmin',
        [
            'frameTitle' => __('Select popup image', 'sage'),
            'buttonText' => __('Use this image', 'sage'),
        ]
    );
});

add_action('wp_footer', __NAMESPACE__.'\\render_monastic_visit_popup');

/**
 * @return array{enabled: string, display_frequency: string, image_id: int, eyebrow: string, title: string, body: string, button_label: string, button_url: string}
 */
function monastic_visit_popup_defaults(): array
{
    return [
        'enabled' => '0',
        'display_frequency' => MONASTIC_VISIT_POPUP_FREQUENCY_DAILY,
        'image_id' => 0,
        'eyebrow' => '',
        'title' => '',
        'body' => '',
        'button_label' => '',
        'button_url' => '',
    ];
}

/**
 * @return array{enabled: string, display_frequency: string, image_id: int, eyebrow: string, title: string, body: string, button_label: string, button_url: string}
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
 * @return array{enabled: string, display_frequency: string, image_id: int, eyebrow: string, title: string, body: string, button_label: string, button_url: string}
 */
function monastic_visit_popup_sanitize($input): array
{
    if (! is_array($input)) {
        $input = [];
    }

    return [
        'enabled' => empty($input['enabled']) ? '0' : '1',
        'display_frequency' => monastic_visit_popup_frequency_value($input),
        'image_id' => monastic_visit_popup_integer_value($input, 'image_id'),
        'eyebrow' => sanitize_text_field(monastic_visit_popup_string_value($input, 'eyebrow')),
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
 * @param  array<mixed>  $input
 */
function monastic_visit_popup_integer_value(array $input, string $key): int
{
    $value = $input[$key] ?? 0;

    if (is_int($value) || is_float($value) || is_string($value)) {
        return absint($value);
    }

    return 0;
}

/**
 * @return array<string, string>
 */
function monastic_visit_popup_frequency_options(): array
{
    return [
        MONASTIC_VISIT_POPUP_FREQUENCY_DAILY => __('Once per day', 'sage'),
        MONASTIC_VISIT_POPUP_FREQUENCY_CONTENT_UPDATE => __('Once per content update', 'sage'),
        MONASTIC_VISIT_POPUP_FREQUENCY_SESSION => __('Once per browser session', 'sage'),
    ];
}

/**
 * @param  array<mixed>  $input
 */
function monastic_visit_popup_frequency_value(array $input): string
{
    $frequency = monastic_visit_popup_string_value($input, 'display_frequency');

    if (array_key_exists($frequency, monastic_visit_popup_frequency_options())) {
        return $frequency;
    }

    return MONASTIC_VISIT_POPUP_FREQUENCY_DAILY;
}

/**
 * @param  array{enabled: string, display_frequency: string, image_id: int, eyebrow: string, title: string, body: string, button_label: string, button_url: string}  $settings
 */
function monastic_visit_popup_is_enabled(array $settings): bool
{
    return $settings['enabled'] === '1'
        && $settings['title'] !== ''
        && trim(wp_strip_all_tags($settings['body'])) !== '';
}

/**
 * @param  array{enabled: string, display_frequency: string, image_id: int, eyebrow: string, title: string, body: string, button_label: string, button_url: string}  $settings
 */
function monastic_visit_popup_version(array $settings): string
{
    $payload = wp_json_encode([
        'title' => $settings['title'],
        'body' => $settings['body'],
        'image_id' => $settings['image_id'],
        'eyebrow' => $settings['eyebrow'],
        'display_frequency' => $settings['display_frequency'],
        'button_label' => $settings['button_label'],
        'button_url' => $settings['button_url'],
    ]);

    return substr(hash('sha256', is_string($payload) ? $payload : ''), 0, 12);
}

/**
 * @param  array{enabled: string, display_frequency: string, image_id: int, eyebrow: string, title: string, body: string, button_label: string, button_url: string}  $settings
 * @return array{eyebrow: string, title: string, body: string, image_html: string, image_viewer_html: string, display_frequency: string, button_label: string, button_url: string, version: string}
 */
function monastic_visit_popup_view_data(array $settings): array
{
    return [
        'eyebrow' => $settings['eyebrow'],
        'title' => $settings['title'],
        'body' => $settings['body'],
        'image_html' => monastic_visit_popup_image_html($settings['image_id']),
        'image_viewer_html' => monastic_visit_popup_image_viewer_html($settings['image_id']),
        'display_frequency' => $settings['display_frequency'],
        'button_label' => $settings['button_label'],
        'button_url' => $settings['button_url'],
        'version' => monastic_visit_popup_version($settings),
    ];
}

function monastic_visit_popup_image_html(int $image_id): string
{
    if ($image_id <= 0) {
        return '';
    }

    $image = wp_get_attachment_image(
        $image_id,
        'large',
        false,
        [
            'class' => 'monastic-visit-popup__image-element',
            'loading' => 'eager',
        ]
    );

    return is_string($image) ? $image : '';
}

function monastic_visit_popup_image_viewer_html(int $image_id): string
{
    if ($image_id <= 0) {
        return '';
    }

    $image = wp_get_attachment_image(
        $image_id,
        'full',
        false,
        [
            'class' => 'monastic-visit-popup__image-viewer-element',
            'loading' => 'eager',
        ]
    );

    return is_string($image) ? $image : '';
}

function monastic_visit_popup_admin_image_preview(int $image_id): string
{
    if ($image_id <= 0) {
        return '';
    }

    $image = wp_get_attachment_image(
        $image_id,
        'medium',
        false,
        [
            'style' => 'max-width: 240px; height: auto; display: block;',
        ]
    );

    return is_string($image) ? $image : '';
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
        <p><?php echo esc_html__('Use this notice for short-term announcements such as the next monastic visit.', 'sage'); ?></p>
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
                            <label for="monastic-visit-popup-frequency"><?php echo esc_html__('Display frequency', 'sage'); ?></label>
                        </th>
                        <td>
                            <select
                                id="monastic-visit-popup-frequency"
                                name="<?php echo esc_attr(MONASTIC_VISIT_POPUP_OPTION); ?>[display_frequency]"
                            >
                                <?php foreach (monastic_visit_popup_frequency_options() as $value => $label) { ?>
                                    <option
                                        value="<?php echo esc_attr($value); ?>"
                                        <?php selected($settings['display_frequency'], $value); ?>
                                    >
                                        <?php echo esc_html($label); ?>
                                    </option>
                                <?php } ?>
                            </select>
                            <p class="description"><?php echo esc_html__('Once per day is recommended for short-term announcements.', 'sage'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="monastic-visit-popup-eyebrow"><?php echo esc_html__('Intro label', 'sage'); ?></label>
                        </th>
                        <td>
                            <input
                                id="monastic-visit-popup-eyebrow"
                                class="regular-text"
                                type="text"
                                name="<?php echo esc_attr(MONASTIC_VISIT_POPUP_OPTION); ?>[eyebrow]"
                                value="<?php echo esc_attr($settings['eyebrow']); ?>"
                            >
                            <p class="description"><?php echo esc_html__('Optional. Appears above the popup title.', 'sage'); ?></p>
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
                        <th scope="row"><?php echo esc_html__('Image', 'sage'); ?></th>
                        <td>
                            <div data-monastic-popup-image-control>
                                <input
                                    id="monastic-visit-popup-image-id"
                                    type="hidden"
                                    name="<?php echo esc_attr(MONASTIC_VISIT_POPUP_OPTION); ?>[image_id]"
                                    value="<?php echo esc_attr((string) $settings['image_id']); ?>"
                                    data-monastic-popup-image-id
                                >
                                <div
                                    class="monastic-visit-popup-admin-image-preview"
                                    data-monastic-popup-image-preview
                                >
                                    <?php
                                    // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- WordPress generates escaped attachment image markup.
                                    echo monastic_visit_popup_admin_image_preview($settings['image_id']);
    ?>
                                </div>
                                <p>
                                    <button
                                        type="button"
                                        class="button"
                                        data-monastic-popup-select-image
                                    >
                                        <?php echo esc_html__('Select image', 'sage'); ?>
                                    </button>
                                    <button
                                        type="button"
                                        class="button"
                                        data-monastic-popup-remove-image
                                        <?php disabled($settings['image_id'], 0); ?>
                                    >
                                        <?php echo esc_html__('Remove image', 'sage'); ?>
                                    </button>
                                </p>
                                <p class="description"><?php echo esc_html__('Optional. The image appears above the popup title and uses the attachment alt text from the Media Library.', 'sage'); ?></p>
                            </div>
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
