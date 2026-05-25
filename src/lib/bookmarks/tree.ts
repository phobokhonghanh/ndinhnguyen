import type { Category, CategoryTreeNode } from './types';

export const buildCategoryTree = (
  categories: Category[],
): CategoryTreeNode[] => {
  const nodes = new Map<string, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  for (const category of categories) {
    nodes.set(category.id, { ...category, children: [] });
  }

  for (const node of nodes.values()) {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
};

export const getCategoryDescendantIds = (
  categories: Category[],
  categoryId: string,
): string[] => {
  const childrenByParent = new Map<string, Category[]>();

  for (const category of categories) {
    if (!category.parentId) {
      continue;
    }

    const siblings = childrenByParent.get(category.parentId) ?? [];
    siblings.push(category);
    childrenByParent.set(category.parentId, siblings);
  }

  const ids = new Set<string>([categoryId]);
  const stack = [categoryId];

  while (stack.length > 0) {
    const currentId = stack.pop();
    if (!currentId) {
      continue;
    }

    for (const child of childrenByParent.get(currentId) ?? []) {
      ids.add(child.id);
      stack.push(child.id);
    }
  }

  return Array.from(ids);
};
