import type { GitHubBotStatus } from 'is-github-bot'

import type { ExtensionMessage, ExtensionResponse, PageContext } from './messages.ts'
import type { ExtensionSettings } from './settings.ts'

interface IssuePage {
  kind: 'issue'
  context: PageContext
  avatar: HTMLElement
  association: string | undefined
}

interface ProfilePage {
  kind: 'profile'
  username: string
  avatar: HTMLElement
}

const STATUS_COLORS = {
  human: '#16a34a7f',
  suspicious: '#eab3087f',
  bot: '#ef44447f'
} as const

const STYLE_ID = 'is-github-bot-style'
const OBSERVED_SELECTOR =
  "[data-testid='issue-body'], [data-testid='github-avatar'], .js-command-palette-pull-body, img.avatar-user"

let runTimer: ReturnType<typeof setTimeout> | undefined

scheduleRun()
observePage()

document.addEventListener('turbo:render', () => {
  scheduleRun()
})
document.addEventListener('turbo:load', () => {
  scheduleRun()
})

async function run() {
  injectStyle()

  const settingsResponse = await sendMessage({ type: 'get-settings' })
  if (!settingsResponse.ok || !('settings' in settingsResponse)) {
    return
  }

  const issuePage = parseIssuePage()
  if (issuePage && settingsResponse.settings.checkIssueAuthor) {
    await enhanceIssuePage(issuePage, settingsResponse.settings)
    return
  }

  const profilePage = parseProfilePage()
  if (profilePage && settingsResponse.settings.checkProfileAuthor) {
    await enhanceProfilePage(profilePage, settingsResponse.settings)
  }
}

async function enhanceIssuePage(page: IssuePage, settings: ExtensionSettings) {
  if (shouldSkipAuthor(page.context.username, page.association, settings)) {
    return
  }

  const status = await checkUser(page.context.username)
  if (!status) {
    return
  }

  outlineAvatar(page.avatar, status, 1)

  if (status === 'bot' && settings.showSpamButtons) {
    insertSpamButtons(page.context)
  }
}

async function enhanceProfilePage(page: ProfilePage, settings: ExtensionSettings) {
  const status = await checkUser(page.username)
  if (!status) {
    return
  }

  outlineAvatar(page.avatar, status, 2)

  if (status === 'bot' && settings.showProfileBlockButton) {
    insertProfileBlockButton(page.username)
  }
}

function parseIssuePage(): IssuePage | undefined {
  const match = /^\/([^/]+)\/([^/]+)\/(issues|pull)\/(\d+)/.exec(location.pathname)
  if (!match) {
    return undefined
  }

  return parseReactIssuePage(match) ?? parseClassicPullRequestPage(match)
}

function parseReactIssuePage(match: RegExpExecArray): IssuePage | undefined {
  const authorLink = document.querySelector<HTMLAnchorElement>(
    "[data-testid='issue-body-header-author']"
  )
  if (!authorLink) {
    return void 0
  }
  const username = authorLink.textContent.trim()
  if (!username || username.endsWith('[bot]')) {
    return void 0
  }

  const avatar =
    document.querySelector<HTMLElement>(
      `[aria-label="@${CSS.escape(username)}'s profile"] [data-testid='github-avatar']`
    ) ??
    document.querySelector<HTMLElement>(
      `a[href$="/${CSS.escape(username)}"] [data-testid='github-avatar']`
    )
  if (!avatar) {
    return void 0
  }

  const association = findAuthorAssociation(authorLink)

  return {
    kind: 'issue',
    context: {
      owner: match[1],
      repo: match[2],
      number: Number(match[4]),
      username
    },
    avatar,
    association
  }
}

function parseClassicPullRequestPage(match: RegExpExecArray): IssuePage | undefined {
  if (match[3] !== 'pull') {
    return undefined
  }

  const container = document.querySelector<HTMLElement>('.js-command-palette-pull-body')
  if (!container) {
    return undefined
  }

  const authorLink = container.querySelector<HTMLAnchorElement>('a.author[href]')
  const username = getUsernameFromProfilePath(authorLink?.getAttribute('href') ?? '')
  if (!authorLink || !username || authorLink.pathname.startsWith('/apps/')) {
    return undefined
  }

  const avatar =
    container.querySelector<HTMLElement>(`a[href='/${CSS.escape(username)}'] img.avatar`) ??
    document.querySelector<HTMLElement>(
      `.js-command-palette-pull-body a[href='/${CSS.escape(username)}'] img.avatar`
    )
  if (!avatar) {
    return undefined
  }

  const association = findAuthorAssociation(authorLink)

  return {
    kind: 'issue',
    context: {
      owner: match[1],
      repo: match[2],
      number: Number(match[4]),
      username
    },
    avatar,
    association
  }
}

function parseProfilePage(): ProfilePage | undefined {
  const match = /^\/([^/?#]+)\/?$/.exec(location.pathname)
  if (!match) {
    return undefined
  }
  if (document.querySelector("[itemscope][itemtype='http://schema.org/Organization']")) {
    return undefined
  }

  const profileMetadata = document.querySelector<HTMLMetaElement>(
    "meta[property='profile:username']"
  )
  const nickname = document.querySelector<HTMLElement>(".p-nickname[itemprop='additionalName']")
  const username = profileMetadata?.content ?? nickname?.textContent.trim()
  if (!username) {
    return void 0
  }

  const avatar =
    document.querySelector<HTMLElement>("img.avatar-user[itemprop='image']") ??
    document.querySelector<HTMLElement>('img.avatar.avatar-user.width-full')
  if (!avatar) {
    return undefined
  }

  return {
    kind: 'profile',
    username,
    avatar
  }
}

async function checkUser(username: string): Promise<GitHubBotStatus | undefined> {
  const response = await sendMessage({
    type: 'check-user',
    username
  })

  if (!response.ok || !('status' in response)) {
    return void 0
  }
  return response.status
}

function shouldSkipAuthor(
  username: string,
  association: string | undefined,
  settings: ExtensionSettings
) {
  if (username.endsWith('[bot]')) {
    return true
  }
  if (!association) {
    return false
  }

  const normalizedAssociation = association.toLowerCase()
  if (
    settings.skipCollaboratorMember &&
    (normalizedAssociation === 'collaborator' || normalizedAssociation === 'member')
  ) {
    return true
  }

  return settings.skipContributor && normalizedAssociation === 'contributor'
}

function outlineAvatar(avatar: HTMLElement, status: keyof typeof STATUS_COLORS, width: number) {
  avatar.dataset.isGithubBotStatus = status
  avatar.style.outline = `${width}px solid ${STATUS_COLORS[status]}`
  avatar.style.outlineOffset = '2px'
}

function insertSpamButtons(context: PageContext) {
  if (document.querySelector("[data-is-github-bot-actions='issue']")) {
    return
  }

  const container = findIssueActionContainer()
  if (!container) {
    return
  }

  const actions = document.createElement('div')
  actions.dataset.isGithubBotActions = 'issue'
  actions.className = 'is-github-bot-actions'
  actions.append(
    createActionButton('Close as spam', () => runCloseSpam(context, false)),
    createActionButton('Close and Block', () => runCloseSpam(context, true))
  )

  container.prepend(actions)
}

function insertProfileBlockButton(username: string) {
  if (document.querySelector("[data-is-github-bot-actions='profile']")) {
    return
  }

  const container =
    document.querySelector<HTMLElement>('.js-user-profile-follow-button') ??
    document.querySelector<HTMLElement>('.vcard-details')
  if (!container) {
    return
  }

  const actions = document.createElement('div')
  actions.dataset.isGithubBotActions = 'profile'
  actions.className = 'is-github-bot-profile-actions'
  actions.append(createActionButton('Block', () => runBlockUser(username)))

  container.after(actions)
}

function createActionButton(label: string, onClick: () => Promise<void>) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'is-github-bot-button'
  button.textContent = label
  button.addEventListener('click', () => {
    void handleActionClick(button, onClick)
  })
  return button
}

async function handleActionClick(button: HTMLButtonElement, onClick: () => Promise<void>) {
  button.disabled = true
  try {
    await onClick()
    button.textContent = 'Done'
  } catch (error) {
    button.disabled = false
    // oxlint-disable-next-line no-alert -- Extension content scripts have no shared application dialog.
    globalThis.alert(error instanceof Error ? error.message : String(error))
  }
}

async function runCloseSpam(context: PageContext, block: boolean) {
  const response = await sendMessage({
    type: 'close-spam',
    context,
    block
  })
  if (!response.ok) {
    throw new Error(response.error)
  }
  location.reload()
}

async function runBlockUser(username: string) {
  const response = await sendMessage({
    type: 'block-user',
    username
  })
  if (!response.ok) {
    throw new Error(response.error)
  }
}

function findIssueActionContainer() {
  const closeButton = [...document.querySelectorAll<HTMLButtonElement>('button')].find(button => {
    const label = button.textContent.trim().toLowerCase()
    return label === 'close issue' || label === 'close pull request'
  })
  return closeButton?.parentElement
}

function findAuthorAssociation(authorLink: HTMLElement): string | undefined {
  const header =
    authorLink.closest("[data-testid='issue-body']") ??
    authorLink.closest('.js-command-palette-pull-body')
  if (!header) {
    return void 0
  }

  return [...header.querySelectorAll<HTMLElement>('span, a')]
    .map(element => element.textContent.trim())
    .find(text => text === 'Collaborator' || text === 'Member' || text === 'Contributor')
}

function injectStyle() {
  if (document.getElementById(STYLE_ID)) {
    return
  }

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    .is-github-bot-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-right: 8px;
    }

    .is-github-bot-profile-actions {
      margin: 8px 0;
    }

    .is-github-bot-button {
      align-items: center;
      background: var(--button-default-bgColor-rest, #f6f8fa);
      border: 1px solid var(--button-default-borderColor-rest, #d0d7de);
      border-radius: 6px;
      color: var(--fgColor-default, #1f2328);
      cursor: pointer;
      display: inline-flex;
      font: inherit;
      font-size: 12px;
      font-weight: 600;
      height: 32px;
      justify-content: center;
      padding: 0 12px;
    }

    .is-github-bot-button:hover {
      background: var(--button-default-bgColor-hover, #f3f4f6);
    }

    .is-github-bot-button:disabled {
      cursor: wait;
      opacity: 0.65;
    }
  `
  document.head.append(style)
}

async function sendMessage(message: ExtensionMessage): Promise<ExtensionResponse> {
  return chrome.runtime.sendMessage<ExtensionResponse>(message)
}

function scheduleRun() {
  if (runTimer) {
    clearTimeout(runTimer)
  }
  runTimer = setTimeout(() => {
    void run()
  }, 100)
}

function observePage() {
  const root = document.documentElement

  const observer = new MutationObserver(mutations => {
    if (mutations.some(hasObservedNode)) {
      scheduleRun()
    }
  })
  observer.observe(root, {
    childList: true,
    subtree: true
  })
}

function hasObservedNode(mutation: MutationRecord) {
  return [...mutation.addedNodes].some(node => {
    if (!(node instanceof Element)) {
      return false
    }
    return node.matches(OBSERVED_SELECTOR) || Boolean(node.querySelector(OBSERVED_SELECTOR))
  })
}

function getUsernameFromProfilePath(path: string) {
  const match = /^\/([^/?#]+)\/?$/.exec(path)
  return match?.[1]
}
