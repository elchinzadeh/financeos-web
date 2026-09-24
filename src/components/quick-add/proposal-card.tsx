'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clsx } from 'clsx';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordExpense, recordIncome } from '@/lib/api/ledger';
import { ApiError } from '@/lib/api/client';
import type { AccountWithBalance } from '@/lib/api/accounts';
import type { Category } from '@/lib/api/categories';
import type { ProposalWarning, TransactionProposal } from '@/lib/api/assistant';
import { dateFromDayOffset, occurredAtFromDateInput } from '@/lib/local-date';
import { buildCategoryTree, flattenCategoryTree, indentLabel } from '@/lib/categories-tree';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorText } from '@/components/ui/error-text';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

const schema = z.object({
  // Boş sətir "seçilməyib" deməkdir; <select>-in disabled placeholder-i brauzerdə avtomatik "Xərc"-ə düşməsin deyə.
  // `: boolean` açıq yazılıb — yoxsa TS tip predikatı çıxarır və zod çıxış tipini daraldır, giriş tipi (string) ilə uyğunsuzluq yaranır.
  direction: z.string().refine((value): boolean => value === 'income' || value === 'expense', 'Gəlir və ya xərc seçin'),
  amount: z.string().regex(/^\d+(\.\d+)?$/, 'Rəqəm daxil edin (məs. 45.90)'),
  accountId: z.string().min(1, 'Hesab seçin'),
  categoryId: z.string(),
  date: z.string().min(1, 'Tarix seçin'),
  note: z.string(),
});

type FormValues = z.infer<typeof schema>;

const WARNING_TEXT: Record<ProposalWarning, string> = {
  amount_missing: 'Mətndə məbləğ tapılmadı — özünüz daxil edin.',
  multiple_amounts: 'Mətndə bir neçə məbləğ var — düzgün olanı yoxlayın.',
  no_account_in_currency: 'Mətndəki valyutada hesabınız yoxdur — hesabı özünüz seçin.',
};

/** Boş və ya qeyri-müəyyən sahəni diqqət çəkmək üçün vurğulayır. */
const attention = 'border-amber-400 bg-amber-50';

/**
 * AI təklifinin redaktə oluna bilən təsdiq kartı. Heç nə təsdiqdən əvvəl yazılmır: "Təsdiqlə" mövcud
 * `recordIncome`/`recordExpense` endpoint-lərini çağırır (bax financeos-core/docs/decisions/0021-jev-ai-suggestions.md).
 */
export function ProposalCard({
  token,
  proposal,
  accounts,
  categories,
  onDone,
}: {
  token: string;
  proposal: TransactionProposal;
  accounts: AccountWithBalance[];
  categories: Category[];
  onDone: (recorded: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      direction: proposal.direction ?? '',
      amount: proposal.amount ?? '',
      accountId: proposal.accountId ?? '',
      categoryId: proposal.categoryId ?? '',
      date: dateFromDayOffset(proposal.dayOffset),
      note: proposal.note,
    },
  });

  const direction = useWatch({ control, name: 'direction' });
  const accountId = useWatch({ control, name: 'accountId' });
  const amount = useWatch({ control, name: 'amount' });

  // İstiqamət dəyişəndə əvvəlki növün kateqoriyası qalmasın.
  useEffect(() => {
    const current = getValues('categoryId');
    if (current && categories.find((c) => c.id === current)?.kind !== direction) {
      setValue('categoryId', '');
    }
  }, [direction, categories, getValues, setValue]);

  const categoryOptions = direction
    ? flattenCategoryTree(buildCategoryTree(categories.filter((c) => c.kind === direction)))
    : [];

  const selectedAccount = accounts.find((a) => a.id === accountId);
  const currencyMismatch =
    proposal.currency !== null && selectedAccount !== undefined && selectedAccount.currency !== proposal.currency;

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const input = {
        accountId: values.accountId,
        amount: values.amount,
        categoryId: values.categoryId || undefined,
        note: values.note.trim() || undefined,
        occurredAt: occurredAtFromDateInput(values.date),
      };
      return values.direction === 'income' ? recordIncome(token, input) : recordExpense(token, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger-entries'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth'] });
      onDone(true);
    },
  });

  return (
    <Card className="flex flex-col gap-3 border-blue-200">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-900">Təklif — yoxlayıb təsdiqləyin</h2>
        {proposal.source !== 'parser' && (
          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800">AI təklifi</span>
        )}
      </div>

      {proposal.warnings.map((warning) => (
        <p key={warning} className="text-sm text-amber-700">
          {WARNING_TEXT[warning]}
        </p>
      ))}

      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-wrap items-start gap-3">
        <Field label="Növ">
          <select
            className={clsx('rounded-md border px-3 py-2 text-sm', direction ? 'border-zinc-300' : attention)}
            {...register('direction')}
          >
            <option value="" disabled>
              Seçin
            </option>
            <option value="expense">Xərc</option>
            <option value="income">Gəlir</option>
          </select>
          <ErrorText>{errors.direction?.message}</ErrorText>
        </Field>

        <Field label="Məbləğ">
          <Input className={clsx('w-32', !amount && attention)} placeholder="məs. 45.90" {...register('amount')} />
          <ErrorText>{errors.amount?.message}</ErrorText>
        </Field>

        <Field label="Hesab">
          <select
            className={clsx('rounded-md border px-3 py-2 text-sm', accountId ? 'border-zinc-300' : attention)}
            {...register('accountId')}
          >
            <option value="">Hesab seçin</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.currency})
              </option>
            ))}
          </select>
          <ErrorText>{errors.accountId?.message}</ErrorText>
        </Field>

        <Field label="Kateqoriya">
          <select className="rounded-md border border-zinc-300 px-3 py-2 text-sm" {...register('categoryId')}>
            <option value="">Kateqoriyasız</option>
            {categoryOptions.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {indentLabel(cat.name, cat.depth)}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tarix">
          <Input type="date" {...register('date')} />
          <ErrorText>{errors.date?.message}</ErrorText>
        </Field>

        <Field label="Qeyd (istəyə görə)">
          <Input {...register('note')} />
        </Field>

        {currencyMismatch && (
          <p className="w-full text-sm text-amber-700">
            Mətndə {proposal.currency} var, seçilmiş hesab isə {selectedAccount?.currency} valyutasındadır — məbləğ
            hesabın valyutasında ({selectedAccount?.currency}) yazılacaq.
          </p>
        )}

        <div className="flex w-full items-center gap-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Yadda saxlanır...' : 'Təsdiqlə'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => onDone(false)} disabled={mutation.isPending}>
            Ləğv et
          </Button>
        </div>
        {mutation.isError && (
          <ErrorText>{mutation.error instanceof ApiError ? mutation.error.message : 'Xəta baş verdi'}</ErrorText>
        )}
      </form>
    </Card>
  );
}
