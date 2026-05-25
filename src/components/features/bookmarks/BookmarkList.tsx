'use client';

import {
  BookmarkIcon,
  Edit3,
  ExternalLink,
  LinkIcon,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCategoryColorPreset } from '@/lib/bookmarks/colors';
import type { Bookmark } from '@/lib/bookmarks/types';
import type { BookmarkDashboardLabels } from './types';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  labels: BookmarkDashboardLabels;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmarkId: string) => void;
}

export function BookmarkList({
  bookmarks,
  labels,
  onEdit,
  onDelete,
}: BookmarkListProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
          <BookmarkIcon className="h-4 w-4" />
          {labels.bookmarks}
        </h2>
        <span className="text-xs text-muted-foreground">
          {bookmarks.length}
        </span>
      </div>

      {bookmarks.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          {labels.emptyBookmarks}
        </p>
      ) : (
        <ul className="divide-y">
          {bookmarks.map((bookmark) => {
            const color = getCategoryColorPreset(bookmark.categoryColor);

            return (
              <li
                key={bookmark.id}
                className="grid gap-3 border-l-4 px-4 py-4 transition-all duration-200 hover:shadow-sm hover:ring-1 hover:ring-border/70 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
                style={{
                  borderLeftColor: color.foreground,
                  backgroundColor: color.background,
                }}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-semibold">
                      {bookmark.title}
                    </h3>
                    <span
                      className="rounded-full border px-2 py-0.5 text-xs"
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
      )}
    </div>
  );
}
