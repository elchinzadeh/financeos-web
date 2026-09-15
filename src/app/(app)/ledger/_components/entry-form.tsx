'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordExpense, recordIncome } from '@/lib/api/ledger';
import { ApiError } from '@/lib/api/client';
import type { AccountWithBalance } from '@/lib/api/accounts';
import type { Category } from '@/lib/api/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorText } from '@/components/ui/error-text';
import { Field } from '@/components/ui/field';

const schema = z.object({
  accountId: z.string().min(1, 'Hesab seçin'),
  amount: z.string().regex(/^\d+(\.\d+)?$/, 'Rəqəm daxil edin (məs. 45.90)'),
  categoryId: z.string(),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function EntryForm({
  kind,
  token,
  accounts,
  categories,
}: {
  kind: 'income' | 'expense';
  token: string;
  accounts: AccountWithBalance[];
  categories: Category[];
}) {
  const queryClient = useQueryClient();
  const filteredCategories = categories.filter((c) => c.kind === kind);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { accountId: accounts[0]?.id ?? '', categoryId: '', note: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const input = {
        accountId: values.accountId,
        amount: values.amount,
        categoryId: values.categoryId || undefined,
        note: values.note || undefined,
      };
      return kind === 'income' ? recordIncome(token, input) : recordExpense(token, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger-entries'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth'] });
      reset({ accountId: accounts[0]?.id ?? '', categoryId: '', note: '' });
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
      <Field label="Kateqoriya">
        <select className="rounded-md border border-zinc-300 px-3 py-2 text-sm" {...register('categoryId')}>
          <option value="">Kateqoriyasız</option>
          {filteredCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Məbləğ">
        <Input placeholder="məs. 45.90" {...register('amount')} />
        <ErrorText>{errors.amount?.message}</ErrorText>
      </Field>
      <Field label="Qeyd (istəyə görə)">
        <Input placeholder="məs. Market" {...register('note')} />
      </Field>
      <Button type="submit" disabled={isSubmitting || accounts.length === 0}>
        {isSubmitting ? 'Yadda saxlanır...' : kind === 'income' ? 'Gəlir qeyd et' : 'Xərc qeyd et'}
      </Button>
      {mutation.isError && (
        <ErrorText>{mutation.error instanceof ApiError ? mutation.error.message : 'Xəta baş verdi'}</ErrorText>
      )}
    </form>
  );
}
