<header class="banner">
  <a class="brand" href="{{ home_url('/') }}">
    <img alt="{{ get_bloginfo('name', 'display') }}" src="@asset('images/SRF_London_Centre_Logo.png')">
  </a>
  <nav class="nav-primary">
    @if (has_nav_menu('primary_navigation'))
      {!! wp_nav_menu(['theme_location' => 'primary_navigation', 'menu_class' => 'nav']) !!}
    @endif
  </nav>
</header>
