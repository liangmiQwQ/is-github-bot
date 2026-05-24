import { useColorMode as useVueUseColorMode } from "@vueuse/core";
import { computed } from "vue";

const STORAGE_KEY = "is-github-bot-color-mode";

export function useColorMode() {
  const colorMode = useVueUseColorMode({
    storageKey: STORAGE_KEY,
  });
  const mode = computed(() => (colorMode.value === "dark" ? "dark" : "light"));

  function toggleMode() {
    colorMode.value = mode.value === "dark" ? "light" : "dark";
  }

  return {
    mode,
    toggleMode,
  };
}
