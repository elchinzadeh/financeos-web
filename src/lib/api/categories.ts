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

export function listCategories(token: string): Promise<Category[]> {
  return apiFetch<Category[]>('/categories', { token });
}
