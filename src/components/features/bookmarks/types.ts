import type {
  Bookmark,
  BookmarkActionCode,
  Category,
} from '@/lib/bookmarks/types';
import type { CategoryColorId } from '@/lib/bookmarks/colors';

export interface BookmarkDashboardLabels {
  subtitle: string;
  loginTitle: string;
  loginSubtitle: string;
  loginButton: string;
  logout: string;
  searchPlaceholder: string;
  allCategories: string;
  categories: string;
  bookmarks: string;
  totalBookmarks: string;
  totalCategories: string;
  activeFilters: string;
  editingBookmark: string;
  editingCategory: string;
  addCategory: string;
  addBookmark: string;
  edit: string;
  delete: string;
  cancel: string;
  save: string;
  open: string;
  token: string;
  tokenPlaceholder: string;
  tokenSaved: string;
  tokenRequired: string;
  dbUnavailable: string;
  emptyBookmarks: string;
  emptyCategories: string;
  categoryName: string;
  parentCategory: string;
  noParent: string;
  categoryColor: string;
  bookmarkTitle: string;
  bookmarkUrl: string;
  bookmarkDescription: string;
  bookmarkCategory: string;
  descriptionOptional: string;
  confirmDelete: string;
  actionMessages: Record<BookmarkActionCode, string>;
  categoryColors: Record<CategoryColorId, string>;
  sortBy: string;
  sortOrder: string;
  sortCreatedAt: string;
  sortTitle: string;
  sortUrl: string;
  sortAsc: string;
  sortDesc: string;
  advancedSort: string;
  advancedSortLabel: string;
  localSort: string;
  hide: string;
  page: string;
  pageSize: string;
  next: string;
  previous: string;
  viewBookmarks: string;
}

export type PanelMode =
  | { type: 'bookmark'; bookmark?: Bookmark }
  | { type: 'category'; category?: Category }
  | null;
