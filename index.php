<?php

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Contracts\View\View;

use function Roots\view;

$view = app('sage.view');
$data = app('sage.data');

if (! is_string($view)) {
    throw new UnexpectedValueException('Expected the Sage view name to be a string.');
}

if (! is_array($data) && ! $data instanceof Arrayable) {
    throw new UnexpectedValueException('Expected the Sage view data to be array-like.');
}

$template = view($view, $data);

if (! $template instanceof View) {
    throw new UnexpectedValueException('Expected Sage to resolve a renderable view.');
}

echo $template->render();
