<div
  id="monastic-visit-popup"
  class="monastic-visit-popup"
  data-monastic-visit-popup
  data-popup-version="{{ esc_attr($version) }}"
  data-popup-frequency="{{ esc_attr($display_frequency) }}"
  aria-hidden="true"
  hidden
>
  <div class="monastic-visit-popup__backdrop" data-monastic-visit-popup-close></div>

  <div
    class="monastic-visit-popup__dialog"
    role="dialog"
    aria-modal="true"
    aria-labelledby="monastic-visit-popup-title"
    tabindex="-1"
  >
    <button
      class="monastic-visit-popup__close"
      type="button"
      data-monastic-visit-popup-close
      aria-label="{{ esc_attr__('Close monastic visit notice', 'sage') }}"
    >
      <span aria-hidden="true">&times;</span>
    </button>

    @if (! empty($image_html))
      <div class="monastic-visit-popup__image">
        <button
          class="monastic-visit-popup__image-trigger"
          type="button"
          data-monastic-popup-image-trigger
          aria-controls="monastic-visit-popup-image-viewer"
          aria-expanded="false"
          aria-haspopup="dialog"
          aria-label="{{ esc_attr__('View popup image larger', 'sage') }}"
        >
          {!! $image_html !!}
        </button>
      </div>
    @endif

    @if (! empty($eyebrow))
      <p class="monastic-visit-popup__eyebrow">{{ $eyebrow }}</p>
    @endif
    <h2 id="monastic-visit-popup-title" class="monastic-visit-popup__title">{{ $title }}</h2>
    <div class="monastic-visit-popup__content">
      {!! $body !!}
    </div>

    @if (! empty($button_label) && ! empty($button_url))
      <a
        class="monastic-visit-popup__button"
        href="{{ esc_url($button_url) }}"
        data-monastic-visit-popup-dismiss
      >
        {{ $button_label }}
      </a>
    @endif
  </div>

  @if (! empty($image_viewer_html))
    <div
      id="monastic-visit-popup-image-viewer"
      class="monastic-visit-popup__image-viewer"
      data-monastic-popup-image-viewer
      aria-hidden="true"
      hidden
    >
      <div class="monastic-visit-popup__image-viewer-backdrop" data-monastic-popup-image-close></div>
      <div
        class="monastic-visit-popup__image-viewer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="{{ esc_attr__('Expanded popup image', 'sage') }}"
        tabindex="-1"
      >
        <button
          class="monastic-visit-popup__image-viewer-close"
          type="button"
          data-monastic-popup-image-close
          aria-label="{{ esc_attr__('Close expanded popup image', 'sage') }}"
        >
          <span aria-hidden="true">&times;</span>
        </button>
        <div class="monastic-visit-popup__image-viewer-frame">
          {!! $image_viewer_html !!}
        </div>
      </div>
    </div>
  @endif
</div>
