{{--
  Template Name: Donation Template
--}}

@extends('layouts.app')

@section('page_wrapper', 'content-page donation-page')

@section('content')
  @while(have_posts()) @php the_post() @endphp
    <article @php post_class('donation') @endphp>
      <header class="donation__header">
        <p class="donation__eyebrow">{{ __('Support the London Centre', 'sage') }}</p>
        <h1>{{ get_the_title() }}</h1>
        <p class="donation__intro">
          {{ __('Your donation helps maintain the London Centre and supports meditation services, retreats, study groups, and the welcoming space offered to devotees and visitors.', 'sage') }}
        </p>
      </header>

      <div class="donation__layout">
        <form class="donation__form" aria-label="{{ esc_attr__('Donation form', 'sage') }}">
          <section class="donation__section" aria-labelledby="donation-amount-heading">
            <div class="donation__section-header">
              <span class="donation__step">1</span>
              <h2 id="donation-amount-heading">{{ __('Choose an amount', 'sage') }}</h2>
            </div>

            <fieldset class="donation__amounts">
              <legend class="screen-reader-text">{{ __('Donation amount', 'sage') }}</legend>

              @foreach (['10', '25', '50', '108'] as $amount)
                <label class="donation__amount">
                  <input type="radio" name="donation_amount" value="{{ esc_attr($amount) }}" @checked($amount === '25')>
                  <span>£{{ $amount }}</span>
                </label>
              @endforeach
            </fieldset>

            <label class="donation__field">
              <span>{{ __('Or enter another amount', 'sage') }}</span>
              <span class="donation__currency-field">
                <span aria-hidden="true">£</span>
                <input type="number" min="1" step="1" inputmode="numeric" name="custom_amount" placeholder="75">
              </span>
            </label>
          </section>

          <section class="donation__section" aria-labelledby="donor-details-heading">
            <div class="donation__section-header">
              <span class="donation__step">2</span>
              <h2 id="donor-details-heading">{{ __('Your details', 'sage') }}</h2>
            </div>

            <div class="donation__fields-grid">
              <label class="donation__field">
                <span>{{ __('First name', 'sage') }}</span>
                <input type="text" name="first_name" autocomplete="given-name">
              </label>

              <label class="donation__field">
                <span>{{ __('Last name', 'sage') }}</span>
                <input type="text" name="last_name" autocomplete="family-name">
              </label>

              <label class="donation__field donation__field--wide">
                <span>{{ __('Email address', 'sage') }}</span>
                <input type="email" name="email" autocomplete="email">
              </label>
            </div>
          </section>

          <section class="donation__section donation__section--gift-aid" aria-labelledby="gift-aid-heading">
            <div class="donation__section-header">
              <span class="donation__step">3</span>
              <h2 id="gift-aid-heading">{{ __('Gift Aid', 'sage') }}</h2>
            </div>

            <label class="donation__gift-aid-choice">
              <input type="checkbox" name="gift_aid">
              <span>
                {{ __('I am a UK taxpayer and would like the London Centre of Self-Realization Fellowship to claim Gift Aid on this donation, any donations I make in the future, and any donations I have made in the past four years.', 'sage') }}
              </span>
            </label>

            <p class="donation__small-print">
              {{ __('I understand that if I pay less Income Tax and/or Capital Gains Tax than the amount of Gift Aid claimed on all my donations in that tax year, it is my responsibility to pay any difference.', 'sage') }}
            </p>

            <div class="donation__fields-grid">
              <label class="donation__field">
                <span>{{ __('Address line 1', 'sage') }}</span>
                <input type="text" name="address_line_1" autocomplete="address-line1">
              </label>

              <label class="donation__field">
                <span>{{ __('Town or city', 'sage') }}</span>
                <input type="text" name="address_city" autocomplete="address-level2">
              </label>

              <label class="donation__field">
                <span>{{ __('Postcode', 'sage') }}</span>
                <input type="text" name="postcode" autocomplete="postal-code">
              </label>
            </div>
          </section>

          <div class="donation__actions">
            <button type="button" class="donation__submit">
              {{ __('Continue to secure donation', 'sage') }}
            </button>
            <p>
              <a href="https://www.yoganandalondon.org/self-realisation-fellowship-img/Donations_to_the_London_Centre_SRF-Dec-2018.pdf" target="_blank" rel="noopener noreferrer">
                {{ __('Download the existing donation form', 'sage') }}
              </a>
            </p>
          </div>
        </form>

        <aside class="donation__summary" aria-labelledby="donation-summary-heading">
          <h2 id="donation-summary-heading">{{ __('How your donation helps', 'sage') }}</h2>
          <ul>
            <li>{{ __('Maintain the Centre for meditation and fellowship.', 'sage') }}</li>
            <li>{{ __('Support retreats, study groups, and services.', 'sage') }}</li>
            <li>{{ __('Help welcome newcomers to the teachings of Paramahansa Yogananda.', 'sage') }}</li>
          </ul>
          <p>
            {{ __('Thank you for supporting the spiritual work of the London Centre.', 'sage') }}
          </p>
        </aside>
      </div>
    </article>
  @endwhile
@endsection
