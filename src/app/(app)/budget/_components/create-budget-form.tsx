'use client';

import { useEffect } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBudget, getTemplates } from '@/lib/api/budget';
import { listCategories } from '@/lib/api/categories';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ErrorText } from '@/components/ui/error-text';
import { Field } from '@/components/ui/field';

const schema = z.object({
  name: z.string().min(1, 'Ad tələb olunur'),
  templateId: z.string(),
  allocations: z
    .array(
      z.object({
        categoryId: z.string().min(1, 'Kateqoriya seçin'),
        percent: z.string().regex(/^\d+$/, '1-100 arası tam ədəd').refine((v) => {
          const n = Number(v);
          return n >= 1 && n <= 100;
        }, '1-100 arası olmalıdır'),
      }),
    )
    .min(1, 'ən azı bir sətir lazımdır'),
  priority: z.string().regex(/^-?\d+$/, 'Tam ədəd daxil edin'),
  activeFrom: z.string().min(1, 'Tarix tələb olunur'),
  activeTo: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const today = () => new Date().toISOString().slice(0, 10);

export function CreateBudgetForm({ token }: { token: string }) {
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({ queryKey: ['budget-templates'], queryFn: () => getTemplates(token) });
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: () => listCategories(token) });
  const expenseCategories = (categoriesQuery.data ?? []).filter((c) => c.kind === 'expense');

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      templateId: '',
      allocations: [{ categoryId: '', percent: '10' }],
      priority: '1',
      activeFrom: today(),
      activeTo: '',
    },
  });
  const { fields, append, remove, replace } = useFieldArray({ control, name: 'allocations' });
  const templateId = useWatch({ control, name: 'templateId' });

  useEffect(() => {
    if (!templateId) return;
    const template = templatesQuery.data?.find((t) => t.id === templateId);
    if (!template) return;
    replace(template.buckets.map((bucket) => ({ categoryId: '', percent: String(bucket.percent) })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      createBudget(token, {
        name: values.name,
        source: values.templateId ? 'template' : 'custom',
        templateId: values.templateId || undefined,
        allocations: values.allocations.map((a) => ({ categoryId: a.categoryId, percent: Number(a.percent) })),
        priority: Number(values.priority),
        activeFrom: values.activeFrom,
        activeTo: values.activeTo || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      reset({
        name: '',
        templateId: '',
        allocations: [{ categoryId: '', percent: '10' }],
        priority: '1',
        activeFrom: today(),
        activeTo: '',
      });
    },
  });

  const templateBuckets = templatesQuery.data?.find((t) => t.id === templateId)?.buckets;

  return (
    <Card>
      <h2 className="mb-3 text-sm font-medium text-zinc-900">Yeni büdcə</h2>
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          <Field label="Ad">
            <Input placeholder="məs. Aylıq büdcəm" {...register('name')} />
            <ErrorText>{errors.name?.message}</ErrorText>
          </Field>
          <Field label="Şablon">
            <select className="rounded-md border border-zinc-300 px-3 py-2 text-sm" {...register('templateId')}>
              <option value="">Xüsusi</option>
              {(templatesQuery.data ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Prioritet">
            <Input type="number" placeholder="1" {...register('priority')} />
            <ErrorText>{errors.priority?.message}</ErrorText>
          </Field>
          <Field label="Başlanğıc tarixi">
            <Input type="date" {...register('activeFrom')} />
            <ErrorText>{errors.activeFrom?.message}</ErrorText>
          </Field>
          <Field label="Bitmə tarixi (istəyə görə)">
            <Input type="date" {...register('activeTo')} />
          </Field>
        </div>

        <div className="flex flex-col gap-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-wrap items-center gap-2">
              <Field label={index === 0 ? 'Kateqoriya' : ''}>
                <select
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  {...register(`allocations.${index}.categoryId` as const)}
                >
                  <option value="">Kateqoriya seçin</option>
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              {templateBuckets?.[index] && (
                <span className="text-xs text-zinc-400">({templateBuckets[index].label})</span>
              )}
              <Field label={index === 0 ? 'Faiz (%)' : ''}>
                <Input
                  type="number"
                  className="w-24"
                  placeholder="10"
                  {...register(`allocations.${index}.percent` as const)}
                />
              </Field>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-sm text-red-500 hover:underline"
                disabled={fields.length <= 1}
              >
                Sil
              </button>
              <ErrorText>
                {errors.allocations?.[index]?.categoryId?.message ?? errors.allocations?.[index]?.percent?.message}
              </ErrorText>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ categoryId: '', percent: '10' })}
            className="self-start text-sm text-zinc-600 hover:underline"
          >
            + Sətir əlavə et
          </button>
        </div>

        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting ? 'Yadda saxlanır...' : 'Büdcə yarat'}
        </Button>
        {mutation.isError && (
          <ErrorText>{mutation.error instanceof ApiError ? mutation.error.message : 'Xəta baş verdi'}</ErrorText>
        )}
      </form>
    </Card>
  );
}
