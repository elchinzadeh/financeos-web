'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { login } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/shadcn/field';

const schema = z.object({
  email: z.email('Düzgün email daxil edin'),
  password: z.string().min(8, 'Parol ən azı 8 simvol olmalıdır'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      const res = await login(values);
      setSession(res.accessToken, res.user, res.client);
      router.replace('/dashboard');
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Login uğursuz oldu');
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Hesabınıza daxil olun</h1>
      <p className="mt-2 text-sm text-muted-foreground">Mövcud email və parolunuzla davam edin.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8" noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="siz@example.com"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            <FieldError errors={[errors.email]} />
          </Field>
          <Field data-invalid={!!errors.password}>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Parol</FieldLabel>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Şifrəni unutmusunuz?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            <FieldError errors={[errors.password]} />
          </Field>
        </FieldGroup>

        {formError && (
          <p role="alert" className="mt-4 flex items-start gap-1.5 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-6 w-full py-2.5 text-base" disabled={isSubmitting}>
          {isSubmitting ? 'Yüklənir…' : 'Daxil ol'}
        </Button>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        Hesabınız yoxdur?{' '}
        <Link href="/register" className="font-medium text-foreground underline underline-offset-4 hover:no-underline">
          Qeydiyyatdan keçin
        </Link>
      </p>
    </div>
  );
}
