{{--
  Template Name: Navigation Page Template
--}}

@extends('layouts.app')

<div class="navigation-page">
  @section('content')
    @while(have_posts()) @php the_post() @endphp
      <div class="header-section">
        {{ the_post_thumbnail() }}
        <div class="overlay-title">
          <p class="quote">{{ get_post(get_post_thumbnail_id())->post_excerpt }}</p>
          <p class="quote-author">{{ get_post(get_post_thumbnail_id())->post_content }}</p>
        </div>
      </div>
      
      @include('partials.content-page')
    @endwhile
  @endsection
<div>
