# SRF London Sage Theme

This theme is based on Roots Sage 11.2.1 and preserves the SRF London Blade templates, Bootstrap 4 styling, and WordPress theme functionality from the previous Sage 9 build.

## Requirements

- WordPress 6.6 or newer
- PHP 8.3 or newer
- Composer 2
- Node.js `^20.19.0 || >=22.12.0`
- npm

## Setup

```sh
composer install
npm install
```

## Development

```sh
npm run dev
```

The Vite dev URL defaults to the historical local URL from the Sage 9 config:

```sh
APP_URL=http://localhost/MAMP/yogananda-london.org npm run dev
```

For non-Bedrock production paths, the Vite base path defaults to `/wp-content/themes/sage/public/build/`. Override it if the deployed theme directory differs:

```sh
SAGE_PUBLIC_PATH=/wp-content/themes/your-theme/public/build/ npm run build
```

## Build And Test

```sh
npm test
npm run build
composer validate --strict
./vendor/bin/pint --test
```

## Structure

- `functions.php`, `index.php`, `style.css`: Sage 11 root theme entry files
- `app/`: PHP setup, filters, helpers, service provider, and view composers
- `resources/views/`: Blade templates and partials
- `resources/assets/`: existing SCSS, JavaScript, images, and fonts
- `public/`: Vite build output, ignored except for `.gitkeep`
