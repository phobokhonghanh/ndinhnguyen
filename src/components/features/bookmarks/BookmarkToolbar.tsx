'use client';

import { FolderPlus, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BookmarkDashboardLabels } from './types';

interface BookmarkToolbarProps {
  query: string;
  canCreateBookmark: boolean;
  labels: BookmarkDashboardLabels;
  onSearch: (query: string) => void;
  onCreateCategory: () => void;
  onCreateBookmark: () => void;
}

export function BookmarkToolbar({
  query,
  canCreateBookmark,
  labels,
  onSearch,
  onCreateCategory,
  onCreateBookmark,
}: BookmarkToolbarProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <form
          className="relative flex-1"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const value = formData.get('q');
            onSearch(typeof value === 'string' ? value.trim() : '');
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={query}
            placeholder={labels.searchPlaceholder}
            className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          />
        </form>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={onCreateCategory} variant="outline">
            <FolderPlus className="h-4 w-4" />
            {labels.addCategory}
          </Button>
          <Button
            type="button"
            onClick={onCreateBookmark}
            disabled={!canCreateBookmark}
          >
            <Plus className="h-4 w-4" />
            {labels.addBookmark}
          </Button>
        </div>
      </div>
    </div>
  );
}
