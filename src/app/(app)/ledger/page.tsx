'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { useAuth } from '@/lib/auth/auth-context';
import { listAccounts } from '@/lib/api/accounts';
import { listCategories } from '@/lib/api/categories';
import { listEntries, reconcile } from '@/lib/api/ledger';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorText } from '@/components/ui/error-text';
import { EntryForm } from './_components/entry-form';
import { TransferForm } from './_components/transfer-form';
import { AdjustForm } from './_components/adjust-form';
import { EntriesTable } from './_components/entries-table';

const TABS = [
  { key: 'income', label: 'Gəlir' },
  { key: 'expense', label: 'Xərc' },
  { key: 'transfer', label: 'Transfer' },
  { key: 'adjust', label: 'Düzəliş' },
] as const;

type Tab = (typeof TABS)[number]['key'];

export default function LedgerPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [accountFilter, setAccountFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<Tab>('income');

  const accountsQuery = useQuery({
    queryKey: ['accounts'],
    queryFn: () => listAccounts(token!),
    enabled: !!token,
  });
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => listCategories(token!),
    enabled: !!token,
  });
  const entriesQuery = useQuery({
    queryKey: ['ledger-entries', accountFilter],
    queryFn: () => listEntries(token!, accountFilter || undefined),
    enabled: !!token,
  });

  const reconcileMutation = useMutation({
    mutationFn: () => reconcile(token!, accountFilter || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth'] });
    },
  });

  const accounts = accountsQuery.data?.filter((a) => a.isActive) ?? [];
  const categories = categoriesQuery.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">Əməliyyatlar</h1>

      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-3">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'rounded-md px-3 py-1.5 text-sm font-medium',
                activeTab === tab.key ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {accounts.length === 0 && !accountsQuery.isLoading ? (
          <p className="text-sm text-zinc-400">Əməliyyat qeyd etmək üçün əvvəlcə bir hesab açın.</p>
        ) : (
          <>
            {activeTab === 'income' && (
              <EntryForm kind="income" token={token!} accounts={accounts} categories={categories} />
            )}
            {activeTab === 'expense' && (
              <EntryForm kind="expense" token={token!} accounts={accounts} categories={categories} />
            )}
            {activeTab === 'transfer' && <TransferForm token={token!} accounts={accounts} />}
            {activeTab === 'adjust' && <AdjustForm token={token!} accounts={accounts} />}
          </>
        )}
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
        >
          <option value="">Bütün hesablar</option>
          {(accountsQuery.data ?? []).map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-3">
          {reconcileMutation.isSuccess && (
            <span className="text-sm text-zinc-500">
              {reconcileMutation.data.filter((r) => r.corrected).length} balans düzəldildi
            </span>
          )}
          <Button
            variant="secondary"
            onClick={() => reconcileMutation.mutate()}
            disabled={reconcileMutation.isPending}
          >
            {reconcileMutation.isPending ? 'Yenilənir...' : 'Balansı yenidən hesabla'}
          </Button>
        </div>
      </div>
      {reconcileMutation.isError && (
        <ErrorText>
          {reconcileMutation.error instanceof ApiError ? reconcileMutation.error.message : 'Xəta baş verdi'}
        </ErrorText>
      )}

      {entriesQuery.isLoading && <p className="text-sm text-zinc-400">Yüklənir...</p>}
      {entriesQuery.error && (
        <ErrorText>
          {entriesQuery.error instanceof ApiError ? entriesQuery.error.message : 'Xəta baş verdi'}
        </ErrorText>
      )}
      {entriesQuery.data && (
        <EntriesTable
          entries={[...entriesQuery.data].sort(
            (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
          )}
          accounts={accountsQuery.data ?? []}
          categories={categories}
        />
      )}
    </div>
  );
}
