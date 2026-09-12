'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/auth-context';
import { listBudgets } from '@/lib/api/budget';
import { listCategories } from '@/lib/api/categories';
import { ApiError } from '@/lib/api/client';
import { ErrorText } from '@/components/ui/error-text';
import { CreateBudgetForm } from './_components/create-budget-form';
import { BudgetCard } from './_components/budget-card';

export default function BudgetPage() {
  const { token } = useAuth();

  const budgetsQuery = useQuery({
    queryKey: ['budgets'],
    queryFn: () => listBudgets(token!),
    enabled: !!token,
  });
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => listCategories(token!),
    enabled: !!token,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">Büdcə</h1>

      <CreateBudgetForm token={token!} />

      {budgetsQuery.isLoading && <p className="text-sm text-zinc-400">Yüklənir...</p>}
      {budgetsQuery.error && (
        <ErrorText>{budgetsQuery.error instanceof ApiError ? budgetsQuery.error.message : 'Xəta baş verdi'}</ErrorText>
      )}

      <div className="flex flex-col gap-3">
        {budgetsQuery.data?.map((budget) => (
          <BudgetCard key={budget.id} budget={budget} token={token!} categories={categoriesQuery.data ?? []} />
        ))}
        {budgetsQuery.data?.length === 0 && <p className="text-sm text-zinc-400">Hələ büdcə yoxdur.</p>}
      </div>
    </div>
  );
}
