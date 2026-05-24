declare module "*.vue" {
  import type { Component } from "vue";

  const component: Component;
  export default component;
}

declare module "*.css";

declare const chrome: {
  runtime: {
    onMessage: {
      addListener(
        callback: (
          message: unknown,
          sender: unknown,
          sendResponse: (response: unknown) => void,
        ) => boolean | void,
      ): void;
    };
    sendMessage<T = unknown>(message: unknown): Promise<T>;
    lastError?: { message?: string };
  };
  storage: {
    local: {
      get(
        keys?: string | string[] | Record<string, unknown> | null,
      ): Promise<Record<string, unknown>>;
      set(items: Record<string, unknown>): Promise<void>;
    };
  };
};
