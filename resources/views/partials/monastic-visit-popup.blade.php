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
      aria-label="Close monastic visit notice"
    >
      <span aria-hidden="true">&times;</span>
    </button>

    @if (! empty($image_html))
      <div class="monastic-visit-popup__image">
        {!! $image_html !!}
      </div>
    @endif

    <p class="monastic-visit-popup__eyebrow">{{ __('Upcoming visit', 'sage') }}</p>
    <h2 id="monastic-visit-popup-title" class="monastic-visit-popup__title">{{ $title }}</h2>
    <div class="monastic-visit-popup__content">
      {!! $body !!}
    </div>

    @if (! empty($button_label) && ! empty($button_url))
      <a class="monastic-visit-popup__button" href="{{ esc_url($button_url) }}">
        {{ $button_label }}
      </a>
    @endif
  </div>
</div>
