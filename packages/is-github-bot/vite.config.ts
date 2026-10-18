import { liangmi } from '@liangmi/vp-config'

export default await liangmi({
  pack: {
    entry: ['src/index.ts', 'src/cli.ts', 'src/github-action.ts'],
    deps: {
      neverBundle: ['node:child_process', 'node:fs/promises', 'node:util']
    },
    platform: 'neutral'
  }
})
