'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/auth-context';
import {
  deleteCategory,
  updateCategory,
  type Category,
  type DeleteCategoryStrategy,
} from '@/lib/api/categories';
import { ApiError } from '@/lib/api/client';
import { collectDescendantIds, flattenCategoryTree, indentLabel, type CategoryTreeNode } from '@/lib/categories-tree';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorText } from '@/components/ui/error-text';
import { Field } from '@/components/ui/field';

const STRATEGY_LABELS: Record<DeleteCategoryStrategy, string> = {
  reassign: 'Başqa kateqoriyaya köçür',
  uncategorize: 'Kateqoriyasız et',
  delete: 'Ödənişləri də sil',
  archive: 'Ödənişləri arxivlə',
};

interface EditFormValues {
  name: string;
  icon: string;
  parentId: string;
}

export function CategoryTreeRow({
  node,
  tree,
  allCategories,
}: {
  node: CategoryTreeNode;
  tree: CategoryTreeNode[];
  allCategories: Category[];
}) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<'view' | 'edit' | 'delete'>('view');
  const [strategy, setStrategy] = useState<DeleteCategoryStrategy>('uncategorize');
  const [targetCategoryId, setTargetCategoryId] = useState('');

  const excludedIds = collectDescendantIds(allCategories, node.id);
  const parentOptions = flattenCategoryTree(tree).filter(
    (c) => c.kind === node.kind && !excludedIds.has(c.id),
  );
  const reassignOptions = allCategories.filter((c) => c.kind === node.kind && c.id !== node.id);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting: isEditSubmitting },
  } = useForm<EditFormValues>({
    defaultValues: { name: node.name, icon: node.icon ?? '', parentId: node.parentId ?? '' },
  });

  const updateMutation = useMutation({
    mutationFn: (values: EditFormValues) =>
      updateCategory(token!, node.id, {
        name: values.name,
        icon: values.icon || undefined,
        parentId: values.parentId || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setMode('view');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      deleteCategory(token!, node.id, {
        strategy,
        targetCategoryId: strategy === 'reassign' ? targetCategoryId : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['ledger-entries'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth'] });
      setMode('view');
    },
  });

  return (
    <li className="flex flex-col gap-2 text-sm" style={{ paddingLeft: node.depth * 16 }}>
      {mode === 'view' && (
        <div className="flex items-center justify-between gap-2">
          <span>
            {node.icon ? `${node.icon} ` : ''}
            {node.name}
          </span>
          <span className="flex gap-2 text-xs">
            <button type="button" className="text-zinc-500 hover:text-zinc-900" onClick={() => setMode('edit')}>
              Redaktə
            </button>
            <button type="button" className="text-red-500 hover:text-red-700" onClick={() => setMode('delete')}>
              Sil
            </button>
          </span>
        </div>
      )}

      {mode === 'edit' && (
        <form
          onSubmit={handleSubmit((values) => updateMutation.mutate(values))}
          className="flex flex-wrap items-end gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-3"
        >
          <Field label="Ad">
            <Input className="w-40" {...register('name', { required: true })} />
          </Field>
          <Field label="İkon">
            <Input className="w-20" {...register('icon')} />
          </Field>
          <Field label="Valideyn">
            <select className="rounded-md border border-zinc-300 px-2 py-2 text-sm" {...register('parentId')}>
              <option value="">Valideyn yoxdur</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {indentLabel(c.name, c.depth)}
                </option>
              ))}
            </select>
          </Field>
          <Button type="submit" disabled={isEditSubmitting}>
            Saxla
          </Button>
          <Button type="button" variant="secondary" onClick={() => setMode('view')}>
            Ləğv et
          </Button>
          {updateMutation.isError && (
            <ErrorText>
              {updateMutation.error instanceof ApiError ? updateMutation.error.message : 'Xəta baş verdi'}
            </ErrorText>
          )}
        </form>
      )}

      {mode === 'delete' && (
        <div className="flex flex-col gap-2 rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-xs text-zinc-700">
            &quot;{node.name}&quot; silinsin. Bu kateqoriyaya aid ödənişlərlə nə edilsin?
          </p>
          <div className="flex flex-col gap-1">
            {(Object.keys(STRATEGY_LABELS) as DeleteCategoryStrategy[]).map((key) => (
              <label key={key} className="flex items-center gap-2 text-xs">
                <input
                  type="radio"
                  name={`strategy-${node.id}`}
                  checked={strategy === key}
                  onChange={() => setStrategy(key)}
                />
                {STRATEGY_LABELS[key]}
              </label>
            ))}
          </div>
          {strategy === 'reassign' && (
            <select
              className="rounded-md border border-zinc-300 px-2 py-2 text-sm"
              value={targetCategoryId}
              onChange={(e) => setTargetCategoryId(e.target.value)}
            >
              <option value="">Hədəf kateqoriya seçin</option>
              {reassignOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="danger"
              disabled={deleteMutation.isPending || (strategy === 'reassign' && !targetCategoryId)}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? 'Silinir...' : 'Təsdiqlə və sil'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setMode('view')}>
              Ləğv et
            </Button>
          </div>
          {deleteMutation.isError && (
            <ErrorText>
              {deleteMutation.error instanceof ApiError ? deleteMutation.error.message : 'Xəta baş verdi'}
            </ErrorText>
          )}
        </div>
      )}

      {node.children.length > 0 && (
        <ul className="flex flex-col gap-2">
          {node.children.map((child) => (
            <CategoryTreeRow key={child.id} node={child} tree={tree} allCategories={allCategories} />
          ))}
        </ul>
      )}
    </li>
  );
}
