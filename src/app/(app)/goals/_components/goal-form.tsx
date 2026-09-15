'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGoal } from '@/lib/api/goals';
import { ApiError } from '@/lib/api/client';
import type { AccountWithBalance } from '@/lib/api/accounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ErrorText } from '@/components/ui/error-text';
import { Field } from '@/components/ui/field';

const schema = z.object({
  name: z.string().min(1, 'Ad tələb olunur'),
  targetAmount: z.string().regex(/^\d+(\.\d+)?$/, 'Rəqəm daxil edin (məs. 5000.00)'),
  targetCurrency: z.string().length(3, 'ISO 4217 kodu, məs. AZN'),
  targetDate: z.string().optional(),
  linkedAccountId: z.string(),
});

type FormValues = z.infer<typeof schema>;

export function GoalForm({
  token,
  accounts,
  defaultCurrency,
}: {
  token: string;
  accounts: AccountWithBalance[];
  defaultCurrency: string;
}) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { targetCurrency: defaultCurrency, targetDate: '', linkedAccountId: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      createGoal(token, {
        name: values.name,
        targetAmount: values.targetAmount,
        targetCurrency: values.targetCurrency,
        targetDate: values.targetDate || undefined,
        linkedAccountId: values.linkedAccountId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      reset({ name: '', targetAmount: '', targetCurrency: defaultCurrency, targetDate: '', linkedAccountId: '' });
    },
  });

  return (
    <Card>
      <h2 className="mb-3 text-sm font-medium text-zinc-900">Yeni hədəf</h2>
      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="flex flex-wrap items-start gap-3"
      >
        <Field label="Ad">
          <Input placeholder="məs. Ehtiyat fond" {...register('name')} />
          <ErrorText>{errors.name?.message}</ErrorText>
        </Field>
        <Field label="Hədəf məbləği">
          <Input placeholder="məs. 5000.00" {...register('targetAmount')} />
          <ErrorText>{errors.targetAmount?.message}</ErrorText>
        </Field>
        <Field label="Valyuta">
          <Input placeholder="məs. AZN" className="w-24" {...register('targetCurrency')} />
          <ErrorText>{errors.targetCurrency?.message}</ErrorText>
        </Field>
        <Field label="Hədəf tarixi (istəyə görə)">
          <Input type="date" {...register('targetDate')} />
        </Field>
        <Field label="Bağlı hesab (istəyə görə)">
          <select className="rounded-md border border-zinc-300 px-3 py-2 text-sm" {...register('linkedAccountId')}>
            <option value="">Bağlı hesab yoxdur</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.currency})
              </option>
            ))}
          </select>
        </Field>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Yadda saxlanır...' : 'Hədəf yarat'}
        </Button>
      </form>
      {mutation.isError && (
        <ErrorText>{mutation.error instanceof ApiError ? mutation.error.message : 'Xəta baş verdi'}</ErrorText>
      )}
    </Card>
  );
}
