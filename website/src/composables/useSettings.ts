import { useLocalStorage } from '@vueuse/core'
import type { IsGitHubBotOption } from 'is-github-bot'
import { computed } from 'vue'

const STORAGE_KEY = 'is-github-bot-settings'

export function useSettings() {
  const settings = useLocalStorage<Required<Pick<IsGitHubBotOption, 'token'>>>(STORAGE_KEY, {
    token: ''
  })
  const option = computed(() => settings.value)

  function setToken(token: string) {
    settings.value = {
      token
    }
  }

  return {
    option,
    setToken
  }
}
