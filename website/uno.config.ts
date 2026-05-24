import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  presets: [presetWind4(), presetIcons(), presetTypography(), presetAttributify()],
  shortcuts: {
    "icon-button":
      "inline-flex h-10 w-10 items-center justify-center border border-[var(--line)] rounded-lg bg-[var(--panel)]/92 text-[var(--text)] shadow-[0_8px_28px_rgb(15_23_42_/_8%)] transition hover:(-translate-y-0.25 border-[var(--primary)] bg-[var(--panel)])",
    "void-link":
      "inline-flex h-10 items-center justify-center border border-[var(--line)] rounded-lg bg-[var(--panel)]/92 px-3 text-sm text-[var(--muted)] font-700 no-underline shadow-[0_8px_28px_rgb(15_23_42_/_8%)] transition hover:(-translate-y-0.25 border-[var(--primary)] bg-[var(--panel)])",
    "panel-surface":
      "border border-[var(--line-soft)] rounded-lg bg-[var(--panel)]/94 shadow-[0_18px_54px_rgb(15_23_42_/_10%)]",
    "status-pill":
      "inline-flex shrink-0 items-center gap-1.5 border border-current rounded-full px-2.5 py-1.5 text-xs font-800",
    "skeleton-block": "relative overflow-hidden bg-[var(--panel-strong)] after:shimmer",
    "after:shimmer":
      "after:absolute after:inset-0 after:content-empty after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-[var(--panel)]/70 after:to-transparent",
  },
  theme: {
    animation: {
      keyframes: {
        shimmer: "{from{transform:translateX(-100%)}to{transform:translateX(100%)}}",
      },
      durations: {
        shimmer: "1.2s",
      },
      timingFns: {
        shimmer: "linear",
      },
      counts: {
        shimmer: "infinite",
      },
    },
  },
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
