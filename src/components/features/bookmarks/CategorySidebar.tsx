'use client';

import { ChevronRight, Folder, FolderOpen, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getCategoryColorPreset,
  type CategoryColorId,
} from '@/lib/bookmarks/colors';
import type { CategoryTreeNode } from '@/lib/bookmarks/types';
import type { BookmarkDashboardLabels } from './types';

interface CategorySidebarProps {
  nodes: CategoryTreeNode[];
  selectedCategoryId: string;
  labels: BookmarkDashboardLabels;
  onSelect: (categoryId: string) => void;
  onCreateCategory: () => void;
}

function CategoryDot({ color }: { color: CategoryColorId }) {
  const preset = getCategoryColorPreset(color);

  return (
    <span
      className="size-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: preset.foreground }}
    />
  );
}

export function CategorySidebar({
  nodes,
  selectedCategoryId,
  labels,
  onSelect,
  onCreateCategory,
}: CategorySidebarProps) {
  const renderNode = (node: CategoryTreeNode) => {
    const isSelected = selectedCategoryId === node.id;
    const hasChildren = node.children.length > 0;
    const color = getCategoryColorPreset(node.color);
    const FolderIcon = isSelected || hasChildren ? FolderOpen : Folder;

    return (
      <li key={node.id} className="relative pl-3">
        <span className="absolute left-0 top-0 h-full w-px bg-border" />
        <span className="absolute left-0 top-5 h-px w-3 bg-border" />
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className={`group flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring ${
            isSelected
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-muted/80'
          }`}
        >
          <span className="flex min-w-0 items-center gap-2">
            <ChevronRight
              className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                hasChildren ? 'rotate-90 opacity-80' : 'opacity-20'
              }`}
            />
            <FolderIcon
              className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110"
              style={{ color: isSelected ? undefined : color.foreground }}
            />
            <CategoryDot color={node.color} />
            <span className="truncate">{node.name}</span>
          </span>
          {hasChildren && (
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                isSelected
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {node.children.length}
            </span>
          )}
        </button>
        {hasChildren && (
          <ul className="ml-4 mt-1 space-y-1">
            {node.children.map((child) => renderNode(child))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <aside className="rounded-lg border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">
          {labels.categories}
        </h2>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          title={labels.addCategory}
          onClick={onCreateCategory}
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
      </div>
      <button
        type="button"
        onClick={() => onSelect('')}
        className={`mb-3 flex w-full items-center rounded-md px-3 py-2 text-left text-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring ${
          selectedCategoryId
            ? 'text-foreground hover:bg-muted/80'
            : 'bg-primary text-primary-foreground'
        }`}
      >
        {labels.allCategories}
      </button>
      {nodes.length === 0 ? (
        <p className="px-3 text-sm text-muted-foreground">
          {labels.emptyCategories}
        </p>
      ) : (
        <ul className="space-y-1">{nodes.map((node) => renderNode(node))}</ul>
      )}
    </aside>
  );
}
