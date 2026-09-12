'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listFxRates, upsertFxRate } from '@/lib/api/fx-rates';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ErrorText } from '@/components/ui/error-text';

const schema = z.object({
  baseCurrency: z.string().length(3, 'ISO 4217 kodu, məs. USD'),
  quoteCurrency: z.string().length(3, 'ISO 4217 kodu, məs. AZN'),
  rate: z.string().regex(/^\d+(\.\d+)?$/, 'Rəqəm daxil edin (məs. 1.7000)'),
  rateDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function FxRatesSection({ token }: { token: string }) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['fx-rates'],
    queryFn: () => listFxRates(token),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { rateDate: '' } });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      upsertFxRate(token, { ...values, rateDate: values.rateDate || undefined, source: 'manual' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fx-rates'] });
      reset({ baseCurrency: '', quoteCurrency: '', rate: '', rateDate: '' });
    },
  });

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-sm font-medium text-zinc-900">FX Kursları</h2>

      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="flex flex-wrap items-start gap-3"
      >
        <div>
          <Input placeholder="Baza (məs. USD)" className="w-28" {...register('baseCurrency')} />
          <ErrorText>{errors.baseCurrency?.message}</ErrorText>
        </div>
        <div>
          <Input placeholder="Kotirovka (məs. AZN)" className="w-28" {...register('quoteCurrency')} />
          <ErrorText>{errors.quoteCurrency?.message}</ErrorText>
        </div>
        <div>
          <Input placeholder="Kurs" className="w-28" {...register('rate')} />
          <ErrorText>{errors.rate?.message}</ErrorText>
        </div>
        <Input type="date" {...register('rateDate')} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saxlanır...' : 'Əlavə et / yenilə'}
        </Button>
      </form>
      {mutation.isError && (
        <ErrorText>{mutation.error instanceof ApiError ? mutation.error.message : 'Xəta baş verdi'}</ErrorText>
      )}

      {isLoading && <p className="text-sm text-zinc-400">Yüklənir...</p>}
      {error && <ErrorText>{error instanceof ApiError ? error.message : 'Xəta baş verdi'}</ErrorText>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-xs text-zinc-500">
            <tr>
              <th className="px-3 py-2">Cüt</th>
              <th className="px-3 py-2">Kurs</th>
              <th className="px-3 py-2">Tarix</th>
              <th className="px-3 py-2">Mənbə</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((r) => (
              <tr key={`${r.baseCurrency}-${r.quoteCurrency}-${r.rateDate}`} className="border-b border-zinc-100 last:border-0">
                <td className="px-3 py-2">
                  {r.baseCurrency} → {r.quoteCurrency}
                </td>
                <td className="px-3 py-2">{r.rate}</td>
                <td className="px-3 py-2 text-zinc-500">{r.rateDate.slice(0, 10)}</td>
                <td className="px-3 py-2 text-zinc-500">{r.source ?? '—'}</td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-2 text-zinc-400">
                  Kurs yoxdur.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
