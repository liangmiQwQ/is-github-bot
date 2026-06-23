import { lib } from '@liangmi/vp-config'

export default lib.exclude(['run', 'staged'], {
  run: {
    tasks: {
      ccheck: 'vp check',
      cpack: 'vp pack',
      ctest: 'vp test'
    }
  },
  pack: {
    entry: ['src/index.ts', 'src/cli.ts', 'src/github-action.ts'],
    dts: {
      tsgo: true
    },
    deps: {
      neverBundle: ['node:child_process', 'node:fs/promises', 'node:util']
    },
    exports: true,
    fixedExtension: true,
    platform: 'neutral'
  }
})
