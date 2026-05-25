import type { D1DatabaseBinding } from './d1-types';

declare global {
  interface CloudflareEnv {
    BOOKMARKS_DB?: D1DatabaseBinding;
  }
}

export {};
