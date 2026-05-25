import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1DatabaseBinding } from './d1-types';

export const getBookmarksDb = async (): Promise<D1DatabaseBinding | null> => {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env.BOOKMARKS_DB ?? null;
  } catch {
    return null;
  }
};
