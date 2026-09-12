'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/auth-context';
import { createCategory, listCategories, type Category, type CategoryKind } from '@/lib/api/categories';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ErrorText } from '@/components/ui/error-text';

const schema = z.object({
  name: z.string().min(1, 'Ad tələb olunur'),
  kind: z.enum(['income', 'expense']),
  parentId: z.string(),
  icon: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function CategoryColumn({ title, kind, categories }: { title: string; kind: CategoryKind; categories: Category[] }) {
  const items = categories.filter((c) => c.kind === kind);
  return (
    <Card>
      <h2 className="mb-3 text-sm font-medium text-zinc-900">{title}</h2>
      <ul className="flex flex-col gap-1">
        {items.map((cat) => (
          <li key={cat.id} className="flex items-center justify-between text-sm">
            <span>
              {cat.icon ? `${cat.icon} ` : ''}
              {cat.name}
            </span>
            {cat.userId === null && <span className="text-xs text-zinc-400">sistem</span>}
          </li>
        ))}
        {items.length === 0 && <li className="text-sm text-zinc-400">Kateqoriya yoxdur.</li>}
      </ul>
    </Card>
  );
}

export default function CategoriesPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => listCategories(token!),
    enabled: !!token,
  });
  const categories = data ?? [];

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { kind: 'expense', parentId: '' },
  });
  const selectedKind = useWatch({ control, name: 'kind' });
  const parentOptions = categories.filter((c) => c.kind === selectedKind);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      createCategory(token!, {
        name: values.name,
        kind: values.kind,
        parentId: values.parentId || undefined,
        icon: values.icon || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      reset({ kind: selectedKind, parentId: '', name: '', icon: '' });
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">Kateqoriyalar</h1>

      <Card>
        <h2 className="mb-3 text-sm font-medium text-zinc-900">Yeni kateqoriya</h2>
        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="flex flex-wrap items-start gap-3"
        >
          <div>
            <Input placeholder="Ad" {...register('name')} />
            <ErrorText>{errors.name?.message}</ErrorText>
          </div>
          <select className="rounded-md border border-zinc-300 px-3 py-2 text-sm" {...register('kind')}>
            <option value="expense">Xərc</option>
            <option value="income">Gəlir</option>
          </select>
          <select className="rounded-md border border-zinc-300 px-3 py-2 text-sm" {...register('parentId')}>
            <option value="">Valideyn yoxdur</option>
            {parentOptions.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <Input placeholder="İkon (istəyə görə, məs. 📚)" className="w-40" {...register('icon')} />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Əlavə olunur...' : 'Əlavə et'}
          </Button>
        </form>
        {mutation.isError && (
          <ErrorText>{mutation.error instanceof ApiError ? mutation.error.message : 'Xəta baş verdi'}</ErrorText>
        )}
      </Card>

      {isLoading && <p className="text-sm text-zinc-400">Yüklənir...</p>}
      {error && <ErrorText>{error instanceof ApiError ? error.message : 'Xəta baş verdi'}</ErrorText>}

      <div className="grid gap-4 sm:grid-cols-2">
        <CategoryColumn title="Gəlir" kind="income" categories={categories} />
        <CategoryColumn title="Xərc" kind="expense" categories={categories} />
      </div>
    </div>
  );
}
