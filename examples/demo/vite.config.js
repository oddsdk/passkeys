import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'
import svgr from 'vite-plugin-svgr'

/** @type {Partial<import('vite-plugin-pwa').VitePWAOptions>} */
const pwaOptions = {
  registerType: 'prompt',
  strategies: 'injectManifest',
  mode: 'development',
  base: '/',
  includeAssets: ['favicon.ico', '*.jpg', '*.png', '*.svg'],
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
  },
  filename: 'sw.ts',
  // devOptions: {
  //   enabled: true,
  //   type: 'module',
  //   navigateFallback: 'index.html',
  // },

  manifest: {
    name: 'Odd Passkeys Demo',
    short_name: 'Odd Passkeys',
    description: 'Demo showcasing ODD SDK Passkeys authentication.',
    categories: ['webauthn', 'passkeys', 'odd'],
    orientation: 'any',
    screenshots: [
      {
        src: 'screen2.png',
        type: 'image/png',
        sizes: '1170x2532',
        // @ts-ignore
        form_factor: 'narrow',
        label: 'Login screen',
      },
      {
        src: 'screen1.png',
        type: 'image/png',
        sizes: '1170x2532',
        // @ts-ignore
        form_factor: 'narrow',
        label: 'Home screen',
      },
    ],
    display: 'standalone',
    theme_color: '#F16583',
    background_color: '#484A65',
    // @ts-ignore
    share_target: {
      action: '/?share-target',
      method: 'POST',
      enctype: 'multipart/form-data',
      params: {
        files: [
          {
            name: 'file',
            accept: ['image/*'],
          },
        ],
      },
    },
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/maskable_icon_x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/maskable_icon_x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  },
}

// https://vitejs.dev/config/
// @ts-ignore
export default defineConfig(({ command, mode }) => {
  return command === 'serve'
    ? {
        build: {
          sourcemap: true,
        },
        plugins: [preact(), svgr(), VitePWA(pwaOptions)],
      }
    : {
        plugins: [
          preact(),
          svgr(),
          VitePWA({ ...pwaOptions, mode: 'production' }),
        ],
      }
})
