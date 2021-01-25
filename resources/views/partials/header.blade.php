<header class="banner {{ is_front_page() ? 'front-page':'' }}">
  <a class="brand" href="{{ home_url('/') }}">
    @if (is_front_page())
      <img alt="{{ get_bloginfo('name', 'display') }}" src="@asset('images/London_Centre_Logo_white.png')">
    @else
    <img alt="{{ get_bloginfo('name', 'display') }}" src="@asset('images/SRF_London_Centre_Logo.png')">
    @endif
  </a>

  <nav class="nav-primary {{ is_front_page() ? 'front-page':'' }}">
    @if (has_nav_menu('primary_navigation'))
      {!! wp_nav_menu(['theme_location' => 'primary_navigation', 'menu_class' => 'nav']) !!}
    @endif
    <button class="btn-orange donate-button"><a href="#">Donate</a></button>
  </nav>
</header>
