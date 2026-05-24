import { useDark } from "@vueuse/core";

export function useColorMode() {
  const mode = useDark();
  const toggleMode = () => {
    mode.value = !mode.value;
  };

  return {
    mode,
    toggleMode,
  };
}
