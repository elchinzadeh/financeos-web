import { apiFetch } from './client';

export type GoalStatus = 'active' | 'completed' | 'abandoned';

export interface GoalProgress {
  currentAmount: string | null;
  percent: number | null;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: string;
  targetCurrency: string;
  targetDate: string | null;
  linkedAccountId: string | null;
  status: GoalStatus;
  createdAt: string;
  progress: GoalProgress;
}

export function createGoal(
  token: string,
  input: { name: string; targetAmount: string; targetCurrency: string; targetDate?: string; linkedAccountId?: string },
): Promise<Goal> {
  return apiFetch<Goal>('/goals', { method: 'POST', token, body: input });
}

export function listGoals(token: string, status?: GoalStatus): Promise<Goal[]> {
  const query = status ? `?status=${status}` : '';
  return apiFetch<Goal[]>(`/goals${query}`, { token });
}

export function completeGoal(token: string, goalId: string): Promise<Goal> {
  return apiFetch<Goal>(`/goals/${goalId}/complete`, { method: 'POST', token });
}

export function abandonGoal(token: string, goalId: string): Promise<Goal> {
  return apiFetch<Goal>(`/goals/${goalId}/abandon`, { method: 'POST', token });
}
