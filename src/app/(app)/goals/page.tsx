'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { useAuth } from '@/lib/auth/auth-context';
import { listGoals, type GoalStatus } from '@/lib/api/goals';
import { listAccounts } from '@/lib/api/accounts';
import { ApiError } from '@/lib/api/client';
import { ErrorText } from '@/components/ui/error-text';
import { GoalForm } from './_components/goal-form';
import { GoalCard } from './_components/goal-card';

const FILTERS: { key: GoalStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Hamısı' },
  { key: 'active', label: 'Aktiv' },
  { key: 'completed', label: 'Tamamlanıb' },
  { key: 'abandoned', label: 'İmtina edilib' },
];

export default function GoalsPage() {
  const { token, user } = useAuth();
  const [filter, setFilter] = useState<GoalStatus | 'all'>('all');

  const accountsQuery = useQuery({
    queryKey: ['accounts'],
    queryFn: () => listAccounts(token!),
    enabled: !!token,
  });
  const goalsQuery = useQuery({
    queryKey: ['goals', filter],
    queryFn: () => listGoals(token!, filter === 'all' ? undefined : filter),
    enabled: !!token,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">Hədəflər</h1>

      <GoalForm
        token={token!}
        accounts={(accountsQuery.data ?? []).filter((a) => a.isActive)}
        defaultCurrency={user?.baseCurrency ?? 'AZN'}
      />

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={clsx(
              'rounded-md px-3 py-1.5 text-sm font-medium',
              filter === f.key ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {goalsQuery.isLoading && <p className="text-sm text-zinc-400">Yüklənir...</p>}
      {goalsQuery.error && (
        <ErrorText>{goalsQuery.error instanceof ApiError ? goalsQuery.error.message : 'Xəta baş verdi'}</ErrorText>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {goalsQuery.data?.map((goal) => (
          <GoalCard key={goal.id} goal={goal} token={token!} accounts={accountsQuery.data ?? []} />
        ))}
        {goalsQuery.data?.length === 0 && <p className="text-sm text-zinc-400">Hədəf yoxdur.</p>}
      </div>
    </div>
  );
}
