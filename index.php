<?php

use Illuminate\Contracts\View\View;

$view = view(app('sage.view'), app('sage.data'));

if ($view instanceof View) {
    echo $view->render();
}
