'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resetPassword } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ErrorText } from '@/components/ui/error-text';
import { Field } from '@/components/ui/field';
import { InfoNote } from '@/components/ui/info-note';

const schema = z
  .object({
    password: z.string().min(8, 'Parol ən azı 8 simvol olmalıdır'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Parollar uyğun gəlmir',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

function ResetPasswordForm() {
  const token = useSearchParams().get('token');
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    if (!token) return;
    setFormError(null);
    try {
      await resetPassword(token, values.password);
      setDone(true);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Sıfırlama uğursuz oldu');
    }
  }

  if (!token) {
    return (
      <>
        <ErrorText>Link etibarsızdır — token tapılmadı.</ErrorText>
        <p className="mt-4 text-sm text-zinc-500">
          <Link href="/forgot-password" className="font-medium text-zinc-900 underline">
            Yenidən sıfırlama linki istə
          </Link>
        </p>
      </>
    );
  }

  if (done) {
    return (
      <>
        <InfoNote>Parolunuz uğurla dəyişdirildi. İndi yeni parolla daxil ola bilərsiniz.</InfoNote>
        <p className="mt-4 text-sm text-zinc-500">
          <Link href="/login" className="font-medium text-zinc-900 underline">
            Girişə keç
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <InfoNote>Yeni parolunuzu təyin edin.</InfoNote>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-3">
        <Field label="Yeni parol">
          <Input type="password" placeholder="Yeni parol" {...register('password')} />
          <ErrorText>{errors.password?.message}</ErrorText>
        </Field>
        <Field label="Yeni parol (təkrar)">
          <Input type="password" placeholder="Yeni parolu təkrarlayın" {...register('confirmPassword')} />
          <ErrorText>{errors.confirmPassword?.message}</ErrorText>
        </Field>
        <ErrorText>{formError}</ErrorText>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Yenilənir...' : 'Parolu yenilə'}
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-2 text-lg font-semibold text-zinc-900">Yeni parol təyin et</h1>
        <Suspense fallback={<p className="text-sm text-zinc-400">Yüklənir...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </Card>
    </div>
  );
}
