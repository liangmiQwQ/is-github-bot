<script setup lang="ts">
defineProps<{
  open: boolean;
  token: string;
}>();

const emit = defineEmits<{
  close: [];
  updateToken: [token: string];
}>();

function updateToken(event: Event) {
  emit("updateToken", (event.target as HTMLInputElement).value);
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-40 flex items-center justify-center bg-white/80 p-4 backdrop-blur-sm dark:bg-black/80"
      role="presentation"
      @click.self="emit('close')"
    >
      <section
        class="w-full max-w-108 border border-neutral-200 rounded-lg bg-white p-5 text-black shadow-2xl shadow-black/8 dark:border-neutral-800 dark:bg-black dark:text-white dark:shadow-white/8"
        aria-labelledby="settings-title"
        aria-modal="true"
        role="dialog"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p
              class="mb-2 text-xs text-neutral-500 font-600 tracking-[0.08em] uppercase dark:text-neutral-400"
            >
              Settings
            </p>
            <h2 id="settings-title" class="m-0 text-xl font-650 leading-tight">GitHub API</h2>
          </div>
          <button
            class="icon-button"
            type="button"
            aria-label="Close settings"
            @click="emit('close')"
          >
            <span class="i-ph-x" aria-hidden="true" />
          </button>
        </div>

        <label class="mt-6 flex flex-col gap-2 text-left">
          <span class="text-sm text-neutral-700 font-500 dark:text-neutral-300">Token</span>
          <input
            class="h-10 border transition-100 border-neutral-200 rounded-md bg-white px-3 text-sm text-black outline-0 focus:(border-neutral-300 ring-2 ring-black/8) dark:(border-neutral-700 bg-black text-white focus:border-neutral-700 focus:ring-white/16)"
            :value="token"
            autocomplete="off"
            placeholder="github_pat_..."
            type="password"
            @input="updateToken"
          />
        </label>
      </section>
    </div>
  </Teleport>
</template>
