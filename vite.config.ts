import { base } from '@liangmi/vp-config'

export default base({
  lint: {
    overrides: [
      {
        files: ['packages/is-github-bot/src/cli.ts', 'packages/is-github-bot/src/github-action.ts'],
        rules: {
          'no-console': 'off'
        }
      },
      {
        files: [
          'packages/chrome-extension/src/**/*.vue',
          'website/src/**/*.vue',
          'website/src/composables/*.ts'
        ],
        rules: {
          'unicorn/filename-case': 'off'
        }
      },
      {
        files: [
          'packages/chrome-extension/src/options.ts',
          'website/src/html.d.ts',
          'website/src/main.ts'
        ],
        rules: {
          'import/no-unassigned-import': 'off'
        }
      },
      {
        files: [
          'packages/chrome-extension/src/background.ts',
          'packages/chrome-extension/src/settings.ts'
        ],
        rules: {
          'no-template-curly-in-string': 'off'
        }
      },
      {
        files: ['packages/chrome-extension/vite.config.ts', 'website/vite.config.ts'],
        rules: {
          'new-cap': 'off'
        }
      },
      {
        files: ['website/middleware/*.ts'],
        rules: {
          'import/no-default-export': 'off'
        }
      }
    ]
  }
})
