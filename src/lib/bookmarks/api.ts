import type {
  BookmarkActionCode,
  BookmarkActionResult,
  BookmarkDashboardLoadResult,
  Category,
  CategoryTreeNode,
  Bookmark,
  PaginationMetadata,
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

function flattenCategoryTree(nodes: CategoryTreeNode[]): Category[] {
  const result: Category[] = [];
  const traverse = (node: CategoryTreeNode) => {
    const flat: Category = {
      id: node.id,
      name: node.name,
      slug: node.slug,
      color: node.color,
      parentId: node.parentId,
      createdAt: node.createdAt,
    };
    result.push(flat);
    if (node.children) {
      node.children.forEach(traverse);
    }
  };
  nodes.forEach(traverse);
  return result;
}

export const loadBookmarkDashboard = async ({
  token,
  query,
  categoryId,
  page = 1,
  pageSize = 20,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  skipCategories = false,
}: {
  token: string;
  query?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'title' | 'url';
  sortOrder?: 'asc' | 'desc';
  skipCategories?: boolean;
}): Promise<BookmarkDashboardLoadResult> => {
  const bookmarksParams = new URLSearchParams();
  if (query) bookmarksParams.set('q', query);
  if (categoryId) bookmarksParams.set('categoryId', categoryId);
  bookmarksParams.set('page', page.toString());
  bookmarksParams.set('pageSize', pageSize.toString());
  bookmarksParams.set('sortBy', sortBy);
  bookmarksParams.set('sortOrder', sortOrder);

  if (skipCategories) {
    try {
      const bookmarksRes = await request<{ bookmarks: Bookmark[]; pagination: PaginationMetadata }>(
        `/api/bookmarks?${bookmarksParams.toString()}`,
        token,
      );

      if (!bookmarksRes.ok || !bookmarksRes.data) {
        return {
          ok: false,
          code: bookmarksRes.code === 'ok' ? 'unknown_error' : bookmarksRes.code,
        };
      }

      const { bookmarks, pagination } = bookmarksRes.data;

      return {
        ok: true,
        code: 'ok',
        data: {
          bookmarks,
          categories: [],
          categoryTree: [],
          selectedCategoryIds: categoryId ? [categoryId] : [],
          dbReady: true,
          pagination,
        },
      };
    } catch {
      return { ok: false, code: 'unknown_error' };
    }
  }

  const categoriesParams = new URLSearchParams();
  categoriesParams.set('pageSize', '100'); // Fetch all categories to build sidebar/dropdown tree

  try {
    const [categoriesRes, bookmarksRes] = await Promise.all([
      request<{ categoryTree: CategoryTreeNode[] }>(
        `/api/categories?${categoriesParams.toString()}`,
        token,
      ),
      request<{ bookmarks: Bookmark[]; pagination: PaginationMetadata }>(
        `/api/bookmarks?${bookmarksParams.toString()}`,
        token,
      ),
    ]);

    if (!categoriesRes.ok || !categoriesRes.data) {
      return {
        ok: false,
        code: categoriesRes.code === 'ok' ? 'unknown_error' : categoriesRes.code,
      };
    }

    if (!bookmarksRes.ok || !bookmarksRes.data) {
      return {
        ok: false,
        code: bookmarksRes.code === 'ok' ? 'unknown_error' : bookmarksRes.code,
      };
    }

    const categoryTree = categoriesRes.data.categoryTree;
    const { bookmarks, pagination } = bookmarksRes.data;
    const categories = flattenCategoryTree(categoryTree);

    return {
      ok: true,
      code: 'ok',
      data: {
        bookmarks,
        categories,
        categoryTree,
        selectedCategoryIds: categoryId ? [categoryId] : [],
        dbReady: true,
        pagination,
      },
    };
  } catch {
    return { ok: false, code: 'unknown_error' };
  }
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
