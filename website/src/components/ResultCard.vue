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

const createdAtLabel = computed(() =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(props.result.profile.createdAt)),
);

const homepageLabel = computed(() =>
  props.result.profile.homepage.replace(/^https?:\/\//i, "").replace(/\/$/, ""),
);

const profileFacts = computed(() =>
  [
    {
      icon: "i-ph-link",
      label: homepageLabel.value || "No homepage listed",
      href: props.result.profile.homepage,
    },
    {
      icon: "i-ph-buildings",
      label: props.result.profile.company,
    },
    {
      icon: "i-ph-map-pin",
      label: props.result.profile.location,
    },
  ].filter((fact) => fact.label),
);

const accountSignals = computed(() => [
  {
    label: "Repos",
    value: props.result.profile.publicRepos.toLocaleString(),
  },
  {
    label: "Followers",
    value: props.result.profile.followers.toLocaleString(),
  },
  {
    label: "Following",
    value: props.result.profile.following.toLocaleString(),
  },
  {
    label: "Joined",
    value: createdAtLabel.value,
  },
]);
</script>

<template>
  <article
    class="panel-surface mt-5 flex flex-row items-stretch gap-4 p-4 text-left sm:gap-5 sm:p-5 max-sm:(flex-col)"
  >
    <img
      class="h32 w32 shrink-0 self-center rounded-md object-cover max-sm:(h-20 w-20 self-start)"
      :alt="`${result.profile.login} avatar`"
      :src="result.profile.avatarUrl"
    />

    <div class="min-w-0 flex flex-1 flex-col justify-center">
      <div class="min-w-0 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h2 class="m-0 min-w-0 truncate text-lg text-black font-750 leading-tight dark:text-white">
          {{ result.profile.name || result.profile.login }}
        </h2>
        <a
          class="shrink-0 text-sm text-neutral-600 no-underline hover:text-black dark:text-neutral-400 dark:hover:text-white"
          :href="result.profile.url"
          rel="noreferrer"
          target="_blank"
        >
          @{{ result.profile.login }}
        </a>
      </div>

      <p
        v-if="result.profile.bio"
        class="mb-0 mt-2 line-clamp-2 text-sm text-neutral-700 leading-5 dark:text-neutral-300"
      >
        {{ result.profile.bio }}
      </p>

      <div class="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        <template v-for="fact in profileFacts" :key="fact.icon">
          <a
            v-if="fact.href"
            class="inline-flex min-w-0 items-center gap-1.5 text-sm text-neutral-600 no-underline hover:text-black dark:text-neutral-400 dark:hover:text-white"
            :href="fact.href"
            rel="noreferrer"
            target="_blank"
          >
            <span class="shrink-0" :class="fact.icon" aria-hidden="true" />
            <span class="min-w-0 truncate">{{ fact.label }}</span>
          </a>

          <span
            v-else
            class="inline-flex min-w-0 items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400"
          >
            <span class="shrink-0" :class="fact.icon" aria-hidden="true" />
            <span class="min-w-0 truncate">{{ fact.label }}</span>
          </span>
        </template>
      </div>
    </div>

    <div
      class="flex min-w-64 shrink-0 basis-60 flex-col gap-3 sm:items-end max-sm:(min-w-0 basis-auto)"
    >
      <p class="status-pill self-start sm:self-end" :class="statusClass">
        <span :class="statusIcon" aria-hidden="true" />
        {{ statusLabel }}
      </p>

      <dl class="flex w-full flex-wrap gap-2 sm:justify-end">
        <div
          v-for="signal in accountSignals"
          :key="signal.label"
          class="min-w-25 flex-1 rounded-md bg-neutral-50 px-3 py-2 sm:flex-none dark:bg-neutral-950"
        >
          <dt
            class="text-[0.68rem] text-neutral-500 font-650 uppercase tracking-wide dark:text-neutral-500"
          >
            {{ signal.label }}
          </dt>
          <dd class="m-0 mt-1 whitespace-nowrap text-sm text-black font-750 dark:text-white">
            {{ signal.value }}
          </dd>
        </div>
      </dl>
    </div>
  </article>
</template>
