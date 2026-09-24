'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { resetPassword } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/shadcn/field';

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
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Link etibarsızdır</h1>
        <p role="alert" className="mt-2 flex items-start gap-1.5 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          Token tapılmadı — link köhnəlmiş ola bilər.
        </p>
        <Link
          href="/forgot-password"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline underline-offset-4 hover:no-underline"
        >
          <ArrowLeft className="size-3.5" />
          Yenidən sıfırlama linki istə
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div>
        <CheckCircle2 className="size-8 text-foreground" strokeWidth={1.5} />
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">Parol yeniləndi</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Parolunuz uğurla dəyişdirildi. İndi yeni parolla daxil ola bilərsiniz.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline underline-offset-4 hover:no-underline"
        >
          <ArrowLeft className="size-3.5" />
          Girişə keçin
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Yeni parol təyin edin</h1>
      <p className="mt-2 text-sm text-muted-foreground">Hesabınız üçün yeni bir parol seçin.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8" noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Yeni parol</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="ən azı 8 simvol"
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            <FieldError errors={[errors.password]} />
          </Field>
          <Field data-invalid={!!errors.confirmPassword}>
            <FieldLabel htmlFor="confirmPassword">Yeni parol (təkrar)</FieldLabel>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="parolu təkrarlayın"
              aria-invalid={!!errors.confirmPassword}
              {...register('confirmPassword')}
            />
            <FieldError errors={[errors.confirmPassword]} />
          </Field>
        </FieldGroup>

        {formError && (
          <p role="alert" className="mt-4 flex items-start gap-1.5 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-6 w-full py-2.5 text-base" disabled={isSubmitting}>
          {isSubmitting ? 'Yenilənir…' : 'Parolu yenilə'}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Yüklənir…</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
