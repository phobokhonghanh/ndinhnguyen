'use client';

import * as React from 'react';
import { LogOut, Bookmark as BookmarkIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/features/i18n/LanguageSwitcher';
import { ThemeToggle } from '@/components/features/theme/ThemeToggle';
import {
  createBookmark,
  createCategory,
  deleteBookmark,
  deleteCategory,
  loadBookmarkDashboard,
  updateBookmark,
  updateCategory,
} from '@/lib/bookmarks/api';
import { BOOKMARK_TOKEN_STORAGE_KEY } from '@/lib/bookmarks/constants';
import type {
  Bookmark,
  BookmarkActionResult,
  BookmarkDashboardData,
} from '@/lib/bookmarks/types';
import { BookmarkAuthDialog } from './BookmarkAuthDialog';
import { BookmarkForms } from './BookmarkForms';
import { BookmarkList } from './BookmarkList';
import { CategorySidebar } from './CategorySidebar';
import type { BookmarkDashboardLabels, PanelMode } from './types';

interface BookmarkDashboardProps {
  labels: BookmarkDashboardLabels;
}

interface BookmarkFiltersState {
  query: string;
  categoryId: string;
  page: number;
  pageSize: number;
  sortBy: 'createdAt' | 'title' | 'url';
  sortOrder: 'asc' | 'desc';
}

const subscribeHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;
const DEFAULT_FILTERS: BookmarkFiltersState = {
  query: '',
  categoryId: '',
  page: 1,
  pageSize: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export function BookmarkDashboard({
  labels,
}: BookmarkDashboardProps) {
  const hasHydrated = React.useSyncExternalStore(
    subscribeHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const [token, setToken] = React.useState('');
  const [filters, setFilters] = React.useState<BookmarkFiltersState>(DEFAULT_FILTERS);
  const [selectedSidebarCategoryId, setSelectedSidebarCategoryId] = React.useState<string>('');
  const [data, setData] = React.useState<BookmarkDashboardData | null>(null);
  const [panelMode, setPanelMode] = React.useState<PanelMode>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const updateUrl = React.useCallback(
    (nextFilters: BookmarkFiltersState) => {
      const params = new URLSearchParams();

      if (nextFilters.query) {
        params.set('q', nextFilters.query);
      }

      if (nextFilters.categoryId) {
        params.set('category', nextFilters.categoryId);
      }

      if (nextFilters.page !== 1) {
        params.set('page', nextFilters.page.toString());
      }

      if (nextFilters.pageSize !== 20) {
        params.set('pageSize', nextFilters.pageSize.toString());
      }

      if (nextFilters.sortBy !== 'createdAt') {
        params.set('sortBy', nextFilters.sortBy);
      }

      if (nextFilters.sortOrder !== 'desc') {
        params.set('sortOrder', nextFilters.sortOrder);
      }

      const suffix = params.toString() ? `?${params.toString()}` : '';
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${suffix}`,
      );
    },
    [],
  );

  const loadDashboard = React.useCallback(
    async (
      nextToken: string,
      nextFilters: BookmarkFiltersState,
      options: { persistToken?: boolean; showError?: boolean; skipCategories?: boolean } = {},
    ) => {
      setIsLoading(true);
      const result = await loadBookmarkDashboard({
        token: nextToken,
        query: nextFilters.query,
        categoryId: nextFilters.categoryId,
        page: nextFilters.page,
        pageSize: nextFilters.pageSize,
        sortBy: nextFilters.sortBy,
        sortOrder: nextFilters.sortOrder,
        skipCategories: options.skipCategories,
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
      setData((prevData) => {
        if (!prevData) return result.data;
        return {
          ...result.data,
          categories: options.skipCategories ? prevData.categories : result.data.categories,
          categoryTree: options.skipCategories ? prevData.categoryTree : result.data.categoryTree,
        };
      });
      setMessage(null);

      // Keep sidebar selection synced if category is filtered, otherwise don't override
      if (nextFilters.categoryId) {
        setSelectedSidebarCategoryId(nextFilters.categoryId);
      }

      if (options.persistToken) {
        localStorage.setItem(BOOKMARK_TOKEN_STORAGE_KEY, nextToken);
      }

      return true;
    },
    [labels.actionMessages],
  );

  const isInitialMount = React.useRef(true);

  React.useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isInitialMount.current) {
      return;
    }
    isInitialMount.current = false;

    // Parse URL on the client strictly after hydration to avoid mismatch
    const params = new URLSearchParams(window.location.search);
    const sortByParam = params.get('sortBy');
    const sortOrderParam = params.get('sortOrder');

    const initialFilters: BookmarkFiltersState = {
      query: params.get('q') ?? '',
      categoryId: params.get('category') ?? '',
      page: parseInt(params.get('page') ?? '1', 10),
      pageSize: parseInt(params.get('pageSize') ?? '20', 10),
      sortBy: sortByParam === 'createdAt' || sortByParam === 'title' || sortByParam === 'url' ? sortByParam : 'createdAt',
      sortOrder: sortOrderParam === 'asc' || sortOrderParam === 'desc' ? sortOrderParam : 'desc',
    };

    setFilters(initialFilters);

    const storedToken = localStorage.getItem(BOOKMARK_TOKEN_STORAGE_KEY) ?? '';

    if (!storedToken) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadDashboard(storedToken, initialFilters, {
        showError: false,
      });
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [hasHydrated, loadDashboard]);

  const updateFilters = (next: Partial<BookmarkFiltersState>) => {
    const nextFilters = {
      query: next.query ?? filters.query,
      categoryId: next.categoryId !== undefined ? next.categoryId : filters.categoryId,
      page: (next.query !== undefined && next.query !== filters.query) || (next.categoryId !== undefined && next.categoryId !== filters.categoryId)
        ? 1
        : (next.page ?? filters.page),
      pageSize: next.pageSize ?? filters.pageSize,
      sortBy: next.sortBy ?? filters.sortBy,
      sortOrder: next.sortOrder ?? filters.sortOrder,
    };

    setFilters(nextFilters);
    updateUrl(nextFilters);

    if (token) {
      void loadDashboard(token, nextFilters, { showError: true, skipCategories: true });
    }
  };

  const runMutation = (
    form: HTMLFormElement,
    action: (
      token: string,
      formData: FormData,
    ) => Promise<BookmarkActionResult>,
  ) => {
    if (!token) {
      setMessage(labels.tokenRequired);
      return;
    }

    startTransition(async () => {
      const result = await action(token, new FormData(form));
      setMessage(labels.actionMessages[result.code]);

      if (result.ok) {
        form.reset();
        setPanelMode(null);
        await loadDashboard(token, filters, {
          showError: true,
          skipCategories: panelMode?.type !== 'category',
        });
      }
    });
  };

  const deleteWithAction = (
    id: string,
    action: (token: string, id: string) => Promise<BookmarkActionResult>,
    isCategory: boolean = false,
  ) => {
    if (!token) {
      setMessage(labels.tokenRequired);
      return;
    }

    if (!window.confirm(labels.confirmDelete)) {
      return;
    }

    startTransition(async () => {
      const result = await action(token, id);
      setMessage(labels.actionMessages[result.code]);

      if (result.ok) {
        await loadDashboard(token, filters, {
          showError: true,
          skipCategories: !isCategory,
        });
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
    setSelectedSidebarCategoryId('');
  };

  const handlePanelSubmit = (form: HTMLFormElement) => {
    if (!panelMode) {
      return;
    }

    if (panelMode.type === 'bookmark') {
      runMutation(
        form,
        panelMode.bookmark ? updateBookmark : createBookmark,
      );
      return;
    }

    runMutation(
      form,
      panelMode.category ? updateCategory : createCategory,
    );
  };

  const activeFilterCount =
    (filters.query ? 1 : 0) + (filters.categoryId ? 1 : 0);

  const totalPages = data?.pagination.totalPages ?? 0;
  const currentPage = data?.pagination.page ?? 1;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 6. Header Navbar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-end border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-1 sm:gap-2">
          {data && (
            <Button type="button" variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground hidden sm:flex">
              <LogOut className="h-4 w-4 mr-2" />
              {labels.logout}
            </Button>
          )}
          {data && <div className="h-4 w-px bg-border mx-1 hidden sm:block"></div>}
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {hasHydrated && !data && (
        <BookmarkAuthDialog
          labels={labels}
          message={message}
          isLoading={isLoading}
          onSubmit={login}
        />
      )}

      <section
        className={`mx-auto flex w-full flex-1 max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8 ${
          !data ? 'pointer-events-none opacity-40 blur-[1px]' : ''
        }`}
        aria-hidden={!data}
      >
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
          <div className="flex flex-1 flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
            {/* Main Bookmark Container Header */}
            <div className="border-b bg-muted/20 px-4 py-3 sm:px-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <BookmarkIcon className="h-4 w-4 text-primary" />
                {labels.bookmarks}
              </h2>
            </div>

            {/* Sidebar & List Layout */}
            <div className="flex min-h-0 flex-1 flex-col divide-y lg:flex-row lg:divide-x lg:divide-y-0">
              <div className="flex w-full shrink-0 flex-col bg-muted/5 lg:w-[280px] xl:w-[320px]">
                <CategorySidebar
                  nodes={data.categoryTree}
                  selectedCategoryId={selectedSidebarCategoryId}
                  filterCategoryId={filters.categoryId}
                  labels={labels}
                  onSelect={(categoryId) => setSelectedSidebarCategoryId(categoryId)}
                  onFilter={(categoryId) => updateFilters({ categoryId })}
                  onCreateCategory={() => setPanelMode({ type: 'category' })}
                  onEdit={(category) =>
                    setPanelMode({ type: 'category', category })
                  }
                  onDelete={(categoryId) =>
                    deleteWithAction(categoryId, deleteCategory, true)
                  }
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col bg-card">
                {panelMode && (
                  <div className="border-b p-4 sm:p-5">
                    <BookmarkForms
                      panelMode={panelMode}
                      selectedCategoryId={selectedSidebarCategoryId}
                      categoryTree={data.categoryTree}
                      labels={labels}
                      isPending={isPending}
                      onCancel={() => setPanelMode(null)}
                      onSubmit={handlePanelSubmit}
                    />
                  </div>
                )}

                <BookmarkList
                  bookmarks={data.bookmarks}
                  pagination={data.pagination}
                  filters={filters}
                  labels={labels}
                  isLoading={isLoading || isPending}
                  canCreateBookmark={data.categories.length > 0}
                  onUpdateFilters={updateFilters}
                  onEdit={(bookmark: Bookmark) =>
                    setPanelMode({ type: 'bookmark', bookmark })
                  }
                  onDelete={(bookmarkId) =>
                    deleteWithAction(bookmarkId, deleteBookmark, false)
                  }
                  onCreateBookmark={() => setPanelMode({ type: 'bookmark' })}
                />
              </div>
            </div>

            {/* Main Bookmark Container Footer (Stats + Pagination) */}
            <div className="flex flex-col gap-4 border-t bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              {/* Stats on Left */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span className="font-medium">
                  {labels.totalBookmarks}: <span className="text-foreground">{data.pagination.total}</span>
                </span>
                <span className="font-medium">
                  {labels.totalCategories}: <span className="text-foreground">{data.categories.length}</span>
                </span>
                <span className="font-medium">
                  {labels.activeFilters}: <span className="text-foreground">{activeFilterCount}</span>
                </span>
              </div>

              {/* Pagination on Right */}
              {data.bookmarks.length > 0 && (
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">{labels.pageSize}:</span>
                    <select
                      value={filters.pageSize ?? 20}
                      onChange={(e) =>
                        updateFilters({ pageSize: parseInt(e.target.value, 10), page: 1 })
                      }
                      className="h-7 rounded border bg-background px-2 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-ring"
                    >
                      {[10, 20, 50, 100].map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 ml-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className="h-8 w-8 shrink-0"
                      disabled={currentPage <= 1}
                      onClick={() => updateFilters({ page: currentPage - 1 })}
                      title={labels.previous}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="px-2 font-medium text-xs text-foreground shrink-0 min-w-[70px] text-center">
                      {labels.page} {currentPage} / {totalPages}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className="h-8 w-8 shrink-0"
                      disabled={currentPage >= totalPages}
                      onClick={() => updateFilters({ page: currentPage + 1 })}
                      title={labels.next}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
