<script setup lang="ts">
defineProps<{
  mode: "dark" | "light";
}>();

const emit = defineEmits<{
  openSettings: [];
  toggleMode: [];
}>();
</script>

<template>
  <nav
    class="fixed right-5 top-5 z-20 flex items-center gap-2 max-sm:(left-3 right-3 justify-end)"
    aria-label="Page actions"
  >
    <button
      class="icon-button"
      type="button"
      :aria-label="mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
      @click="emit('toggleMode')"
    >
      <span :class="mode === 'dark' ? 'i-ph-sun' : 'i-ph-moon'" aria-hidden="true" />
    </button>

    <a
      class="icon-button"
      href="https://github.com/liangmiQwQ/is-github-bot"
      rel="noreferrer"
      target="_blank"
      aria-label="Open GitHub repository"
    >
      <span class="i-ph-github-logo" aria-hidden="true" />
    </a>

    <button
      class="icon-button"
      type="button"
      aria-label="Open settings"
      @click="emit('openSettings')"
    >
      <span class="i-ph-gear-six" aria-hidden="true" />
    </button>
  </nav>
</template>
