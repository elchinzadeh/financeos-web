'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/auth-context';
import { listAccounts } from '@/lib/api/accounts';
import { listCategories } from '@/lib/api/categories';
import { BANK_PROFILES, previewStatement, type PreviewResponse } from '@/lib/api/statement-import';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorText } from '@/components/ui/error-text';
import { Field } from '@/components/ui/field';
import { InfoNote } from '@/components/ui/info-note';
import { ReviewTable } from './_components/review-table';

export default function ImportPage() {
  const { token } = useAuth();
  const [accountId, setAccountId] = useState('');
  const [bankProfile, setBankProfile] = useState<string>(BANK_PROFILES[0].id);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);

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

  const previewMutation = useMutation({
    mutationFn: () => previewStatement(token!, { accountId, bankProfile, file: file! }),
    onSuccess: (result) => setPreview(result),
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">Bank çıxarışı idxalı</h1>
      <InfoNote>
        Bankınızdan aldığınız CSV çıxarış faylını yükləyin — sistem sətirləri oxuyub istiqamət (gəlir/xərc) və
        kateqoriya təklif edəcək. Heç nə birbaşa yazılmır: növbəti addımda hər sətri gözdən keçirib lazım olanı
        düzəldə, dublikatları çıxara bilərsiniz. Yalnız təsdiqlədiyiniz sətirlər əməliyyat kimi qeyd olunur, artıq
        idxal edilmiş sətirlər avtomatik aşkarlanıb təkrar yazılmır.
      </InfoNote>

      {!preview && (
        <Card className="flex flex-col gap-4">
          {accounts.length === 0 && !accountsQuery.isLoading ? (
            <p className="text-sm text-zinc-400">Çıxarış idxal etmək üçün əvvəlcə bir hesab açın.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-3">
                <Field label="Hesab">
                  <select
                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                  >
                    <option value="">Hesab seçin</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.currency})
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Bank">
                  <select
                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                    value={bankProfile}
                    onChange={(e) => setBankProfile(e.target.value)}
                  >
                    {BANK_PROFILES.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Fayl (CSV)">
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="text-sm"
                  />
                </Field>
              </div>
              <Button
                onClick={() => previewMutation.mutate()}
                disabled={!accountId || !file || previewMutation.isPending}
                className="self-start"
              >
                {previewMutation.isPending ? 'Yüklənir...' : 'Önizlə'}
              </Button>
              {previewMutation.isError && (
                <ErrorText>
                  {previewMutation.error instanceof ApiError ? previewMutation.error.message : 'Xəta baş verdi'}
                </ErrorText>
              )}
            </>
          )}
        </Card>
      )}

      {preview && token && (
        <ReviewTable
          token={token}
          accountId={accountId}
          categories={categoriesQuery.data ?? []}
          preview={preview}
          onDone={() => {
            setPreview(null);
            setFile(null);
            previewMutation.reset();
          }}
        />
      )}
    </div>
  );
}
