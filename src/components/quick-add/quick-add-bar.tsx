'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/auth-context';
import { listAccounts } from '@/lib/api/accounts';
import { listCategories } from '@/lib/api/categories';
import { parseTransaction, type TransactionProposal } from '@/lib/api/assistant';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorText } from '@/components/ui/error-text';
import { Input } from '@/components/ui/input';
import { ProposalCard } from './proposal-card';

/**
 * "Sürətli əlavə": bir cümlə yazılır, backend təklif hazırlayır, istifadəçi kartda yoxlayıb təsdiqləyir.
 * AI heç vaxt birbaşa yazmır — yazma yalnız "Təsdiqlə" ilə mövcud ledger endpoint-ləri vasitəsilə olur
 * (bax financeos-core/docs/decisions/0021-jev-ai-suggestions.md).
 */
export function QuickAddBar() {
  const { token } = useAuth();
  const [text, setText] = useState('');
  const [proposal, setProposal] = useState<TransactionProposal | null>(null);
  const [recorded, setRecorded] = useState(false);

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
  const accounts = (accountsQuery.data ?? []).filter((a) => a.isActive);

  const parseMutation = useMutation({
    mutationFn: (value: string) => parseTransaction(token!, value),
    onSuccess: (result) => {
      setRecorded(false);
      setProposal(result);
    },
  });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;
    parseMutation.mutate(value);
  }

  function handleDone(didRecord: boolean) {
    setProposal(null);
    if (didRecord) {
      setText('');
      setRecorded(true);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <h2 className="mb-1 text-sm font-medium text-zinc-900">Sürətli əlavə</h2>
        <p className="mb-3 text-xs text-zinc-500">
          Xərci və ya gəliri bir cümlə ilə yazın — məbləğ, hesab və kateqoriya təklif olunacaq, siz yoxlayıb təsdiqləyəcəksiniz.
        </p>
        {accounts.length === 0 && !accountsQuery.isLoading ? (
          <p className="text-sm text-zinc-400">Əməliyyat qeyd etmək üçün əvvəlcə bir hesab açın.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
            <Input
              className="min-w-0 flex-1"
              placeholder="məs. Dünən Bravo-da 45 manat xərclədim"
              value={text}
              maxLength={300}
              onChange={(e) => setText(e.target.value)}
            />
            <Button type="submit" disabled={!text.trim() || parseMutation.isPending}>
              {parseMutation.isPending ? 'Hazırlanır...' : 'Təklif et'}
            </Button>
          </form>
        )}
        {parseMutation.isError && (
          <ErrorText>
            {parseMutation.error instanceof ApiError ? parseMutation.error.message : 'Təklif hazırlanmadı'}
          </ErrorText>
        )}
        {recorded && <p className="mt-2 text-sm text-green-700">Əməliyyat qeyd olundu.</p>}
      </Card>

      {proposal && token && (
        <ProposalCard
          // Hər yeni təklif üçün forma təmiz başlasın (defaultValues yalnız ilk render-də oxunur).
          key={JSON.stringify(proposal)}
          token={token}
          proposal={proposal}
          accounts={accounts}
          categories={categoriesQuery.data ?? []}
          onDone={handleDone}
        />
      )}
    </div>
  );
}
