import { expect, it, vi } from 'vite-plus/test'

import { getEventItem, hasHumanFollowUp, shouldCloseItem } from '../src/github-action.ts'
import type { GitHubActionInput } from '../src/github-action.ts'

it('reads issue or pull request items from GitHub event payloads', () => {
  expect(getEventItem({ issue: createItem(1) })?.number).toBe(1)
  expect(getEventItem({ pull_request: createItem(2) })?.number).toBe(2)
})

it('detects human follow-up comments after the original item', () => {
  const item = createItem(1, '2026-05-01T00:00:00Z')

  expect(
    hasHumanFollowUp(item, [
      {
        body: 'I can clarify.',
        created_at: '2026-05-02T00:00:00Z',
        user: {
          login: 'contributor',
          type: 'User'
        }
      }
    ])
  ).toBeTruthy()
})

it('ignores action marker comments and bot comments when checking follow-up', () => {
  const item = createItem(1, '2026-05-01T00:00:00Z')

  expect(
    hasHumanFollowUp(item, [
      {
        body: '<!-- is-github-bot -->',
        created_at: '2026-05-02T00:00:00Z',
        user: {
          login: 'github-actions',
          type: 'Bot'
        }
      },
      {
        body: 'Automated response.',
        created_at: '2026-05-03T00:00:00Z',
        user: {
          login: 'other-bot',
          type: 'Bot'
        }
      }
    ])
  ).toBeFalsy()
})

it('only closes items after the configured age', () => {
  vi.setSystemTime(new Date('2026-05-10T00:00:00Z'))

  const input = createInput({
    close: true,
    closeAfterDays: 3
  })

  expect(shouldCloseItem(input, createItem(1, '2026-05-06T00:00:00Z'))).toBeTruthy()
  expect(shouldCloseItem(input, createItem(1, '2026-05-08T00:00:00Z'))).toBeFalsy()

  vi.useRealTimers()
})

function createItem(number: number, createdAt = '2026-05-01T00:00:00Z') {
  return {
    number,
    created_at: createdAt,
    user: {
      login: 'contributor',
      type: 'User'
    }
  }
}

function createInput(input: Partial<GitHubActionInput> = {}): GitHubActionInput {
  return {
    token: 'token',
    repository: 'owner/repo',
    eventPath: 'event.json',
    labelBot: 'AI Bot',
    labelSuspicious: 'Suspicious AI',
    comment: false,
    commentMessage: '',
    close: false,
    closeAfterDays: 3,
    closeMessage: '',
    ...input
  }
}
