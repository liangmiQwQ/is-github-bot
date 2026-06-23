import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'

export default defineConfig({
  presets: [presetWind4(), presetIcons({ scale: 1.2 }), presetTypography(), presetAttributify()],
  shortcuts: {
    'icon-button':
      'inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent text-neutral-900 transition hover:bg-neutral-100 active:scale-96 dark:text-neutral-50 dark:hover:bg-neutral-900',
    'void-link':
      'inline-flex h-9 items-center justify-center rounded-md bg-transparent px-2.5 text-sm text-neutral-700 font-600 no-underline transition hover:bg-neutral-100 hover:text-neutral-950 active:scale-96 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white',
    'panel-surface':
      'border border-neutral-200 rounded-md bg-white dark:border-neutral-800 dark:bg-black',
    'status-pill':
      'inline-flex shrink-0 items-center gap-1.5 rounded-full bg-neutral-950 px-2.5 py-1.5 text-xs text-white font-700 dark:bg-white dark:text-black',
    'skeleton-block': 'relative overflow-hidden bg-neutral-100 after:shimmer dark:bg-neutral-900',
    'after:shimmer':
      'after:absolute after:inset-0 after:content-empty after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/80 after:to-transparent dark:after:via-neutral-700/40'
  },
  theme: {
    animation: {
      keyframes: {
        shimmer: '{from{transform:translateX(-100%)}to{transform:translateX(100%)}}'
      },
      durations: {
        shimmer: '1.2s'
      },
      timingFns: {
        shimmer: 'linear'
      },
      counts: {
        shimmer: 'infinite'
      }
    }
  },
  transformers: [transformerDirectives(), transformerVariantGroup()]
})
