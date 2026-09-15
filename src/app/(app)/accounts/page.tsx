'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/auth-context';
import { ACCOUNT_TYPES, archiveAccount, listAccounts, openAccount, type AccountType } from '@/lib/api/accounts';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ErrorText } from '@/components/ui/error-text';
import { Field } from '@/components/ui/field';
import { InfoNote } from '@/components/ui/info-note';

const schema = z.object({
  name: z.string().min(1, 'Ad tələb olunur'),
  type: z.enum(ACCOUNT_TYPES as [AccountType, ...AccountType[]]),
  currency: z.string().length(3, 'ISO 4217 kodu, məs. AZN'),
});

type FormValues = z.infer<typeof schema>;

export default function AccountsPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => listAccounts(token!),
    enabled: !!token,
  });

  const openMutation = useMutation({
    mutationFn: (values: FormValues) => openAccount(token!, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth'] });
      reset();
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (accountId: string) => archiveAccount(token!, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth'] });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'cash', currency: 'AZN' },
  });

  function onSubmit(values: FormValues) {
    openMutation.mutate(values);
  }

  function handleArchive(accountId: string, name: string) {
    if (!window.confirm(`"${name}" hesabını arxivləmək istədiyinizə əminsiniz?`)) return;
    archiveMutation.mutate(accountId);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">Hesablar</h1>
      <InfoNote>
        Nağd pul, bank, kart və digər hesablarınızı burada açın. Artıq istifadə etmədiyiniz hesabı silmək əvəzinə
        &quot;Arxivlə&quot; düyməsi ilə arxivləyin — bu hesabın keçmiş əməliyyatları saxlanılır, sadəcə yeni əməliyyat
        yazıla bilməz.
      </InfoNote>

      <Card>
        <h2 className="mb-3 text-sm font-medium text-zinc-900">Yeni hesab</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-start gap-3">
          <Field label="Ad">
            <Input placeholder="məs. Kapital Bank kartı" {...register('name')} />
            <ErrorText>{errors.name?.message}</ErrorText>
          </Field>
          <Field label="Tip">
            <select
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
              {...register('type')}
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Valyuta">
            <Input placeholder="məs. AZN" {...register('currency')} />
            <ErrorText>{errors.currency?.message}</ErrorText>
          </Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Əlavə olunur...' : 'Hesab aç'}
          </Button>
        </form>
        {openMutation.isError && (
          <ErrorText>
            {openMutation.error instanceof ApiError ? openMutation.error.message : 'Xəta baş verdi'}
          </ErrorText>
        )}
      </Card>

      {isLoading && <p className="text-sm text-zinc-400">Yüklənir...</p>}
      {error && <ErrorText>{error instanceof ApiError ? error.message : 'Xəta baş verdi'}</ErrorText>}

      <div className="flex flex-col gap-2">
        {data?.map((account) => (
          <Card key={account.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-900">
                {account.name}
                {!account.isActive && <span className="ml-2 text-xs text-zinc-400">(arxivlənib)</span>}
              </p>
              <p className="text-xs text-zinc-500">
                {account.type} · {account.balance} {account.currency}
              </p>
            </div>
            {account.isActive && (
              <Button variant="secondary" onClick={() => handleArchive(account.id, account.name)}>
                Arxivlə
              </Button>
            )}
          </Card>
        ))}
        {data?.length === 0 && <p className="text-sm text-zinc-400">Hələ hesab yoxdur.</p>}
      </div>
    </div>
  );
}
