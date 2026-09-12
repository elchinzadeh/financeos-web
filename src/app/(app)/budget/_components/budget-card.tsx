'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  checkBudget,
  deactivateBudget,
  updateBudgetPriority,
  type Budget,
  type BudgetCheck,
} from '@/lib/api/budget';
import type { Category } from '@/lib/api/categories';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorText } from '@/components/ui/error-text';

export function BudgetCard({ budget, token, categories }: { budget: Budget; token: string; categories: Category[] }) {
  const queryClient = useQueryClient();
  const [checkResult, setCheckResult] = useState<BudgetCheck | null>(null);
  const [priorityInput, setPriorityInput] = useState(String(budget.priority));
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const checkMutation = useMutation({
    mutationFn: () => checkBudget(token, budget.id),
    onSuccess: (data) => setCheckResult(data),
  });

  const priorityMutation = useMutation({
    mutationFn: (priority: number) => updateBudgetPriority(token, budget.id, priority),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] }),
  });

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateBudget(token, budget.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] }),
  });

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-900">{budget.name}</p>
          <p className="text-xs text-zinc-500">
            {budget.source === 'template' ? 'Şablon' : 'Xüsusi'} · {budget.activeFrom.slice(0, 10)}
            {budget.activeTo ? ` – ${budget.activeTo.slice(0, 10)}` : ' – davamlı'}
          </p>
        </div>
        <Button
          variant="danger"
          onClick={() => {
            if (window.confirm(`"${budget.name}" büdcəsini deaktiv etmək istədiyinizə əminsiniz?`)) {
              deactivateMutation.mutate();
            }
          }}
          disabled={deactivateMutation.isPending}
        >
          Deaktiv et
        </Button>
      </div>

      <ul className="text-sm text-zinc-600">
        {budget.allocations.map((a) => (
          <li key={a.categoryId}>
            {categoryById.get(a.categoryId)?.name ?? a.categoryId}: {a.percent}%
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-500">Prioritet:</span>
        <input
          type="number"
          className="w-16 rounded-md border border-zinc-300 px-2 py-1 text-sm"
          value={priorityInput}
          onChange={(e) => setPriorityInput(e.target.value)}
        />
        <Button
          variant="secondary"
          onClick={() => priorityMutation.mutate(Number(priorityInput))}
          disabled={priorityMutation.isPending}
        >
          Saxla
        </Button>
        <Button variant="secondary" onClick={() => checkMutation.mutate()} disabled={checkMutation.isPending}>
          {checkMutation.isPending ? 'Yoxlanır...' : 'Yoxla'}
        </Button>
      </div>

      {(checkMutation.isError || priorityMutation.isError || deactivateMutation.isError) && (
        <ErrorText>
          {[checkMutation, priorityMutation, deactivateMutation]
            .map((m) => (m.error instanceof ApiError ? m.error.message : null))
            .find(Boolean)}
        </ErrorText>
      )}

      {checkResult && (
        <div className="rounded-md bg-zinc-50 p-3 text-sm">
          <p className="mb-2 text-zinc-500">
            {checkResult.periodFrom.slice(0, 10)} – {checkResult.periodTo.slice(0, 10)} · dövr gəliri:{' '}
            {checkResult.totalIncome}
          </p>
          <ul className="flex flex-col gap-1">
            {checkResult.allocations.map((a) => (
              <li key={a.categoryId} className={a.breached ? 'text-red-600' : 'text-zinc-700'}>
                {a.categoryName}: {a.actual} / {a.limit} ({a.percent}%){a.breached ? ' — limit aşılıb' : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
