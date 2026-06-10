import type {
  BookmarkActionCode,
  BookmarkActionResult,
  BookmarkDashboardLoadResult,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';

interface ApiResponse<T = never> {
  ok: boolean;
  code: BookmarkActionCode;
  data?: T;
}

const request = async <T>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<ApiResponse<T>> => {
  if (!API_URL) {
    return { ok: false, code: 'db_unavailable' };
  }

  try {
    const headers = new Headers(init?.headers);
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Type', 'application/json');

    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
    });
    const body = (await response.json()) as ApiResponse<T>;

    return body;
  } catch {
    return { ok: false, code: 'unknown_error' };
  }
};

const formValue = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
};

const bookmarkPayload = (formData: FormData) => ({
  title: formValue(formData, 'title'),
  url: formValue(formData, 'url'),
  description: formValue(formData, 'description') || null,
  categoryId: formValue(formData, 'categoryId'),
});

const categoryPayload = (formData: FormData) => ({
  name: formValue(formData, 'name'),
  color: formValue(formData, 'color'),
  parentId: formValue(formData, 'parentId') || null,
});

export const loadBookmarkDashboard = async ({
  token,
  query,
  categoryId,
}: {
  token: string;
  query?: string;
  categoryId?: string;
}): Promise<BookmarkDashboardLoadResult> => {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (categoryId) params.set('categoryId', categoryId);

  const suffix = params.size > 0 ? `?${params.toString()}` : '';
  const result = await request<
    Extract<BookmarkDashboardLoadResult, { ok: true }>['data']
  >(`/api/bookmarks${suffix}`, token);

  if (!result.ok || !result.data) {
    return {
      ok: false,
      code: result.code === 'ok' ? 'unknown_error' : result.code,
    };
  }

  return { ok: true, code: 'ok', data: result.data };
};

const mutate = async (
  path: string,
  token: string,
  method: string,
  body?: object,
): Promise<BookmarkActionResult> => {
  const result = await request(path, token, {
    method,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { ok: result.ok, code: result.code };
};

export const createBookmark = (token: string, formData: FormData) =>
  mutate('/api/bookmarks', token, 'POST', bookmarkPayload(formData));

export const updateBookmark = (token: string, formData: FormData) =>
  mutate(
    `/api/bookmarks/${encodeURIComponent(formValue(formData, 'id'))}`,
    token,
    'PUT',
    bookmarkPayload(formData),
  );

export const deleteBookmark = (token: string, id: string) =>
  mutate(`/api/bookmarks/${encodeURIComponent(id)}`, token, 'DELETE');

export const createCategory = (token: string, formData: FormData) =>
  mutate('/api/categories', token, 'POST', categoryPayload(formData));

export const updateCategory = (token: string, formData: FormData) =>
  mutate(
    `/api/categories/${encodeURIComponent(formValue(formData, 'id'))}`,
    token,
    'PUT',
    categoryPayload(formData),
  );

export const deleteCategory = (token: string, id: string) =>
  mutate(`/api/categories/${encodeURIComponent(id)}`, token, 'DELETE');
