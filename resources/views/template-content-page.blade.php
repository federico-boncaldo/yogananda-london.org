{{--
  Template Name: Content Page Template
--}}


@extends('layouts.app')

@section('page_wrapper', 'content-page')

@section('content')
  @while(have_posts()) @php the_post() @endphp
    <div class="header-section">
      {{ the_post_thumbnail() }}
    </div>
    @include('partials.page-header')
    @include('partials.content-page')
  @endwhile
@endsection
