import type {
  Bookmark,
  BookmarkActionCode,
  Category,
} from '@/lib/bookmarks/types';
import type { CategoryColorId } from '@/lib/bookmarks/colors';

export interface BookmarkDashboardLabels {
  title: string;
  subtitle: string;
  loginTitle: string;
  loginSubtitle: string;
  loginButton: string;
  logout: string;
  searchPlaceholder: string;
  allCategories: string;
  categories: string;
  bookmarks: string;
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
}

export type PanelMode =
  | { type: 'bookmark'; bookmark?: Bookmark }
  | { type: 'category'; category?: Category }
  | null;
