'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { commitStatement, type CommitResponse, type EntryDirection, type PreviewResponse } from '@/lib/api/statement-import';
import { ApiError } from '@/lib/api/client';
import type { Category } from '@/lib/api/categories';
import { buildCategoryTree, flattenCategoryTree, indentLabel } from '@/lib/categories-tree';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorText } from '@/components/ui/error-text';
import { Input } from '@/components/ui/input';
import { CreateCategoryModal } from './create-category-modal';

const schema = z.object({
  rows: z.array(
    z.object({
      fingerprint: z.string(),
      occurredAt: z.string(),
      amount: z.string(),
      direction: z.enum(['debit', 'credit']),
      include: z.boolean(),
      categoryId: z.string(),
      note: z.string(),
    }),
  ),
});

type FormValues = z.infer<typeof schema>;

interface Group {
  key: string;
  description: string;
  direction: EntryDirection;
  indices: number[];
  hasSuggestion: boolean;
  duplicateCount: number;
  internalTransferCount: number;
  balanceMismatchCount: number;
  totalAmount: number;
}

function buildGroups(preview: PreviewResponse): Group[] {
  const byKey = new Map<string, Group>();
  preview.rows.forEach((row, index) => {
    const key = `${row.direction}|${row.description.trim()}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.indices.push(index);
      existing.duplicateCount += row.isDuplicate ? 1 : 0;
      existing.internalTransferCount += row.isInternalTransfer ? 1 : 0;
      existing.balanceMismatchCount += row.balanceMismatch ? 1 : 0;
      existing.totalAmount += Number(row.amount);
    } else {
      byKey.set(key, {
        key,
        description: row.description.trim(),
        direction: row.direction,
        indices: [index],
        hasSuggestion: row.suggestedCategoryId !== null,
        duplicateCount: row.isDuplicate ? 1 : 0,
        internalTransferCount: row.isInternalTransfer ? 1 : 0,
        balanceMismatchCount: row.balanceMismatch ? 1 : 0,
        totalAmount: Number(row.amount),
      });
    }
  });
  return [...byKey.values()].sort((a, b) => b.indices.length - a.indices.length);
}

function Badge({ tone, children }: { tone: 'amber' | 'purple' | 'red'; children: string }) {
  const toneClasses = {
    amber: 'bg-amber-100 text-amber-800',
    purple: 'bg-purple-100 text-purple-800',
    red: 'bg-red-100 text-red-800',
  } as const;
  return (
    <span className={clsx('rounded px-1.5 py-0.5 text-xs font-medium', toneClasses[tone])}>{children}</span>
  );
}

function GroupBadges({ group }: { group: Group }) {
  return (
    <div className="flex flex-wrap gap-1">
      {group.duplicateCount > 0 && (
        <Badge tone="amber">{`Dublikat${group.duplicateCount > 1 ? ` ×${group.duplicateCount}` : ''}`}</Badge>
      )}
      {group.internalTransferCount > 0 && <Badge tone="purple">Daxili köçürmə</Badge>}
      {group.balanceMismatchCount > 0 && (
        <Badge tone="red">{`Balans uyğunsuzluğu${group.balanceMismatchCount > 1 ? ` ×${group.balanceMismatchCount}` : ''}`}</Badge>
      )}
    </div>
  );
}

function GroupRow({
  group,
  control,
  register,
  setValue,
  categories,
  preview,
  remember,
  onToggleRemember,
  expanded,
  onToggleExpand,
  token,
}: {
  group: Group;
  control: Control<FormValues>;
  register: ReturnType<typeof useForm<FormValues>>['register'];
  setValue: ReturnType<typeof useForm<FormValues>>['setValue'];
  categories: Category[];
  preview: PreviewResponse;
  remember: boolean;
  onToggleRemember: (value: boolean) => void;
  expanded: boolean;
  onToggleExpand: () => void;
  token: string;
}) {
  const firstIndex = group.indices[0];
  const categoryId = useWatch({ control, name: `rows.${firstIndex}.categoryId` });
  const includeValues = useWatch({ control, name: group.indices.map((i) => `rows.${i}.include` as const) });
  const allIncluded = includeValues.every(Boolean);
  const noneIncluded = includeValues.every((v) => !v);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = !allIncluded && !noneIncluded;
    }
  }, [allIncluded, noneIncluded]);

  const kind = group.direction === 'debit' ? 'expense' : 'income';
  const filteredCategories = flattenCategoryTree(buildCategoryTree(categories.filter((c) => c.kind === kind)));

  function toggleGroup() {
    const next = !allIncluded;
    group.indices.forEach((i) => setValue(`rows.${i}.include`, next));
  }

  function applyCategoryId(value: string) {
    group.indices.forEach((i) => setValue(`rows.${i}.categoryId`, value));
  }

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    applyCategoryId(e.target.value);
  }

  return (
    <>
      <tr className="border-b border-zinc-100 align-top last:border-0">
        <td className="px-3 py-2">
          <input ref={checkboxRef} type="checkbox" checked={allIncluded} onChange={toggleGroup} />
        </td>
        <td className="px-3 py-2">
          {group.description}
          {group.indices.length > 1 && (
            <span className="ml-1 text-xs text-zinc-400">× {group.indices.length}</span>
          )}
        </td>
        <td className="whitespace-nowrap px-3 py-2">
          <span className={group.direction === 'debit' ? 'text-red-600' : 'text-green-700'}>
            {group.direction === 'debit' ? '−' : '+'}
            {group.totalAmount.toFixed(2)}
          </span>
        </td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-1">
            <select
              className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
              value={categoryId ?? ''}
              onChange={handleCategoryChange}
            >
              <option value="">Kateqoriyasız</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {indentLabel(c.name, c.depth)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setIsCreatingCategory(true)}
              className="text-xs text-zinc-500 hover:text-zinc-900"
              title="Yeni kateqoriya yarat"
            >
              + Yeni
            </button>
          </div>
          {isCreatingCategory && (
            <CreateCategoryModal
              token={token}
              kind={kind}
              onClose={() => setIsCreatingCategory(false)}
              onCreated={(category) => applyCategoryId(category.id)}
            />
          )}
        </td>
        <td className="px-3 py-2">
          <GroupBadges group={group} />
        </td>
        <td className="px-3 py-2">
          <div className="flex flex-col items-start gap-1">
            {!group.hasSuggestion && (
              <label className="flex items-center gap-1 text-xs text-zinc-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => onToggleRemember(e.target.checked)}
                />
                Gələcək üçün xatırla
              </label>
            )}
            {group.indices.length > 1 && (
              <button type="button" onClick={onToggleExpand} className="text-xs text-zinc-500 hover:underline">
                {expanded ? 'Gizlət' : 'Detallar'}
              </button>
            )}
          </div>
        </td>
      </tr>
      {expanded &&
        group.indices.map((index) => {
          const row = preview.rows[index];
          return (
            <tr key={index} className="border-b border-zinc-100 bg-zinc-50 text-xs last:border-0">
              <td className="px-3 py-1.5">
                <input type="checkbox" {...register(`rows.${index}.include` as const)} />
              </td>
              <td className="whitespace-nowrap px-3 py-1.5 text-zinc-500" colSpan={2}>
                {new Date(row.occurredAt).toLocaleString('az-AZ')} — {row.amount}
              </td>
              <td className="px-3 py-1.5" colSpan={2}>
                <Input {...register(`rows.${index}.note` as const)} className="min-w-[200px] text-xs" />
              </td>
              <td className="px-3 py-1.5">
                {row.isDuplicate && <Badge tone="amber">Dublikat</Badge>}
              </td>
            </tr>
          );
        })}
    </>
  );
}

export function ReviewTable({
  token,
  accountId,
  categories,
  preview,
  onDone,
}: {
  token: string;
  accountId: string;
  categories: Category[];
  preview: PreviewResponse;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const groups = useMemo(() => buildGroups(preview), [preview]);
  const firstIndexToGroup = useMemo(() => new Map(groups.map((g) => [g.indices[0], g])), [groups]);

  const [remember, setRemember] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((g) => [g.key, !g.hasSuggestion])),
  );
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      rows: preview.rows.map((row) => ({
        fingerprint: row.fingerprint,
        occurredAt: row.occurredAt,
        amount: row.amount,
        direction: row.direction,
        include: !row.isDuplicate,
        categoryId: row.suggestedCategoryId ?? '',
        note: row.description,
      })),
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      commitStatement(token, {
        accountId,
        rows: values.rows.map((row, index) => {
          const group = firstIndexToGroup.get(index);
          const saveRuleKeyword = group && remember[group.key] && row.categoryId ? group.description : undefined;
          return {
            fingerprint: row.fingerprint,
            occurredAt: row.occurredAt,
            amount: row.amount,
            direction: row.direction,
            categoryId: row.categoryId || undefined,
            note: row.note || undefined,
            include: row.include,
            saveRuleKeyword,
          };
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger-entries'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth'] });
    },
  });

  function setAllIncluded(value: boolean) {
    preview.rows.forEach((_, index) => setValue(`rows.${index}.include`, value));
  }

  function toggleExpand(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const result: CommitResponse | undefined = mutation.data;

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-600">
          {preview.totalRows} sətir, {groups.length} fərqli tacir/təsvir, {preview.duplicateCount} dublikat
          (avtomatik seçimdən çıxarılıb), {preview.balanceMismatchCount} balans uyğunsuzluğu.
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setAllIncluded(true)} className="text-sm text-zinc-600 hover:underline">
            Hamısını seç
          </button>
          <button type="button" onClick={() => setAllIncluded(false)} className="text-sm text-zinc-600 hover:underline">
            Seçimi ləğv et
          </button>
        </div>
      </Card>

      {result && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-green-200 bg-green-50">
          <p className="text-sm text-green-900">
            {result.imported} sətir idxal olundu, {result.skippedDuplicates} artıq mövcud olduğu üçün ötürüldü,{' '}
            {result.excluded} seçilmədiyi üçün idxal edilmədi.
          </p>
          <Button variant="secondary" onClick={onDone}>
            Yeni fayl yüklə
          </Button>
        </Card>
      )}

      {!result && (
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-3">
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium text-zinc-500">
                <tr>
                  <th className="px-3 py-2"></th>
                  <th className="px-3 py-2">Tacir / Təsvir</th>
                  <th className="px-3 py-2">Cəm məbləğ</th>
                  <th className="px-3 py-2">Kateqoriya</th>
                  <th className="px-3 py-2">Bayraqlar</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <GroupRow
                    key={group.key}
                    group={group}
                    control={control}
                    register={register}
                    setValue={setValue}
                    categories={categories}
                    preview={preview}
                    remember={remember[group.key] ?? false}
                    onToggleRemember={(value) => setRemember((prev) => ({ ...prev, [group.key]: value }))}
                    expanded={expanded.has(group.key)}
                    onToggleExpand={() => toggleExpand(group.key)}
                    token={token}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'İdxal olunur...' : 'Seçilənləri idxal et'}
            </Button>
            <Button type="button" variant="secondary" onClick={onDone}>
              Ləğv et
            </Button>
          </div>
          {mutation.isError && (
            <ErrorText>{mutation.error instanceof ApiError ? mutation.error.message : 'Xəta baş verdi'}</ErrorText>
          )}
        </form>
      )}
    </div>
  );
}
