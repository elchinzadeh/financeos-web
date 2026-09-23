'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory, type Category, type CategoryKind } from '@/lib/api/categories';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { ErrorText } from '@/components/ui/error-text';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';

export function CreateCategoryModal({
  token,
  kind,
  onClose,
  onCreated,
}: {
  token: string;
  kind: CategoryKind;
  onClose: () => void;
  onCreated: (category: Category) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');

  const mutation = useMutation({
    mutationFn: () => createCategory(token, { name, kind, icon: icon || undefined }),
    onSuccess: (category) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onCreated(category);
      onClose();
    },
  });

  return (
    <Modal title={kind === 'expense' ? 'Yeni xərc kateqoriyası' : 'Yeni gəlir kateqoriyası'} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="flex flex-col gap-3"
      >
        <Field label="Ad">
          <Input autoFocus placeholder="məs. Kitablar" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="İkon (istəyə görə)">
          <Input placeholder="məs. 📚" value={icon} onChange={(e) => setIcon(e.target.value)} />
        </Field>
        <div className="flex gap-2">
          <Button type="submit" disabled={!name.trim() || mutation.isPending}>
            {mutation.isPending ? 'Yaradılır...' : 'Yarat'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Ləğv et
          </Button>
        </div>
        {mutation.isError && (
          <ErrorText>{mutation.error instanceof ApiError ? mutation.error.message : 'Xəta baş verdi'}</ErrorText>
        )}
      </form>
    </Modal>
  );
}
