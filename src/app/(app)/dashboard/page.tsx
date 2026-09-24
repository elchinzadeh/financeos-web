'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/auth-context';
import { getNetWorth } from '@/lib/api/net-worth';
import { Card } from '@/components/ui/card';
import { ErrorText } from '@/components/ui/error-text';
import { InfoNote } from '@/components/ui/info-note';
import { QuickAddBar } from '@/components/quick-add/quick-add-bar';
import { ApiError } from '@/lib/api/client';

export default function DashboardPage() {
  const { token } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['net-worth'],
    queryFn: () => getNetWorth(token!),
    enabled: !!token,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">Xalis dəyər</h1>
      <InfoNote>
        Bütün aktiv hesablarınızın baza valyutaya çevrilmiş cari dəyəri (xalis dəyər). Yeni hesab əlavə etmək üçün
        yuxarıdakı naviqasiyadan &quot;Hesablar&quot; səhifəsinə keçin.
      </InfoNote>

      <QuickAddBar />

      {isLoading && <p className="text-sm text-zinc-400">Yüklənir...</p>}
      {error && <ErrorText>{error instanceof ApiError ? error.message : 'Xəta baş verdi'}</ErrorText>}

      {data && (
        <>
          <Card>
            <p className="text-sm text-zinc-500">Cəmi ({data.baseCurrency})</p>
            <p className="text-3xl font-semibold text-zinc-900">{data.total}</p>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            {data.accounts.map((acc) => (
              <Card key={acc.accountId}>
                <p className="text-sm font-medium text-zinc-900">{acc.name}</p>
                <p className="text-sm text-zinc-500">
                  {acc.balance} {acc.currency}
                </p>
                <p className="text-xs text-zinc-400">
                  ≈ {acc.convertedBalance} {data.baseCurrency}
                </p>
              </Card>
            ))}
            {data.accounts.length === 0 && (
              <p className="text-sm text-zinc-400">Hələ hesab yoxdur.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
