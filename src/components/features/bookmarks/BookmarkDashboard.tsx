'use client';

import * as React from 'react';
import { LogOut } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
  createBookmarkAction,
  createCategoryAction,
  deleteBookmarkAction,
  deleteCategoryAction,
  loadBookmarkDashboardAction,
  updateBookmarkAction,
  updateCategoryAction,
} from '@/app/[locale]/bookmarks/actions';
import { BOOKMARK_TOKEN_STORAGE_KEY } from '@/lib/bookmarks/auth';
import type {
  Bookmark,
  BookmarkActionResult,
  BookmarkDashboardData,
} from '@/lib/bookmarks/types';
import { BookmarkAuthDialog } from './BookmarkAuthDialog';
import { BookmarkForms } from './BookmarkForms';
import { BookmarkList } from './BookmarkList';
import { BookmarkToolbar } from './BookmarkToolbar';
import { CategorySidebar } from './CategorySidebar';
import type { BookmarkDashboardLabels, PanelMode } from './types';

interface BookmarkDashboardProps {
  locale: string;
  query: string;
  selectedCategoryId: string;
  labels: BookmarkDashboardLabels;
}

interface BookmarkFiltersState {
  query: string;
  categoryId: string;
}

const subscribeHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

const createActionFormData = (
  source: HTMLFormElement,
  locale: string,
  token: string,
): FormData => {
  const formData = new FormData(source);
  formData.set('locale', locale);
  formData.set('token', token);
  return formData;
};

export function BookmarkDashboard({
  locale,
  query,
  selectedCategoryId,
  labels,
}: BookmarkDashboardProps) {
  const router = useRouter();
  const hasHydrated = React.useSyncExternalStore(
    subscribeHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const [token, setToken] = React.useState('');
  const [filters, setFilters] = React.useState<BookmarkFiltersState>({
    query,
    categoryId: selectedCategoryId,
  });
  const [data, setData] = React.useState<BookmarkDashboardData | null>(null);
  const [panelMode, setPanelMode] = React.useState<PanelMode>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const initialFiltersRef = React.useRef(filters);

  const updateUrl = React.useCallback(
    (nextFilters: BookmarkFiltersState) => {
      const params = new URLSearchParams();

      if (nextFilters.query) {
        params.set('q', nextFilters.query);
      }

      if (nextFilters.categoryId) {
        params.set('category', nextFilters.categoryId);
      }

      const suffix = params.toString() ? `?${params.toString()}` : '';
      router.replace(`/bookmarks${suffix}`);
    },
    [router],
  );

  const loadDashboard = React.useCallback(
    async (
      nextToken: string,
      nextFilters: BookmarkFiltersState,
      options: { persistToken?: boolean; showError?: boolean } = {},
    ) => {
      setIsLoading(true);
      const result = await loadBookmarkDashboardAction({
        token: nextToken,
        query: nextFilters.query,
        categoryId: nextFilters.categoryId,
      });
      setIsLoading(false);

      if (!result.ok) {
        setData(null);
        setToken('');
        localStorage.removeItem(BOOKMARK_TOKEN_STORAGE_KEY);

        if (options.showError ?? true) {
          setMessage(labels.actionMessages[result.code]);
        }

        return false;
      }

      setToken(nextToken);
      setData(result.data);
      setMessage(null);

      if (options.persistToken) {
        localStorage.setItem(BOOKMARK_TOKEN_STORAGE_KEY, nextToken);
      }

      return true;
    },
    [labels.actionMessages],
  );

  React.useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const storedToken = localStorage.getItem(BOOKMARK_TOKEN_STORAGE_KEY) ?? '';

    if (!storedToken) {
      return;
    }

    void loadDashboard(storedToken, initialFiltersRef.current, {
      showError: false,
    });
  }, [hasHydrated, loadDashboard]);

  const updateFilters = (next: Partial<BookmarkFiltersState>) => {
    const nextFilters = {
      query: next.query ?? filters.query,
      categoryId: next.categoryId ?? filters.categoryId,
    };

    setFilters(nextFilters);
    updateUrl(nextFilters);

    if (token) {
      void loadDashboard(token, nextFilters, { showError: true });
    }
  };

  const runMutation = (
    form: HTMLFormElement,
    action: (formData: FormData) => Promise<BookmarkActionResult>,
  ) => {
    if (!token) {
      setMessage(labels.tokenRequired);
      return;
    }

    startTransition(async () => {
      const result = await action(createActionFormData(form, locale, token));
      setMessage(labels.actionMessages[result.code]);

      if (result.ok) {
        form.reset();
        setPanelMode(null);
        await loadDashboard(token, filters, { showError: true });
      }
    });
  };

  const deleteWithAction = (
    id: string,
    action: (formData: FormData) => Promise<BookmarkActionResult>,
  ) => {
    if (!token) {
      setMessage(labels.tokenRequired);
      return;
    }

    if (!window.confirm(labels.confirmDelete)) {
      return;
    }

    const formData = new FormData();
    formData.set('id', id);
    formData.set('locale', locale);
    formData.set('token', token);

    startTransition(async () => {
      const result = await action(formData);
      setMessage(labels.actionMessages[result.code]);

      if (result.ok) {
        await loadDashboard(token, filters, { showError: true });
      }
    });
  };

  const login = (nextToken: string) => {
    if (!nextToken) {
      setMessage(labels.tokenRequired);
      return;
    }

    void loadDashboard(nextToken, filters, {
      persistToken: true,
      showError: true,
    });
  };

  const logout = () => {
    localStorage.removeItem(BOOKMARK_TOKEN_STORAGE_KEY);
    setToken('');
    setData(null);
    setPanelMode(null);
    setMessage(null);
  };

  const handlePanelSubmit = (form: HTMLFormElement) => {
    if (!panelMode) {
      return;
    }

    if (panelMode.type === 'bookmark') {
      runMutation(
        form,
        panelMode.bookmark ? updateBookmarkAction : createBookmarkAction,
      );
      return;
    }

    runMutation(
      form,
      panelMode.category ? updateCategoryAction : createCategoryAction,
    );
  };

  const activeFilterCount =
    (filters.query ? 1 : 0) + (filters.categoryId ? 1 : 0);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {hasHydrated && !data && (
        <BookmarkAuthDialog
          labels={labels}
          message={message}
          isLoading={isLoading}
          onSubmit={login}
        />
      )}

      <section
        className={`mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 ${
          !data ? 'pointer-events-none opacity-40 blur-[1px]' : ''
        }`}
        aria-hidden={!data}
      >
        <header className="rounded-lg border bg-card px-5 py-4 shadow-sm lg:px-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {labels.title}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {labels.subtitle}
              </p>
              {data && (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    {labels.totalBookmarks}: {data.bookmarks.length}
                  </span>
                  <span>
                    {labels.totalCategories}: {data.categories.length}
                  </span>
                  <span>
                    {labels.activeFilters}: {activeFilterCount}
                  </span>
                </div>
              )}
            </div>

            {data && (
              <Button type="button" variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4" />
                {labels.logout}
              </Button>
            )}
          </div>
        </header>

        {data && !data.dbReady && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-sm">
            {labels.dbUnavailable}
          </div>
        )}

        {data && message && (
          <div className="rounded-lg border bg-card px-4 py-3 text-sm text-card-foreground shadow-sm">
            {message}
          </div>
        )}

        {data && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="min-w-0 space-y-5">
              <BookmarkToolbar
                query={filters.query}
                canCreateBookmark={data.categories.length > 0}
                labels={labels}
                onSearch={(nextQuery) => updateFilters({ query: nextQuery })}
                onCreateCategory={() => setPanelMode({ type: 'category' })}
                onCreateBookmark={() => setPanelMode({ type: 'bookmark' })}
              />

              {panelMode && (
                <BookmarkForms
                  panelMode={panelMode}
                  selectedCategoryId={filters.categoryId}
                  categoryTree={data.categoryTree}
                  labels={labels}
                  isPending={isPending}
                  onCancel={() => setPanelMode(null)}
                  onSubmit={handlePanelSubmit}
                />
              )}

              <BookmarkList
                bookmarks={data.bookmarks}
                labels={labels}
                onEdit={(bookmark: Bookmark) =>
                  setPanelMode({ type: 'bookmark', bookmark })
                }
                onDelete={(bookmarkId) =>
                  deleteWithAction(bookmarkId, deleteBookmarkAction)
                }
              />
            </section>

            <CategorySidebar
              nodes={data.categoryTree}
              selectedCategoryId={filters.categoryId}
              labels={labels}
              onSelect={(categoryId) => updateFilters({ categoryId })}
              onCreateCategory={() => setPanelMode({ type: 'category' })}
              onEdit={(category) =>
                setPanelMode({ type: 'category', category })
              }
              onDelete={(categoryId) =>
                deleteWithAction(categoryId, deleteCategoryAction)
              }
            />
          </div>
        )}
      </section>
    </main>
  );
}
