'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adjustBalance } from '@/lib/api/ledger';
import { ApiError } from '@/lib/api/client';
import type { AccountWithBalance } from '@/lib/api/accounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorText } from '@/components/ui/error-text';
import { Field } from '@/components/ui/field';

const schema = z.object({
  accountId: z.string().min(1, 'Hesab seçin'),
  delta: z.string().regex(/^-?\d+(\.\d+)?$/, 'İşarəli rəqəm daxil edin (məs. -12.50)'),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function AdjustForm({ token, accounts }: { token: string; accounts: AccountWithBalance[] }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { accountId: accounts[0]?.id ?? '', note: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      adjustBalance(token, { ...values, note: values.note || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger-entries'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth'] });
      reset({ accountId: accounts[0]?.id ?? '', note: '' });
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className="flex flex-wrap items-start gap-3"
    >
      <Field label="Hesab">
        <select className="rounded-md border border-zinc-300 px-3 py-2 text-sm" {...register('accountId')}>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name} ({acc.currency})
            </option>
          ))}
        </select>
      </Field>
      <Field label="Düzəliş (işarəli)">
        <Input placeholder="məs. -12.50" {...register('delta')} />
        <ErrorText>{errors.delta?.message}</ErrorText>
      </Field>
      <Field label="Qeyd (istəyə görə)">
        <Input placeholder="məs. Bank komissiyası" {...register('note')} />
      </Field>
      <Button type="submit" disabled={isSubmitting || accounts.length === 0}>
        {isSubmitting ? 'Yadda saxlanır...' : 'Balansı düzəlt'}
      </Button>
      {mutation.isError && (
        <ErrorText>{mutation.error instanceof ApiError ? mutation.error.message : 'Xəta baş verdi'}</ErrorText>
      )}
    </form>
  );
}
