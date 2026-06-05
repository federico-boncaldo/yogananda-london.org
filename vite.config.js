import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import laravel from 'laravel-vite-plugin'
import { wordpressPlugin, wordpressThemeJson } from '@roots/vite-plugin'

if (!process.env.APP_URL) {
  process.env.APP_URL = 'http://localhost/MAMP/yogananda-london.org'
}

export default defineConfig({
  base: process.env.SAGE_PUBLIC_PATH ?? '/wp-content/themes/sage/public/build/',
  plugins: [
    tailwindcss(),
    laravel({
      input: [
        'resources/assets/styles/main.scss',
        'resources/assets/scripts/main.js',
        'resources/assets/styles/editor.scss',
        'resources/assets/scripts/editor.js',
        'resources/assets/scripts/customizer.js',
      ],
      refresh: true,
      assets: [
        'resources/assets/images/**',
        'resources/assets/fonts/**',
      ],
    }),

    wordpressPlugin(),

    wordpressThemeJson({
      disableTailwindColors: false,
      disableTailwindFonts: false,
      disableTailwindFontSizes: false,
      disableTailwindBorderRadius: false,
    }),
  ],
  resolve: {
    alias: {
      '@scripts': '/resources/assets/scripts',
      '@styles': '/resources/assets/styles',
      '@fonts': '/resources/assets/fonts',
      '@images': '/resources/assets/images',
    },
  },
})
