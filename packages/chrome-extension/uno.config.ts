import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind4,
  transformerVariantGroup
} from 'unocss'

export default defineConfig({
  presets: [presetWind4(), presetIcons({ scale: 1.2 }), presetAttributify()],
  shortcuts: {
    'icon-button':
      'inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent text-slate-700 transition hover:bg-slate-100 active:scale-96',
    'field-input':
      'w-full border border-slate-200 rounded-md bg-white px-3 text-sm text-slate-950 outline-0 transition focus:border-slate-400 focus:ring-2 focus:ring-slate-950/8',
    'panel-surface': 'border border-slate-200 rounded-md bg-white'
  },
  transformers: [transformerVariantGroup()]
})
