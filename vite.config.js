import { defineConfig } from 'vite'
import { existsSync, mkdirSync, copyFileSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        currency: 'currency.html',
        anime: 'anime.html',
        waifu: 'waifu.html',
      },
    },
  },
  plugins: [
    {
      name: 'github-pages-clean-urls',
      closeBundle() {
        const outDir = resolve('dist')
        const pages = ['anime', 'currency', 'waifu']

        pages.forEach(page => {
          const htmlPath = resolve(outDir, `${page}.html`)
          const pageDir = resolve(outDir, page)

          if (existsSync(htmlPath)) {
            // Создаём папку, например, dist/anime/
            mkdirSync(pageDir, { recursive: true })
            // Копируем anime.html → anime/index.html
            copyFileSync(htmlPath, resolve(pageDir, 'index.html'))
            console.log(`Создано: ${page}/index.html`)
          }
        })
      }
    }
  ]
})