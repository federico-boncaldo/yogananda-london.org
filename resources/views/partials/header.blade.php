<header class="banner">
  <a class="brand" href="{{ home_url('/') }}">
      <img alt="{{ get_bloginfo('name', 'display') }}" src="@asset('images/London_Centre_Logo_white.png')">
      <!-- <img alt="{{ get_bloginfo('name', 'display') }}" src="@asset('images/SRF_London_Centre_Logo.png')"> -->
  </a>

  <nav class="nav-primary">
    @if (has_nav_menu('primary_navigation'))
      {!! wp_nav_menu(['theme_location' => 'primary_navigation', 'menu_class' => 'nav']) !!}
    @endif

    <a href="https://www.facebook.com/YoganandaLondon" target="_blank" rel="noopener noreferrer" class="social-button">
      <img src="https://www.yoganandalondon.org/self-realisation-fellowship-img/facebook-icon.png" height="31" width="31">
    </a>
    <a href="https://www.instagram.com/yoganandalondon" target="_blank" rel="noopener noreferrer" class="social-button">
      <img src="https://www.yoganandalondon.org/self-realisation-fellowship-img/instagram-icon.png" height="31" width="31">
    </a>
  </nav>
</header>
