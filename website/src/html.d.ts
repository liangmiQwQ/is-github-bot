// oxlint-disable-next-line import/no-unassigned-import -- Augment Vue rather than replace its module declarations.
import '@vue/runtime-dom'

declare module '@vue/runtime-dom' {
  type HTMLAttributes = Record<string, unknown>
}
