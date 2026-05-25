import type { BookmarkActionResult } from './types';

export const BOOKMARK_TOKEN_STORAGE_KEY = 'bookmark_admin_token';

export const verifyBookmarkToken = (
  token: string | null,
): BookmarkActionResult => {
  const configuredToken = process.env.ADMIN_TOKEN;

  if (!configuredToken) {
    return { ok: false, code: 'auth_missing_config' };
  }

  if (!token || token.trim() !== configuredToken) {
    return { ok: false, code: 'auth_invalid' };
  }

  return { ok: true, code: 'ok' };
};
