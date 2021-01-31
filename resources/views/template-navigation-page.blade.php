{{--
  Template Name: Navigation Page Template
--}}

@extends('layouts.app')

<div class="navigation-page">
  @section('content')
    @while(have_posts()) @php the_post() @endphp
      @include('partials.page-header')
      @include('partials.content-page')
    @endwhile
  @endsection
<div>
