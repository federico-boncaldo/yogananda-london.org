<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Roots\Acorn\Sage\SageServiceProvider;

class ThemeServiceProvider extends SageServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        parent::boot();

        Blade::directive('asset', function ($asset) {
            return "<?php echo esc_url(\\App\\asset_path({$asset})); ?>";
        });
    }
}
