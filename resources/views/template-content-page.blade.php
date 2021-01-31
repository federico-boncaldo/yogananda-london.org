{{--
  Template Name: Content Page Template
--}}

@extends('layouts.app')


@section('content')
  <div class="content-page">
    @while(have_posts()) @php the_post() @endphp
      @include('partials.page-header')
      <div class="image-bar">
        {{ the_post_thumbnail() }}
      </div>
      @include('partials.content-page')
    @endwhile
  </div>
@endsection

