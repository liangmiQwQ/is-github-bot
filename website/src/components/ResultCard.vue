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
  if (props.result.status === "human") return "text-[var(--success)]";
  if (props.result.status === "bot") return "text-[var(--danger)]";
  if (props.result.status === "suspicious") return "text-[var(--warning)]";
  return "text-[var(--unknown)]";
});
</script>

<template>
  <article
    class="panel-surface mt-4 flex items-center gap-4 p-4 text-left max-sm:(flex-col items-stretch)"
  >
    <img
      class="h-18 w-18 shrink-0 border border-[var(--line-soft)] rounded-lg object-cover max-sm:(h-16 w-16)"
      :alt="`${result.profile.login} avatar`"
      :src="result.profile.avatarUrl"
    />

    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-4 max-sm:(flex-col items-stretch)">
        <div>
          <h2 class="m-0 text-[var(--text)] text-xl leading-tight">
            {{ result.profile.name || result.profile.login }}
          </h2>
          <a
            class="text-sm text-[var(--muted)] no-underline hover:text-[var(--primary-strong)]"
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
        class="mt-2.5 block max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm text-[var(--muted)] no-underline hover:text-[var(--primary-strong)]"
        :href="result.profile.homepage"
        rel="noreferrer"
        target="_blank"
      >
        {{ result.profile.homepage }}
      </a>
      <p
        v-else
        class="mt-2.5 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-[var(--muted)]"
      >
        No homepage listed
      </p>
    </div>
  </article>
</template>
