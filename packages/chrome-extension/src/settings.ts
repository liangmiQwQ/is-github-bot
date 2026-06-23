export interface ExtensionSettings {
  checkIssueAuthor: boolean
  skipCollaboratorMember: boolean
  skipContributor: boolean
  showSpamButtons: boolean
  closeAsSpamPrompt: string
  closeAndBlockPrompt: string
  checkProfileAuthor: boolean
  showProfileBlockButton: boolean
  token: string
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  checkIssueAuthor: true,
  skipCollaboratorMember: true,
  skipContributor: false,
  showSpamButtons: true,
  closeAsSpamPrompt: 'Closing as spam from @${username}.',
  closeAndBlockPrompt: 'Closing as spam and blocking @${username}.',
  checkProfileAuthor: true,
  showProfileBlockButton: false,
  token: ''
}

const SETTINGS_KEY = 'settings'

export async function readSettings(): Promise<ExtensionSettings> {
  const items = await chrome.storage.local.get(SETTINGS_KEY)
  return normalizeSettings(items[SETTINGS_KEY])
}

export async function writeSettings(settings: ExtensionSettings) {
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings })
}

function normalizeSettings(value: unknown): ExtensionSettings {
  if (!isRecord(value)) {
    return DEFAULT_SETTINGS
  }

  return {
    ...DEFAULT_SETTINGS,
    ...value,
    token: typeof value.token === 'string' ? value.token : ''
  }
}

function isRecord(value: unknown): value is Partial<ExtensionSettings> {
  return typeof value === 'object' && value !== null
}
