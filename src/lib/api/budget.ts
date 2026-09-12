import { apiFetch } from './client';

export type BudgetSource = 'template' | 'custom';

export interface BudgetTemplateBucket {
  label: string;
  percent: number;
}

export interface BudgetTemplate {
  id: string;
  name: string;
  buckets: BudgetTemplateBucket[];
}

export interface Allocation {
  categoryId: string;
  percent: number;
}

export interface Budget {
  id: string;
  name: string;
  source: BudgetSource;
  allocations: Allocation[];
  priority: number;
  activeFrom: string;
  activeTo: string | null;
}

export interface BudgetCheckAllocation {
  categoryId: string;
  categoryName: string;
  percent: number;
  limit: string;
  actual: string;
  breached: boolean;
}

export interface BudgetCheck {
  periodFrom: string;
  periodTo: string;
  totalIncome: string;
  allocations: BudgetCheckAllocation[];
}

export function getTemplates(token: string): Promise<BudgetTemplate[]> {
  return apiFetch<BudgetTemplate[]>('/budgets/templates', { token });
}

export function createBudget(
  token: string,
  input: {
    name: string;
    source: BudgetSource;
    templateId?: string;
    allocations: Allocation[];
    priority: number;
    activeFrom: string;
    activeTo?: string;
  },
): Promise<Budget> {
  return apiFetch<Budget>('/budgets', { method: 'POST', token, body: input });
}

export function listBudgets(token: string): Promise<Budget[]> {
  return apiFetch<Budget[]>('/budgets', { token });
}

export function checkBudget(token: string, budgetId: string): Promise<BudgetCheck> {
  return apiFetch<BudgetCheck>(`/budgets/${budgetId}/check`, { token });
}

export function updateBudgetPriority(token: string, budgetId: string, priority: number): Promise<Budget> {
  return apiFetch<Budget>(`/budgets/${budgetId}/priority`, { method: 'POST', token, body: { priority } });
}

export function deactivateBudget(token: string, budgetId: string): Promise<Budget> {
  return apiFetch<Budget>(`/budgets/${budgetId}/deactivate`, { method: 'POST', token });
}
