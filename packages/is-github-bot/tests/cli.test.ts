import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

import { expect, it } from 'vite-plus/test'

// oxlint-disable-next-line typescript/strict-void-return -- Node's promisify types do not model execFile's callback overload.
const execFileAsync = promisify(execFile)
const packageDir = fileURLToPath(new URL('..', import.meta.url))

it('prints a formatted result for one handle', async () => {
  const { stdout } = await execFileAsync(
    process.execPath,
    ['--experimental-strip-types', 'src/cli.ts', '--', 'github-actions'],
    { cwd: packageDir }
  )

  const plainStdout = stripAnsi(stdout)
  expect(plainStdout).toContain('@github-actions is a skipped account')
})

it('rejects multiple handles from the CLI', async () => {
  const result = execFileAsync(
    process.execPath,
    ['--experimental-strip-types', 'src/cli.ts', '--', 'github-actions', 'renovate'],
    { cwd: packageDir }
  )

  await expect(result).rejects.toMatchObject({
    stderr: expect.stringContaining('Only one GitHub account can be checked at a time.')
  })
})

it('prints CLI argument errors without a stack trace', async () => {
  const result = execFileAsync(
    process.execPath,
    ['--experimental-strip-types', 'src/cli.ts', '--', 'github-actions', '--token'],
    { cwd: packageDir }
  )

  await expect(result).rejects.toMatchObject({
    stderr: expect.stringContaining('option `--token <token>` value is missing')
  })
  await expect(result).rejects.not.toMatchObject({
    stderr: expect.stringContaining('CACError')
  })
  await expect(result).rejects.not.toMatchObject({
    stderr: expect.stringContaining('at ')
  })
})

function stripAnsi(value: string) {
  return value.replaceAll(new RegExp(`${String.fromCodePoint(27)}\\[[0-9;]*m`, 'g'), '')
}
