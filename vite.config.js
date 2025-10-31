import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
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
