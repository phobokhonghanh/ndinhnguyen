import type {
  Bookmark,
  BookmarkDashboardData,
  BookmarkFilters,
  Category,
} from './types';
import type { BookmarkInput, CategoryInput } from './validation';
import type { D1DatabaseBinding } from './d1-types';
import { normalizeCategoryColor } from './colors';
import { buildCategoryTree, getCategoryDescendantIds } from './tree';
import { slugifyCategoryName } from './validation';

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  color: string;
  parent_id: string | null;
  created_at: string;
}

interface BookmarkRow {
  id: string;
  title: string;
  url: string;
  description: string | null;
  category_id: string;
  category_name: string;
  category_slug: string;
  category_color: string;
  created_at: string;
  updated_at: string;
}

const mapCategory = (row: CategoryRow): Category => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  color: normalizeCategoryColor(row.color),
  parentId: row.parent_id,
  createdAt: row.created_at,
});

const mapBookmark = (row: BookmarkRow): Bookmark => ({
  id: row.id,
  title: row.title,
  url: row.url,
  description: row.description,
  categoryId: row.category_id,
  categoryName: row.category_name,
  categorySlug: row.category_slug,
  categoryColor: normalizeCategoryColor(row.category_color),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const listCategories = async (
  db: D1DatabaseBinding,
): Promise<Category[]> => {
  const { results } = await db
    .prepare(
      `SELECT id, name, slug, color, parent_id, created_at
       FROM categories
       ORDER BY parent_id IS NOT NULL, name COLLATE NOCASE ASC`,
    )
    .all<CategoryRow>();

  return results.map(mapCategory);
};

export const listBookmarks = async (
  db: D1DatabaseBinding,
  filters: BookmarkFilters,
  categoryIds: string[],
): Promise<Bookmark[]> => {
  const query = filters.query?.trim();
  const conditions: string[] = [];
  const values: Array<string | number | null> = [];

  if (query) {
    conditions.push(
      '(bookmarks.title LIKE ? OR bookmarks.url LIKE ? OR bookmarks.description LIKE ?)',
    );
    const pattern = `%${query}%`;
    values.push(pattern, pattern, pattern);
  }

  if (categoryIds.length > 0) {
    conditions.push(
      `bookmarks.category_id IN (${categoryIds.map(() => '?').join(', ')})`,
    );
    values.push(...categoryIds);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const { results } = await db
    .prepare(
      `SELECT bookmarks.id,
              bookmarks.title,
              bookmarks.url,
              bookmarks.description,
              bookmarks.category_id,
              bookmarks.created_at,
              bookmarks.updated_at,
              categories.name AS category_name,
              categories.slug AS category_slug,
              categories.color AS category_color
       FROM bookmarks
       INNER JOIN categories ON categories.id = bookmarks.category_id
       ${where}
       ORDER BY bookmarks.updated_at DESC, bookmarks.created_at DESC`,
    )
    .bind(...values)
    .all<BookmarkRow>();

  return results.map(mapBookmark);
};

export const getBookmarkDashboardData = async (
  db: D1DatabaseBinding | null,
  filters: BookmarkFilters,
): Promise<BookmarkDashboardData> => {
  if (!db) {
    return {
      bookmarks: [],
      categories: [],
      categoryTree: [],
      selectedCategoryIds: [],
      dbReady: false,
    };
  }

  const categories = await listCategories(db);
  const selectedCategoryIds = filters.categoryId
    ? getCategoryDescendantIds(categories, filters.categoryId)
    : [];
  const bookmarks = await listBookmarks(db, filters, selectedCategoryIds);

  return {
    bookmarks,
    categories,
    categoryTree: buildCategoryTree(categories),
    selectedCategoryIds,
    dbReady: true,
  };
};

const getUniqueSlug = async (
  db: D1DatabaseBinding,
  name: string,
  categoryId?: string,
): Promise<string> => {
  const baseSlug = slugifyCategoryName(name);
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await db
      .prepare('SELECT id FROM categories WHERE slug = ? LIMIT 1')
      .bind(slug)
      .first<{ id: string }>();

    if (!existing || existing.id === categoryId) {
      return slug;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
};

export const createCategory = async (
  db: D1DatabaseBinding,
  input: CategoryInput,
): Promise<void> => {
  const id = crypto.randomUUID();
  const slug = await getUniqueSlug(db, input.name);

  await db
    .prepare(
      `INSERT INTO categories (id, name, slug, color, parent_id)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(id, input.name, slug, input.color, input.parentId)
    .run();
};

export const updateCategory = async (
  db: D1DatabaseBinding,
  id: string,
  input: CategoryInput,
): Promise<boolean> => {
  const slug = await getUniqueSlug(db, input.name, id);
  const result = await db
    .prepare(
      `UPDATE categories
       SET name = ?, slug = ?, color = ?, parent_id = ?
       WHERE id = ?`,
    )
    .bind(input.name, slug, input.color, input.parentId, id)
    .run();

  return result.success;
};

export const deleteCategory = async (
  db: D1DatabaseBinding,
  id: string,
): Promise<'deleted' | 'has_children' | 'in_use'> => {
  const child = await db
    .prepare('SELECT id FROM categories WHERE parent_id = ? LIMIT 1')
    .bind(id)
    .first<{ id: string }>();

  if (child) {
    return 'has_children';
  }

  const bookmark = await db
    .prepare('SELECT id FROM bookmarks WHERE category_id = ? LIMIT 1')
    .bind(id)
    .first<{ id: string }>();

  if (bookmark) {
    return 'in_use';
  }

  await db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
  return 'deleted';
};

export const createBookmark = async (
  db: D1DatabaseBinding,
  input: BookmarkInput,
): Promise<void> => {
  await db
    .prepare(
      `INSERT INTO bookmarks (id, title, url, description, category_id)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      input.title,
      input.url,
      input.description,
      input.categoryId,
    )
    .run();
};

export const updateBookmark = async (
  db: D1DatabaseBinding,
  id: string,
  input: BookmarkInput,
): Promise<boolean> => {
  const result = await db
    .prepare(
      `UPDATE bookmarks
       SET title = ?, url = ?, description = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
    )
    .bind(input.title, input.url, input.description, input.categoryId, id)
    .run();

  return result.success;
};

export const deleteBookmark = async (
  db: D1DatabaseBinding,
  id: string,
): Promise<void> => {
  await db.prepare('DELETE FROM bookmarks WHERE id = ?').bind(id).run();
};
