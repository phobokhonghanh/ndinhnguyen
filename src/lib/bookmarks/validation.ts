import type { BookmarkActionCode } from './types';
import {
  DEFAULT_CATEGORY_COLOR,
  normalizeCategoryColor,
  type CategoryColorId,
} from './colors';

export interface BookmarkInput {
  title: string;
  url: string;
  description: string | null;
  categoryId: string;
}

export interface CategoryInput {
  name: string;
  color: CategoryColorId;
  parentId: string | null;
}

export const getFormString = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
};

export const getOptionalFormString = (
  formData: FormData,
  key: string,
): string | null => {
  const value = getFormString(formData, key);
  return value.length > 0 ? value : null;
};

export const parseBookmarkInput = (
  formData: FormData,
):
  | { input: BookmarkInput; error: null }
  | { input: null; error: BookmarkActionCode } => {
  const title = getFormString(formData, 'title');
  const url = getFormString(formData, 'url');
  const categoryId = getFormString(formData, 'categoryId');
  const description = getOptionalFormString(formData, 'description');

  if (!title) {
    return { input: null, error: 'title_required' };
  }

  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return { input: null, error: 'url_invalid' };
    }
  } catch {
    return { input: null, error: 'url_invalid' };
  }

  if (!categoryId) {
    return { input: null, error: 'category_required' };
  }

  return { input: { title, url, description, categoryId }, error: null };
};

export const parseCategoryInput = (
  formData: FormData,
):
  | { input: CategoryInput; error: null }
  | { input: null; error: BookmarkActionCode } => {
  const name = getFormString(formData, 'name');
  const color = normalizeCategoryColor(
    getFormString(formData, 'color') || DEFAULT_CATEGORY_COLOR,
  );
  const parentId = getOptionalFormString(formData, 'parentId');

  if (!name) {
    return { input: null, error: 'title_required' };
  }

  return { input: { name, color, parentId }, error: null };
};

export const slugifyCategoryName = (name: string): string => {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || crypto.randomUUID().slice(0, 8);
};
