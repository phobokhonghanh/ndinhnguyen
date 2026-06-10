'use client';

import { Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCategoryColorPreset } from '@/lib/bookmarks/colors';
import type { Category } from '@/lib/bookmarks/types';
import type { BookmarkDashboardLabels } from './types';

interface CategoryCardsProps {
  categories: Category[];
  labels: BookmarkDashboardLabels;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

export function CategoryCards({
  categories,
  labels,
  onEdit,
  onDelete,
}: CategoryCardsProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card/95 p-4 shadow-sm backdrop-blur">
      <h2 className="mb-3 text-sm font-semibold text-foreground">
        {labels.categories}
      </h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const color = getCategoryColorPreset(category.color);

          return (
            <div
              key={category.id}
              className="flex min-w-0 items-center justify-between gap-2 rounded-md border px-3 py-2 transition-all duration-200 hover:bg-background/70"
              style={{
                borderColor: color.border,
                backgroundColor: color.background,
              }}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color.foreground }}
                />
                <span className="truncate text-sm">{category.name}</span>
              </span>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-xs"
                  title={labels.edit}
                  onClick={() => onEdit(category)}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-xs"
                  title={labels.delete}
                  onClick={() => onDelete(category.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
