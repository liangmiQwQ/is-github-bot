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
    class="relative flex min-h-svh items-center justify-center bg-white px-5 pb-12 pt-28 text-black dark:bg-black dark:text-white max-sm:(items-start pt-24)"
  >
    <TopActions :mode="mode" @toggle-mode="toggleMode" @open-settings="openSettings" />

    <section
      class="flex w-full max-w-180 flex-col items-center text-center gap-10 pb-15"
      aria-labelledby="site-title"
    >
      <h1
        id="site-title"
        class="text-[clamp(2.75rem,8vw,5.5rem)] text-black font-850 leading-[0.95] dark:text-white"
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
