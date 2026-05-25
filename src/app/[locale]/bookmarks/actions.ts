'use server';

import { revalidatePath } from 'next/cache';
import { getBookmarksDb } from '@/lib/bookmarks/db';
import { verifyBookmarkToken } from '@/lib/bookmarks/auth';
import {
  createBookmark,
  createCategory,
  deleteBookmark,
  deleteCategory,
  getBookmarkDashboardData,
  updateBookmark,
  updateCategory,
} from '@/lib/bookmarks/repository';
import type {
  BookmarkActionResult,
  BookmarkDashboardLoadResult,
} from '@/lib/bookmarks/types';
import {
  getFormString,
  parseBookmarkInput,
  parseCategoryInput,
} from '@/lib/bookmarks/validation';

const getMutationContext = async (
  formData: FormData,
): Promise<
  | { result: BookmarkActionResult; db: null; locale: string }
  | {
      result: null;
      db: NonNullable<Awaited<ReturnType<typeof getBookmarksDb>>>;
      locale: string;
    }
> => {
  const locale = getFormString(formData, 'locale') || 'en';
  const token = getFormString(formData, 'token');
  const authResult = verifyBookmarkToken(token);

  if (!authResult.ok) {
    return { result: authResult, db: null, locale };
  }

  const db = await getBookmarksDb();

  if (!db) {
    return { result: { ok: false, code: 'db_unavailable' }, db: null, locale };
  }

  return { result: null, db, locale };
};

const refreshBookmarksPath = (locale: string): void => {
  revalidatePath(`/${locale}/bookmarks`);
};

export const loadBookmarkDashboardAction = async ({
  token,
  query,
  categoryId,
}: {
  token: string;
  query?: string;
  categoryId?: string;
}): Promise<BookmarkDashboardLoadResult> => {
  const authResult = verifyBookmarkToken(token);

  if (!authResult.ok) {
    return {
      ok: false,
      code: authResult.code as Exclude<BookmarkActionResult['code'], 'ok'>,
    };
  }

  const db = await getBookmarksDb();

  if (!db) {
    return { ok: false, code: 'db_unavailable' };
  }

  const data = await getBookmarkDashboardData(db, { query, categoryId });

  return { ok: true, code: 'ok', data };
};

export const createCategoryAction = async (
  formData: FormData,
): Promise<BookmarkActionResult> => {
  try {
    const context = await getMutationContext(formData);

    if (context.result) {
      return context.result;
    }

    const parsed = parseCategoryInput(formData);

    if (parsed.error) {
      return { ok: false, code: parsed.error };
    }

    await createCategory(context.db, parsed.input);
    refreshBookmarksPath(context.locale);

    return { ok: true, code: 'ok' };
  } catch {
    return { ok: false, code: 'unknown_error' };
  }
};

export const updateCategoryAction = async (
  formData: FormData,
): Promise<BookmarkActionResult> => {
  try {
    const context = await getMutationContext(formData);

    if (context.result) {
      return context.result;
    }

    const id = getFormString(formData, 'id');
    const parsed = parseCategoryInput(formData);

    if (!id || parsed.error) {
      return { ok: false, code: parsed.error ?? 'category_not_found' };
    }

    if (parsed.input.parentId === id) {
      return { ok: false, code: 'category_required' };
    }

    await updateCategory(context.db, id, parsed.input);
    refreshBookmarksPath(context.locale);

    return { ok: true, code: 'ok' };
  } catch {
    return { ok: false, code: 'unknown_error' };
  }
};

export const deleteCategoryAction = async (
  formData: FormData,
): Promise<BookmarkActionResult> => {
  try {
    const context = await getMutationContext(formData);

    if (context.result) {
      return context.result;
    }

    const id = getFormString(formData, 'id');

    if (!id) {
      return { ok: false, code: 'category_not_found' };
    }

    const result = await deleteCategory(context.db, id);

    if (result === 'has_children') {
      return { ok: false, code: 'category_has_children' };
    }

    if (result === 'in_use') {
      return { ok: false, code: 'category_in_use' };
    }

    refreshBookmarksPath(context.locale);
    return { ok: true, code: 'ok' };
  } catch {
    return { ok: false, code: 'unknown_error' };
  }
};

export const createBookmarkAction = async (
  formData: FormData,
): Promise<BookmarkActionResult> => {
  try {
    const context = await getMutationContext(formData);

    if (context.result) {
      return context.result;
    }

    const parsed = parseBookmarkInput(formData);

    if (parsed.error) {
      return { ok: false, code: parsed.error };
    }

    await createBookmark(context.db, parsed.input);
    refreshBookmarksPath(context.locale);

    return { ok: true, code: 'ok' };
  } catch {
    return { ok: false, code: 'unknown_error' };
  }
};

export const updateBookmarkAction = async (
  formData: FormData,
): Promise<BookmarkActionResult> => {
  try {
    const context = await getMutationContext(formData);

    if (context.result) {
      return context.result;
    }

    const id = getFormString(formData, 'id');
    const parsed = parseBookmarkInput(formData);

    if (!id || parsed.error) {
      return { ok: false, code: parsed.error ?? 'bookmark_not_found' };
    }

    await updateBookmark(context.db, id, parsed.input);
    refreshBookmarksPath(context.locale);

    return { ok: true, code: 'ok' };
  } catch {
    return { ok: false, code: 'unknown_error' };
  }
};

export const deleteBookmarkAction = async (
  formData: FormData,
): Promise<BookmarkActionResult> => {
  try {
    const context = await getMutationContext(formData);

    if (context.result) {
      return context.result;
    }

    const id = getFormString(formData, 'id');

    if (!id) {
      return { ok: false, code: 'bookmark_not_found' };
    }

    await deleteBookmark(context.db, id);
    refreshBookmarksPath(context.locale);

    return { ok: true, code: 'ok' };
  } catch {
    return { ok: false, code: 'unknown_error' };
  }
};
