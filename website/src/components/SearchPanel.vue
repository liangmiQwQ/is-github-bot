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
  <section class="w-full max-w-230" aria-label="GitHub account checker">
    <form class="flex flex-col gap-2" @submit.prevent="emit('submit')">
      <div
        class="flex md:h-14 h-28 items-center gap-2 border border-neutral-200 rounded-xl bg-white px-4 focus-within:(border-neutral-300 ring-2 ring-black/8) duration-100 dark:(border-neutral-700 bg-black focus-within:border-neutral-700 focus-within:ring-white/16) max-sm:h-25 max-sm:p-4 max-sm:(flex-col items-stretch p-2)"
      >
        <span
          class="i-ph-magnifying-glass ml-1 shrink-0 text-neutral-500 max-sm:hidden dark:text-neutral-400"
          aria-hidden="true"
        />
        <input
          id="github-handle"
          v-model="query"
          class="min-w-0 flex-1 border-0 pb-0.2 text-lg bg-transparent text-sm text-black outline-0 placeholder:text-neutral-400 dark:text-white"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          placeholder="octocat"
        />
        <button
          class="h-8 min-w-18 rounded-md bg-black px-3 text-sm text-white font-600 disabled:(cursor-not-allowed opacity-40) enabled:(cursor-pointer hover:bg-neutral-800 active:scale-98) dark:(bg-white text-black enabled:hover:bg-neutral-200) max-sm:h-9"
          type="submit"
          :disabled="!canSubmit"
        >
          Check
        </button>
      </div>
    </form>

    <div
      v-if="loading"
      class="mt-4 flex items-center gap-3 text-left max-sm:(flex-col items-stretch)"
      aria-live="polite"
      aria-label="Fetching account"
    >
      <div class="skeleton-block h-14 w-14 shrink-0 rounded-md" />
      <div class="flex flex-1 flex-col gap-2">
        <div class="skeleton-block h-3 w-7/10 rounded-full" />
        <div class="skeleton-block h-3 rounded-full" />
        <div class="skeleton-block h-3 w-2/5 rounded-full" />
      </div>
    </div>

    <p
      v-else-if="error"
      class="mt-4 text-left text-sm text-red-600 font-500 dark:text-red-400"
      role="alert"
    >
      {{ error }}
    </p>

    <ResultCard v-else-if="result" :result="result" />
  </section>
</template>
