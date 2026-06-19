import type { CategoryColorId } from './colors';

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: CategoryColorId;
  parentId: string | null;
  createdAt: string;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string | null;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  categoryColor: CategoryColorId;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BookmarkFilters {
  query?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'title' | 'url';
  sortOrder?: 'asc' | 'desc';
}

export type BookmarkActionCode =
  | 'ok'
  | 'auth_invalid'
  | 'auth_missing_config'
  | 'category_required'
  | 'category_in_use'
  | 'category_has_children'
  | 'category_not_found'
  | 'bookmark_not_found'
  | 'title_required'
  | 'url_invalid'
  | 'db_unavailable'
  | 'unknown_error';

export interface BookmarkActionResult {
  ok: boolean;
  code: BookmarkActionCode;
}

export type BookmarkDashboardLoadResult =
  | {
      ok: true;
      code: 'ok';
      data: BookmarkDashboardData;
    }
  | {
      ok: false;
      code: Exclude<BookmarkActionCode, 'ok'>;
    };

export interface BookmarkDashboardData {
  bookmarks: Bookmark[];
  categories: Category[];
  categoryTree: CategoryTreeNode[];
  selectedCategoryIds: string[];
  dbReady: boolean;
  pagination: PaginationMetadata;
}
