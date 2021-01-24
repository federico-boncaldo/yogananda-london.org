<header class="banner">
  <a class="brand" href="{{ home_url('/') }}">
    <img alt="{{ get_bloginfo('name', 'display') }}" src="@asset('images/London_Centre_Logo_white.png')">
  </a>
  <nav class="nav-primary">
    @if (has_nav_menu('primary_navigation'))
      {!! wp_nav_menu(['theme_location' => 'primary_navigation', 'menu_class' => 'nav']) !!}
    @endif
    <button class="btn-orange"><a href="#">Donate</a></button>
  </nav>
</header>
