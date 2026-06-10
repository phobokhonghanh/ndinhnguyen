import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BookmarkDashboard } from '@/components/features/bookmarks/BookmarkDashboard';
import { CATEGORY_COLOR_PRESETS } from '@/lib/bookmarks/colors';
import type { BookmarkActionCode } from '@/lib/bookmarks/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'bookmarks' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function BookmarksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'bookmarks' });

  const actionCodes: BookmarkActionCode[] = [
    'ok',
    'auth_invalid',
    'auth_missing_config',
    'category_required',
    'category_in_use',
    'category_has_children',
    'category_not_found',
    'bookmark_not_found',
    'title_required',
    'url_invalid',
    'db_unavailable',
    'unknown_error',
  ];

  return (
    <BookmarkDashboard
      labels={{
        title: t('title'),
        subtitle: t('subtitle'),
        loginTitle: t('login_title'),
        loginSubtitle: t('login_subtitle'),
        loginButton: t('login_button'),
        logout: t('logout'),
        searchPlaceholder: t('search_placeholder'),
        allCategories: t('all_categories'),
        categories: t('categories'),
        bookmarks: t('bookmarks'),
        totalBookmarks: t('total_bookmarks'),
        totalCategories: t('total_categories'),
        activeFilters: t('active_filters'),
        editingBookmark: t('editing_bookmark'),
        editingCategory: t('editing_category'),
        addCategory: t('add_category'),
        addBookmark: t('add_bookmark'),
        edit: t('edit'),
        delete: t('delete'),
        cancel: t('cancel'),
        save: t('save'),
        open: t('open'),
        token: t('token'),
        tokenPlaceholder: t('token_placeholder'),
        tokenSaved: t('token_saved'),
        tokenRequired: t('token_required'),
        dbUnavailable: t('db_unavailable'),
        emptyBookmarks: t('empty_bookmarks'),
        emptyCategories: t('empty_categories'),
        categoryName: t('category_name'),
        parentCategory: t('parent_category'),
        noParent: t('no_parent'),
        categoryColor: t('category_color'),
        bookmarkTitle: t('bookmark_title'),
        bookmarkUrl: t('bookmark_url'),
        bookmarkDescription: t('bookmark_description'),
        bookmarkCategory: t('bookmark_category'),
        descriptionOptional: t('description_optional'),
        confirmDelete: t('confirm_delete'),
        actionMessages: Object.fromEntries(
          actionCodes.map((code) => [code, t(`action_${code}`)]),
        ) as Record<BookmarkActionCode, string>,
        categoryColors: Object.fromEntries(
          CATEGORY_COLOR_PRESETS.map((preset) => [
            preset.id,
            t(preset.labelKey),
          ]),
        ) as Record<(typeof CATEGORY_COLOR_PRESETS)[number]['id'], string>,
      }}
    />
  );
}
