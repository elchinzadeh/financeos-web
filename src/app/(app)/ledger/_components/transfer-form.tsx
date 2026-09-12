'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transfer } from '@/lib/api/ledger';
import { ApiError } from '@/lib/api/client';
import type { AccountWithBalance } from '@/lib/api/accounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorText } from '@/components/ui/error-text';

const schema = z
  .object({
    fromAccountId: z.string().min(1, 'Mənbə hesab seçin'),
    toAccountId: z.string().min(1, 'Hədəf hesab seçin'),
    amount: z.string().regex(/^\d+(\.\d+)?$/, 'Rəqəm daxil edin (məs. 100.00)'),
    note: z.string().optional(),
  })
  .refine((v) => v.fromAccountId !== v.toAccountId, {
    message: 'Mənbə və hədəf hesab eyni ola bilməz',
    path: ['toAccountId'],
  });

type FormValues = z.infer<typeof schema>;

export function TransferForm({ token, accounts }: { token: string; accounts: AccountWithBalance[] }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fromAccountId: accounts[0]?.id ?? '', toAccountId: accounts[1]?.id ?? '', note: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      transfer(token, { ...values, note: values.note || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger-entries'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth'] });
      reset({ fromAccountId: accounts[0]?.id ?? '', toAccountId: accounts[1]?.id ?? '', note: '' });
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className="flex flex-wrap items-start gap-3"
    >
      <select className="rounded-md border border-zinc-300 px-3 py-2 text-sm" {...register('fromAccountId')}>
        {accounts.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.name} ({acc.currency})
          </option>
        ))}
      </select>
      <span className="self-center text-sm text-zinc-400">→</span>
      <div>
        <select className="rounded-md border border-zinc-300 px-3 py-2 text-sm" {...register('toAccountId')}>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name} ({acc.currency})
            </option>
          ))}
        </select>
        <ErrorText>{errors.toAccountId?.message}</ErrorText>
      </div>
      <div>
        <Input placeholder="Məbləğ (mənbə valyutasında)" {...register('amount')} />
        <ErrorText>{errors.amount?.message}</ErrorText>
      </div>
      <Input placeholder="Qeyd (istəyə görə)" {...register('note')} />
      <Button type="submit" disabled={isSubmitting || accounts.length < 2}>
        {isSubmitting ? 'Yadda saxlanır...' : 'Köçür'}
      </Button>
      {mutation.isError && (
        <ErrorText>{mutation.error instanceof ApiError ? mutation.error.message : 'Xəta baş verdi'}</ErrorText>
      )}
      {accounts.length < 2 && <p className="text-sm text-zinc-400">Transfer üçün ən azı 2 hesab lazımdır.</p>}
    </form>
  );
}
