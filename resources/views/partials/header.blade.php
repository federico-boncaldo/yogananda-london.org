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
    <button class="btn-blue donate-button"><a href="https://www.srf-london.org.uk/self-realisation-fellowship-img/Donations_to_the_London_Centre_SRF-Dec-2018.pdf" target="_blank">Donate</a></button>
  </nav>
</header>
