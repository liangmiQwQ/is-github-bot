import { isGitHubBot } from 'is-github-bot'
import type { GitHubBotStatus } from 'is-github-bot'

import type { ExtensionMessage, ExtensionResponse, PageContext } from './messages.ts'
import { readSettings } from './settings.ts'

interface CachedStatus {
  status: GitHubBotStatus | undefined
  checkedAt: number
}

const GITHUB_API = 'https://api.github.com'
const CACHE_KEY = 'status-cache'
const FIFTEEN_DAYS_IN_MS = 15 * 24 * 60 * 60 * 1000

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  void respondToMessage(message, sendResponse)
  return true
})

async function respondToMessage(
  message: unknown,
  sendResponse: (response: ExtensionResponse) => void
) {
  try {
    sendResponse(await handleMessage(message))
  } catch (error) {
    sendResponse({
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

async function handleMessage(message: unknown): Promise<ExtensionResponse> {
  if (!isMessage(message)) {
    return { ok: false, error: 'Unknown extension message.' }
  }

  if (message.type === 'get-settings') {
    return { ok: true, settings: await readSettings() }
  }

  if (message.type === 'check-user') {
    return {
      ok: true,
      status: await checkUser(message.username)
    }
  }

  if (message.type === 'close-spam') {
    await closeSpam(message.context, message.block)
    return { ok: true }
  }

  await blockUser(message.username)
  return { ok: true }
}

async function checkUser(username: string): Promise<GitHubBotStatus | undefined> {
  const normalizedUsername = normalizeUsername(username)
  if (!normalizedUsername) {
    return void 0
  }

  const cache = await readCache()
  const cached = cache[normalizedUsername]
  if (cached && Date.now() - cached.checkedAt < FIFTEEN_DAYS_IN_MS) {
    return cached.status
  }

  const settings = await readSettings()
  const status = await isGitHubBot(normalizedUsername, {
    token: settings.token || undefined
  })

  cache[normalizedUsername] = {
    status,
    checkedAt: Date.now()
  }
  await writeCache(cache)

  return status
}

async function closeSpam(context: PageContext, block: boolean) {
  const settings = await readSettings()
  const token = requireToken(settings.token)
  const prompt = block ? settings.closeAndBlockPrompt : settings.closeAsSpamPrompt
  const body = prompt.replaceAll('${username}', context.username).trim()

  if (body) {
    await fetchGitHub(
      `/repos/${encodeURIComponent(context.owner)}/${encodeURIComponent(context.repo)}/issues/${context.number}/comments`,
      token,
      {
        method: 'POST',
        body: JSON.stringify({ body })
      }
    )
  }

  await fetchGitHub(
    `/repos/${encodeURIComponent(context.owner)}/${encodeURIComponent(context.repo)}/issues/${context.number}`,
    token,
    {
      method: 'PATCH',
      body: JSON.stringify({ state: 'closed', state_reason: 'not_planned' })
    }
  )

  if (block) {
    await blockUser(context.username)
  }
}

async function blockUser(username: string) {
  const settings = await readSettings()
  const token = requireToken(settings.token)
  await fetchGitHub(`/user/blocks/${encodeURIComponent(username)}`, token, {
    method: 'PUT'
  })
}

async function fetchGitHub(path: string, token: string, init: RequestInit = {}) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`)
  }
}

async function readCache(): Promise<Partial<Record<string, CachedStatus>>> {
  const items = await chrome.storage.local.get(CACHE_KEY)
  const value = items[CACHE_KEY]
  if (!value || typeof value !== 'object') {
    return {}
  }
  return value as Partial<Record<string, CachedStatus>>
}

async function writeCache(cache: Partial<Record<string, CachedStatus>>) {
  await chrome.storage.local.set({ [CACHE_KEY]: cache })
}

function requireToken(token: string) {
  const normalizedToken = token.trim()
  if (!normalizedToken) {
    throw new Error('Set a GitHub token in extension settings first.')
  }
  return normalizedToken
}

function normalizeUsername(username: string) {
  return username.trim().replace(/^@/, '').toLowerCase()
}

function isMessage(message: unknown): message is ExtensionMessage {
  if (!message || typeof message !== 'object' || !('type' in message)) {
    return false
  }
  const { type } = message as { type: unknown }
  return (
    type === 'check-user' ||
    type === 'get-settings' ||
    type === 'close-spam' ||
    type === 'block-user'
  )
}
