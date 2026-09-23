import { apiFetch } from './client';

export type CategoryKind = 'income' | 'expense';

export interface Category {
  id: string;
  userId: string | null;
  parentId: string | null;
  name: string;
  kind: CategoryKind;
  icon: string | null;
}

export const DELETE_CATEGORY_STRATEGIES = ['reassign', 'uncategorize', 'delete', 'archive'] as const;
export type DeleteCategoryStrategy = (typeof DELETE_CATEGORY_STRATEGIES)[number];

export function listCategories(token: string): Promise<Category[]> {
  return apiFetch<Category[]>('/categories', { token });
}

export function createCategory(
  token: string,
  input: { name: string; kind: CategoryKind; parentId?: string; icon?: string },
): Promise<Category> {
  return apiFetch<Category>('/categories', { method: 'POST', token, body: input });
}

export function updateCategory(
  token: string,
  id: string,
  input: { name?: string; icon?: string; parentId?: string | null },
): Promise<Category> {
  return apiFetch<Category>(`/categories/${id}`, { method: 'PATCH', token, body: input });
}

export function deleteCategory(
  token: string,
  id: string,
  input: { strategy: DeleteCategoryStrategy; targetCategoryId?: string },
): Promise<{ strategy: DeleteCategoryStrategy; affectedCount: number }> {
  return apiFetch(`/categories/${id}`, { method: 'DELETE', token, body: input });
}
