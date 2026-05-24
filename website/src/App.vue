<script setup lang="ts">
import SearchPanel from "./components/SearchPanel.vue";
import SettingsPanel from "./components/SettingsPanel.vue";
import TopActions from "./components/TopActions.vue";
import { useBotCheck } from "./composables/useBotCheck";
import { useColorMode } from "./composables/useColorMode";
import { useSettings } from "./composables/useSettings";
import { shallowRef } from "vue";

const settingsOpen = shallowRef(false);
const { mode, toggleMode } = useColorMode();
const { option, setToken } = useSettings();
const { query, result, loading, error, check } = useBotCheck();

function openSettings() {
  settingsOpen.value = true;
}

function closeSettings() {
  settingsOpen.value = false;
}
</script>

<template>
  <main
    class="relative flex min-h-svh items-center justify-center px-5 pb-12 pt-28 text-[var(--text)] max-sm:(items-start pt-24)"
  >
    <TopActions :mode="mode" @toggle-mode="toggleMode" @open-settings="openSettings" />

    <section
      class="flex w-full max-w-180 flex-col items-center text-center"
      aria-labelledby="site-title"
    >
      <p class="mb-3 text-xs text-[var(--muted)] font-800 tracking-[0.12em] uppercase">
        Open source maintainer tooling
      </p>
      <h1
        id="site-title"
        class="text-[clamp(2.75rem,8vw,5.5rem)] text-[var(--primary-strong)] font-850 leading-[0.95]"
      >
        is-github-bot
      </h1>
      <p class="mt-5 max-w-136 text-[var(--muted)] text-[1.05rem] leading-7">
        Check public GitHub account signals locally in your browser.
      </p>

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
