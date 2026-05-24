<script setup lang="ts">
import type { BotCheckResult } from "../composables/useBotCheck";
import { computed } from "vue";

const props = defineProps<{
  result: BotCheckResult;
}>();

const statusIcon = computed(() => {
  if (props.result.status === "human") return "i-ph-check-circle";
  if (props.result.status === "bot") return "i-ph-robot";
  if (props.result.status === "suspicious") return "i-ph-warning-circle";
  return "i-ph-question";
});

const statusLabel = computed(() => {
  if (props.result.status === "human") return "Likely human";
  if (props.result.status === "bot") return "Likely bot";
  if (props.result.status === "suspicious") return "Suspicious";
  return "No verdict";
});

const statusClass = computed(() => {
  if (props.result.status === "bot") return "bg-red-600 text-white dark:bg-red-500 dark:text-white";
  if (props.result.status === "suspicious") return "bg-amber-500 text-black";
  return "";
});
</script>

<template>
  <article class="mt-5 flex items-center gap-3 text-left max-sm:(flex-col items-stretch)">
    <img
      class="h-14 w-14 shrink-0 rounded-md object-cover"
      :alt="`${result.profile.login} avatar`"
      :src="result.profile.avatarUrl"
    />

    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-4 max-sm:(flex-col items-stretch)">
        <div>
          <h2 class="m-0 text-base text-black font-650 leading-tight dark:text-white">
            {{ result.profile.name || result.profile.login }}
          </h2>
          <a
            class="text-sm text-neutral-600 no-underline hover:text-black dark:text-neutral-400 dark:hover:text-white"
            :href="result.profile.url"
            rel="noreferrer"
            target="_blank"
          >
            @{{ result.profile.login }}
          </a>
        </div>

        <p class="status-pill max-sm:self-start" :class="statusClass">
          <span :class="statusIcon" aria-hidden="true" />
          {{ statusLabel }}
        </p>
      </div>

      <a
        v-if="result.profile.homepage"
        class="mt-1.5 block max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm text-neutral-600 no-underline hover:text-black dark:text-neutral-400 dark:hover:text-white"
        :href="result.profile.homepage"
        rel="noreferrer"
        target="_blank"
      >
        {{ result.profile.homepage }}
      </a>
      <p
        v-else
        class="mt-1.5 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-500"
      >
        No homepage listed
      </p>
    </div>
  </article>
</template>
