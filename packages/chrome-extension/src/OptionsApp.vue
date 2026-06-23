<script setup lang="ts">
import { computed, onMounted, reactive, shallowRef } from "vue";
import { DEFAULT_SETTINGS, readSettings, writeSettings } from './settings.ts';
import type { ExtensionSettings } from './settings.ts';

const settings = reactive<ExtensionSettings>({ ...DEFAULT_SETTINGS });
const loaded = shallowRef(false);
const saved = shallowRef(false);

const sections = computed(() => [
  {
    title: "Issue and pull request pages",
    description:
      "Check the author, mark their avatar, and expose maintainer actions for bot accounts.",
  },
  {
    title: "Profile pages",
    description:
      "Check personal GitHub profiles and optionally add a block shortcut for bot accounts.",
  },
]);

onMounted(async () => {
  Object.assign(settings, await readSettings());
  loaded.value = true;
});

async function save() {
  await writeSettings({ ...settings });
  saved.value = true;
  globalThis.setTimeout(() => {
    saved.value = false;
  }, 1800);
}
</script>

<template>
  <main class="min-h-svh bg-slate-50 px-4 py-8 text-slate-950">
    <section class="mx-auto max-w-185">
      <div class="mb-7 flex items-start justify-between gap-4">
        <div>
          <p class="mb-2 text-xs text-slate-500 font-700 tracking-[0.08em] uppercase">
            is-github-bot
          </p>
          <h1 class="m-0 text-3xl font-750 leading-tight">Chrome extension settings</h1>
        </div>
        <button class="icon-button" type="button" aria-label="Save settings" @click="save">
          <span class="i-ph-floppy-disk" aria-hidden="true" />
        </button>
      </div>

      <div v-if="loaded" class="grid gap-4">
        <section class="panel-surface p-5">
          <div class="mb-5 flex items-start gap-3">
            <span class="i-ph-git-pull-request mt-1 text-lg text-slate-500" aria-hidden="true" />
            <div>
              <h2 class="m-0 text-lg font-700">{{ sections[0]?.title }}</h2>
              <p class="m-0 mt-1 text-sm text-slate-500">{{ sections[0]?.description }}</p>
            </div>
          </div>

          <div class="grid gap-4">
            <label class="flex items-center justify-between gap-4">
              <span class="text-sm font-600">Check the author of PRs and issues</span>
              <input v-model="settings.checkIssueAuthor" type="checkbox" />
            </label>
            <label class="flex items-center justify-between gap-4">
              <span class="text-sm text-slate-700">Skip collaborators and members</span>
              <input v-model="settings.skipCollaboratorMember" type="checkbox" />
            </label>
            <label class="flex items-center justify-between gap-4">
              <span class="text-sm text-slate-700">Skip contributors</span>
              <input v-model="settings.skipContributor" type="checkbox" />
            </label>
            <label class="flex items-center justify-between gap-4">
              <span class="text-sm text-slate-700">Show spam close buttons for bot authors</span>
              <input v-model="settings.showSpamButtons" type="checkbox" />
            </label>
            <label class="grid gap-2">
              <span class="text-sm text-slate-700">Close as spam prompt</span>
              <textarea
                v-model="settings.closeAsSpamPrompt"
                class="field-input min-h-20 py-2"
                placeholder="Leave blank to close without a comment"
              />
            </label>
            <label class="grid gap-2">
              <span class="text-sm text-slate-700">Close and Block prompt</span>
              <textarea
                v-model="settings.closeAndBlockPrompt"
                class="field-input min-h-20 py-2"
                placeholder="Leave blank to close without a comment"
              />
            </label>
          </div>
        </section>

        <section class="panel-surface p-5">
          <div class="mb-5 flex items-start gap-3">
            <span class="i-ph-user-circle mt-1 text-lg text-slate-500" aria-hidden="true" />
            <div>
              <h2 class="m-0 text-lg font-700">{{ sections[1]?.title }}</h2>
              <p class="m-0 mt-1 text-sm text-slate-500">{{ sections[1]?.description }}</p>
            </div>
          </div>

          <div class="grid gap-4">
            <label class="flex items-center justify-between gap-4">
              <span class="text-sm font-600">Check account profile pages</span>
              <input v-model="settings.checkProfileAuthor" type="checkbox" />
            </label>
            <label class="flex items-center justify-between gap-4">
              <span class="text-sm text-slate-700">Show Block button for bot profiles</span>
              <input v-model="settings.showProfileBlockButton" type="checkbox" />
            </label>
          </div>
        </section>

        <section class="panel-surface p-5">
          <div class="mb-5 flex items-start gap-3">
            <span class="i-ph-key mt-1 text-lg text-slate-500" aria-hidden="true" />
            <div>
              <h2 class="m-0 text-lg font-700">GitHub token</h2>
              <p class="m-0 mt-1 text-sm text-slate-500">
                Optional for checks, required for closing issues and blocking users.
              </p>
            </div>
          </div>

          <label class="grid gap-2">
            <span class="text-sm text-slate-700">Token</span>
            <input
              v-model="settings.token"
              class="field-input h-10"
              autocomplete="off"
              placeholder="github_pat_..."
              type="password"
            />
          </label>
        </section>

        <div class="flex justify-end">
          <button
            class="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm text-white font-700 transition hover:bg-slate-800 active:scale-98"
            type="button"
            @click="save"
          >
            <span class="i-ph-floppy-disk" aria-hidden="true" />
            {{ saved ? "Saved" : "Save" }}
          </button>
        </div>
      </div>
    </section>
  </main>
</template>
