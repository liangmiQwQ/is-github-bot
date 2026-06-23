import type { GitHubBotStatus, IsGitHubBotOption } from 'is-github-bot'
import { isGitHubBot } from 'is-github-bot'
import { shallowRef } from 'vue'

interface GitHubProfileResponse {
  avatar_url: string
  bio: string | null
  company: string | null
  created_at: string
  followers: number
  following: number
  blog: string | null
  html_url: string
  login: string
  location: string | null
  name: string | null
  public_repos: number
}

export interface BotCheckProfile {
  avatarUrl: string
  bio: string
  company: string
  createdAt: string
  followers: number
  following: number
  homepage: string
  login: string
  location: string
  name: string
  publicRepos: number
  url: string
}

export interface BotCheckResult {
  profile: BotCheckProfile
  status: GitHubBotStatus | 'unresolved'
}

const GITHUB_API = 'https://api.github.com'

export function useBotCheck() {
  const query = shallowRef('')
  const result = shallowRef<BotCheckResult>()
  const loading = shallowRef(false)
  const errorMessage = shallowRef('')
  let requestId = 0

  async function check(option: IsGitHubBotOption) {
    const handle = normalizeHandle(query.value)
    if (!handle || loading.value) {
      return
    }

    const currentRequestId = requestId + 1
    requestId = currentRequestId
    loading.value = true
    errorMessage.value = ''
    result.value = undefined

    try {
      const [profile, status] = await Promise.all([
        fetchGitHubProfile(handle, option.token),
        isGitHubBot(handle, option)
      ])

      if (currentRequestId !== requestId) {
        return
      }

      result.value = {
        profile,
        status: status ?? 'unresolved'
      }
    } catch (error) {
      if (currentRequestId !== requestId) {
        return
      }
      errorMessage.value = error instanceof Error ? error.message : 'Unable to check this account.'
    } finally {
      if (currentRequestId === requestId) {
        loading.value = false
      }
    }
  }

  return {
    error: errorMessage,
    loading,
    query,
    result,
    check
  }
}

function normalizeHandle(handle: string) {
  return handle.trim().replace(/^@/, '').toLowerCase()
}

async function fetchGitHubProfile(handle: string, token: string | undefined) {
  const response = await fetch(`${GITHUB_API}/users/${encodeURIComponent(handle)}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  })

  if (response.status === 404) {
    throw new Error('GitHub user not found.')
  }

  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`)
  }

  const profile = (await response.json()) as GitHubProfileResponse

  return {
    avatarUrl: profile.avatar_url,
    bio: profile.bio ?? '',
    company: profile.company ?? '',
    createdAt: profile.created_at,
    followers: profile.followers,
    following: profile.following,
    homepage: normalizeHomepage(profile.blog),
    login: profile.login,
    location: profile.location ?? '',
    name: profile.name ?? '',
    publicRepos: profile.public_repos,
    url: profile.html_url
  }
}

function normalizeHomepage(homepage: string | null) {
  const value = homepage?.trim()
  if (!value) {
    return ''
  }

  if (/^https?:\/\//i.test(value)) {
    return value
  }

  return `https://${value}`
}
