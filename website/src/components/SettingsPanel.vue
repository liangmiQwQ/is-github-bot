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
      class="fixed inset-0 z-40 flex justify-end bg-slate-900/42 p-4 max-sm:p-0"
      role="presentation"
      @click.self="emit('close')"
    >
      <aside
        class="min-h-svh w-full max-w-100 border border-[var(--line)] rounded-lg bg-[var(--panel)] p-5 text-[var(--text)] shadow-[var(--shadow)] max-sm:rounded-0"
        aria-labelledby="settings-title"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="mb-3 text-xs text-[var(--muted)] font-800 tracking-[0.12em] uppercase">
              Settings
            </p>
            <h2 id="settings-title" class="m-0 text-[1.6rem] leading-tight">GitHub API</h2>
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

        <label class="mt-8 flex flex-col gap-2 text-left">
          <span class="text-sm text-[var(--muted)] font-800">Token</span>
          <input
            class="min-h-11 border border-[var(--line)] rounded-lg bg-[var(--bg)] px-3 text-[var(--text)] outline-0 focus:(border-[var(--primary)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_16%,transparent)])"
            :value="token"
            autocomplete="off"
            placeholder="github_pat_..."
            type="password"
            @input="updateToken"
          />
        </label>
      </aside>
    </div>
  </Teleport>
</template>
