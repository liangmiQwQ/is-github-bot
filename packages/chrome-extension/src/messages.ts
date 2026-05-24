import type { GitHubBotStatus } from "is-github-bot";
import type { ExtensionSettings } from "./settings.ts";

export interface PageContext {
  owner: string;
  repo: string;
  number: number;
  username: string;
}

export type ExtensionMessage =
  | {
      type: "check-user";
      username: string;
    }
  | {
      type: "get-settings";
    }
  | {
      type: "close-spam";
      context: PageContext;
      block: boolean;
    }
  | {
      type: "block-user";
      username: string;
    };

export type ExtensionResponse =
  | {
      ok: true;
      status: GitHubBotStatus | undefined;
    }
  | {
      ok: true;
      settings: ExtensionSettings;
    }
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };
