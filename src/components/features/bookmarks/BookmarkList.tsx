'use client';

import * as React from 'react';
import {
  Edit3,
  ExternalLink,
  LinkIcon,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCategoryColorPreset } from '@/lib/bookmarks/colors';
import type { Bookmark, PaginationMetadata, BookmarkFilters } from '@/lib/bookmarks/types';
import type { BookmarkDashboardLabels } from './types';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  pagination: PaginationMetadata;
  filters: BookmarkFilters;
  labels: BookmarkDashboardLabels;
  isLoading: boolean;
  canCreateBookmark: boolean;
  onUpdateFilters: (next: Partial<BookmarkFilters>) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmarkId: string) => void;
  onCreateBookmark: () => void;
}

export function BookmarkList({
  bookmarks,
  pagination,
  filters,
  labels,
  isLoading,
  canCreateBookmark,
  onUpdateFilters,
  onEdit,
  onDelete,
  onCreateBookmark,
}: BookmarkListProps) {
  // Client-side local sorting states
  const [localSortBy, setLocalSortBy] = React.useState<'createdAt' | 'title' | 'url'>(filters.sortBy ?? 'createdAt');
  const [localSortOrder, setLocalSortOrder] = React.useState<'asc' | 'desc'>(filters.sortOrder ?? 'desc');
  const [isAdvancedSortOpen, setIsAdvancedSortOpen] = React.useState(false);
  const [prevBookmarks, setPrevBookmarks] = React.useState(bookmarks);

  // Chuẩn React: Adjusting state during render (Tránh useEffect gây dư thừa render)
  if (bookmarks !== prevBookmarks) {
    setPrevBookmarks(bookmarks);
    setLocalSortBy(filters.sortBy ?? 'createdAt');
    setLocalSortOrder(filters.sortOrder ?? 'desc');
  }

  const handleLocalSort = (field: 'createdAt' | 'title' | 'url') => {
    if (localSortBy === field) {
      setLocalSortOrder(localSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setLocalSortBy(field);
      setLocalSortOrder(field === 'createdAt' ? 'desc' : 'asc');
    }
  };

  const renderLocalSortHeader = (field: 'createdAt' | 'title' | 'url', label: string) => {
    const isSorted = localSortBy === field;
    const isAsc = localSortOrder === 'asc';

    return (
      <button
        type="button"
        onClick={() => handleLocalSort(field)}
        className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider outline-none transition-colors hover:text-foreground ${isSorted ? 'text-foreground font-bold' : 'text-muted-foreground'
          }`}
      >
        {label}
        {isSorted ? (
          isAsc ? (
            <ArrowUp className="h-3.5 w-3.5 text-primary" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 text-primary" />
          )
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-30" />
        )}
      </button>
    );
  };

  // Perform sorting on the current page's bookmarks locally
  const sortedBookmarks = React.useMemo(() => {
    return [...bookmarks].sort((a, b) => {
      let valA: string | number = a[localSortBy] ?? '';
      let valB: string | number = b[localSortBy] ?? '';

      if (localSortBy === 'createdAt') {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      } else {
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();
      }

      if (valA < valB) return localSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return localSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [bookmarks, localSortBy, localSortOrder]);



  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5">
      {/* 1. Card Search & Advanced API Sort */}
      <div className="flex flex-col overflow-hidden rounded-md border bg-background shadow-sm transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-1.5 gap-2">
          <form
            className="flex w-full flex-1 items-center gap-1"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const value = formData.get('q');
              onUpdateFilters({ query: typeof value === 'string' ? value.trim() : '', page: 1 });
            }}
          >
            <div className="relative flex-1 flex items-center">
              {isLoading ? (
                <Loader2 className="absolute left-3 h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
              )}
              <input
                name="q"
                defaultValue={filters.query}
                disabled={isLoading}
                placeholder={labels.searchPlaceholder}
                className="h-9 w-full bg-transparent pl-9 pr-3 text-sm outline-none disabled:opacity-75"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              size="sm"
              className="h-8 px-3 shrink-0"
              title={labels.searchPlaceholder}
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <div className="px-2 shrink-0 border-l border-transparent sm:border-muted pl-2">
            <button
              type="button"
              onClick={() => setIsAdvancedSortOpen(!isAdvancedSortOpen)}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>{labels.advancedSort}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isAdvancedSortOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {isAdvancedSortOpen && (
          <div className="flex flex-wrap items-center gap-3 border-t bg-muted/20 px-3 py-2.5 animate-in slide-in-from-top-1">
            <span className="text-xs text-muted-foreground font-medium">
              {labels.advancedSortLabel}:
            </span>
            <select
              value={filters.sortBy ?? 'createdAt'}
              onChange={(e) => onUpdateFilters({ sortBy: e.target.value as 'createdAt' | 'title' | 'url', page: 1 })}
              className="h-7 rounded bg-background px-2 text-xs outline-none border border-input focus:ring-1 focus:ring-ring"
            >
              <option value="createdAt">{labels.sortCreatedAt}</option>
              <option value="title">{labels.bookmarkTitle}</option>
              <option value="url">{labels.bookmarkUrl}</option>
            </select>
            <select
              value={filters.sortOrder ?? 'desc'}
              onChange={(e) => onUpdateFilters({ sortOrder: e.target.value as 'asc' | 'desc', page: 1 })}
              className="h-7 rounded bg-background px-2 text-xs outline-none border border-input focus:ring-1 focus:ring-ring"
            >
              <option value="asc">{labels.sortAsc}</option>
              <option value="desc">{labels.sortDesc}</option>
            </select>
          </div>
        )}
      </div>

      {/* 2. Card Bookmarks List & Local Sort */}
      <div className="flex flex-col overflow-hidden rounded-md border bg-card shadow-sm">
        {/* Header of the list card */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b bg-muted/30 px-3 py-2">
          {/* Add Button (Left) */}
          <Button
            type="button"
            onClick={onCreateBookmark}
            disabled={!canCreateBookmark || isLoading}
            size="icon-sm"
            variant="secondary"
            className="h-8 w-8 shrink-0 bg-background shadow-sm hover:bg-muted"
            title={labels.addBookmark}
          >
            <Plus className="h-4 w-4" />
          </Button>

          {/* Local Sort Headers (Right) */}
          <div className="flex items-center gap-4 text-xs pr-1">
            <span className="hidden sm:inline-block text-muted-foreground font-medium mr-1">
              {labels.localSort}
            </span>
            {renderLocalSortHeader('title', labels.bookmarkTitle)}
            {renderLocalSortHeader('url', labels.bookmarkUrl)}
            {renderLocalSortHeader('createdAt', labels.sortCreatedAt)}
          </div>
        </div>

      {sortedBookmarks.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          {labels.emptyBookmarks}
        </p>
      ) : (
        <>
          <ul className="divide-y">
            {sortedBookmarks.map((bookmark) => {
              const color = getCategoryColorPreset(bookmark.categoryColor);

              return (
                <li
                  key={bookmark.id}
                  className="grid gap-3 border-l-4 bg-background px-4 py-4 transition-colors hover:bg-muted/30 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
                  style={{
                    borderLeftColor: color.foreground,
                    backgroundColor: color.background,
                  }}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-semibold tracking-tight">
                        {bookmark.title}
                      </h3>
                      <span
                        className="rounded-md border px-2 py-0.5 text-xs font-medium"
                        style={{
                          borderColor: color.border,
                          color: color.foreground,
                          backgroundColor: color.background,
                        }}
                      >
                        {bookmark.categoryName}
                      </span>
                    </div>
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex min-w-0 items-center gap-1 text-sm text-primary transition-colors hover:text-primary/80 hover:underline"
                    >
                      <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{bookmark.url}</span>
                    </a>
                    {bookmark.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {bookmark.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      asChild
                      title={labels.open}
                    >
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      title={labels.edit}
                      onClick={() => onEdit(bookmark)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      title={labels.delete}
                      onClick={() => onDelete(bookmark.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>


        </>
      )}
      </div>
    </div>
  );
}
