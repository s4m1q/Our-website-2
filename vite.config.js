import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Our-website-2',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: 'index.html',
        currency: 'currency.html',
        anime: 'anime.html',
        waifu: 'waifu.html',
      },
    },
  },
})