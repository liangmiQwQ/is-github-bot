<script setup lang="ts">
import { shallowRef } from 'vue'

import SearchPanel from './components/SearchPanel.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import TopActions from './components/TopActions.vue'
import { useBotCheck } from './composables/useBotCheck.ts'
import { useColorMode } from './composables/useColorMode.ts'
import { useSettings } from './composables/useSettings.ts'

const settingsOpen = shallowRef(false)
const { mode, toggleMode } = useColorMode()
const { option, setToken } = useSettings()
const { query, result, loading, error, check } = useBotCheck()

function openSettings() {
  settingsOpen.value = true
}

function closeSettings() {
  settingsOpen.value = false
}

const voidLogoSrc =
  "data:image/svg+xml,%3csvg%20width='270'%20height='58'%20viewBox='0%200%20270%2058'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3ccircle%20cx='262'%20cy='48.96'%20r='8'%20fill='white'/%3e%3cpath%20d='M20.72%200.960003L35.52%2041.28L50.08%200.960003H70L47.92%2056.96H22.32L0.24%200.960003H20.72ZM106.542%2057.92C82.9419%2057.92%2070.6219%2048%2070.6219%2028.96C70.6219%209.92001%2082.9419%205.72205e-06%20106.542%205.72205e-06C130.142%205.72205e-06%20142.542%209.92001%20142.542%2028.96C142.542%2048%20130.142%2057.92%20106.542%2057.92ZM106.542%2044.08C117.662%2044.08%20122.862%2039.36%20122.862%2028.96C122.862%2018.48%20117.662%2013.76%20106.542%2013.76C95.4219%2013.76%2090.2219%2018.48%2090.2219%2028.96C90.2219%2039.36%2095.4219%2044.08%20106.542%2044.08ZM152.265%2056.96V0.960003H171.465V56.96H152.265ZM184.687%2056.96V0.960003H219.887C239.327%200.960003%20250.447%209.84%20250.447%2028.96C250.447%2048.16%20239.247%2056.96%20219.807%2056.96H184.687ZM230.767%2028.96C230.767%2018.48%20226.287%2014.56%20217.167%2014.56H203.887V43.36H217.167C226.287%2043.36%20230.767%2039.44%20230.767%2028.96Z'%20fill='white'/%3e%3c/svg%3e"
</script>

<template>
  <a
    href="https://void.cloud/"
    target="_blank"
    rel="noopener"
    aria-label="Built with Void"
    fixed
    right-4
    bottom-4
    z-50
    flex
    items-center
    gap-2
    text-xs
    text-white
    class="mix-blend-difference opacity-60 transition-opacity hover:opacity-100"
  >
    <span font-label>Built with</span>
    <img :src="voidLogoSrc" alt="Void" h-3 w-auto />
  </a>
  <main
    class="relative flex min-h-svh items-center justify-center bg-white px-5 pb-12 pt-28 text-black dark:bg-black dark:text-white max-sm:(items-start pt-24)"
  >
    <TopActions
      :mode="mode ? 'dark' : 'light'"
      @toggle-mode="toggleMode"
      @open-settings="openSettings"
    />

    <section
      class="flex w-full max-w-200 flex-col items-center text-center gap-10 pb-15"
      aria-labelledby="site-title"
    >
      <h1
        id="site-title"
        class="text-[clamp(2.75rem,8vw,5.5rem)] opacity-90 text-black font-850 leading-[0.95] dark:text-white"
      >
        is-github-bot
      </h1>

      <SearchPanel
        v-model="query"
        :error="error"
        :loading="loading"
        :result="result"
        @submit="check(option)"
      />
    </section>

    <SettingsPanel
      :open="settingsOpen"
      :token="option.token"
      @close="closeSettings"
      @update-token="setToken"
    />
  </main>
</template>
