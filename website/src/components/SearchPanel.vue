<script setup lang="ts">
import type { BotCheckResult } from "../composables/useBotCheck";
import ResultCard from "./ResultCard.vue";
import { computed } from "vue";

const query = defineModel<string>({ required: true });

const props = defineProps<{
  error: string;
  loading: boolean;
  result: BotCheckResult | undefined;
}>();

const emit = defineEmits<{
  submit: [];
}>();

const canSubmit = computed(() => query.value.trim().length > 0 && !props.loading);
</script>

<template>
  <section class="mt-9 w-full max-w-160" aria-label="GitHub account checker">
    <form class="flex flex-col gap-2.5" @submit.prevent="emit('submit')">
      <label class="self-start text-sm text-[var(--muted)] font-700" for="github-handle">
        GitHub username
      </label>
      <div
        class="flex min-h-16 items-center gap-3 border border-[var(--line)] rounded-lg bg-[var(--panel)] p-2 shadow-[var(--shadow)] focus-within:(border-[var(--primary)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_16%,transparent)]) max-sm:(flex-col items-stretch)"
      >
        <span
          class="i-ph-magnifying-glass ml-2.5 shrink-0 text-[var(--muted)] max-sm:hidden"
          aria-hidden="true"
        />
        <input
          id="github-handle"
          v-model="query"
          class="min-w-0 flex-1 border-0 bg-transparent text-[var(--text)] text-[1.08rem] outline-0 placeholder:text-[color-mix(in_srgb,var(--muted)_70%,transparent)]"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          placeholder="octocat"
        />
        <button
          class="min-w-24 self-stretch border-0 rounded-md bg-[var(--primary)] px-5 text-[var(--primary-text)] font-800 disabled:(cursor-not-allowed opacity-48) enabled:(cursor-pointer hover:-translate-y-0.25) max-sm:min-h-11"
          type="submit"
          :disabled="!canSubmit"
        >
          Check
        </button>
      </div>
    </form>

    <div
      v-if="loading"
      class="panel-surface mt-4 flex items-center gap-4 p-4 text-left max-sm:(flex-col items-stretch)"
      aria-live="polite"
      aria-label="Fetching account"
    >
      <div class="skeleton-block h-18 w-18 shrink-0 rounded-lg max-sm:(h-16 w-16)" />
      <div class="flex flex-1 flex-col gap-2.5">
        <div class="skeleton-block h-3.5 w-7/10 rounded-full" />
        <div class="skeleton-block h-3.5 rounded-full" />
        <div class="skeleton-block h-3.5 w-2/5 rounded-full" />
      </div>
    </div>

    <p
      v-else-if="error"
      class="panel-surface mt-4 p-4 text-left text-[var(--danger)] font-700"
      role="alert"
    >
      {{ error }}
    </p>

    <ResultCard v-else-if="result" :result="result" />
  </section>
</template>
