import { fileURLToPath } from 'node:url'

import { liangmi } from '@liangmi/vp-config'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import type { PluginOption } from 'vite-plus'
import { voidPlugin } from 'void'

export default await liangmi({
  resolve: {
    alias: {
      'is-github-bot': fileURLToPath(
        new URL('../packages/is-github-bot/src/index.ts', import.meta.url)
      )
    }
  },
  plugins: [...voidPlugin(), vue(), UnoCSS()] as unknown as PluginOption[]
})
