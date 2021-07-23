<header class="banner">
  <a class="brand" href="{{ home_url('/') }}">
    @if (get_page_template_slug() == 'views/template-navigation-page.blade.php')
      <img alt="{{ get_bloginfo('name', 'display') }}" src="@asset('images/London_Centre_Logo_white.png')">
    @else
      <img alt="{{ get_bloginfo('name', 'display') }}" src="@asset('images/SRF_London_Centre_Logo.png')">
    @endif
  </a>

  <nav class="nav-primary">
    @if (has_nav_menu('primary_navigation'))
      {!! wp_nav_menu(['theme_location' => 'primary_navigation', 'menu_class' => 'nav']) !!}
    @endif

    <a href="https://www.facebook.com/SRFLondon" target="_blank" class="social-button">
      <img src="https://www.yoganandalondon.org/self-realisation-fellowship-img/facebook-icon.png" height="31" width="31">
    </a>
    <a href="https://www.instagram.com/srf_london_centre" target="_blank" class="social-button">
      <img src="https://www.yoganandalondon.org/self-realisation-fellowship-img/instagram-icon.png" height="31" width="31">
    </a>

    <button class="btn-blue donate-button"><a href="https://www.srf-london.org.uk/self-realisation-fellowship-img/Donations_to_the_London_Centre_SRF-Dec-2018.pdf" target="_blank">Donate</a></button>
  </nav>
</header>
