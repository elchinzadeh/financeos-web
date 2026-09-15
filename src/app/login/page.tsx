'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { login } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ErrorText } from '@/components/ui/error-text';
import { Field } from '@/components/ui/field';
import { InfoNote } from '@/components/ui/info-note';

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
    <div className="flex flex-1 items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-2 text-lg font-semibold text-zinc-900">Giriş</h1>
        <InfoNote>
          Mövcud email və parolunuzla daxil olun. Hesabınız yoxdursa, aşağıdakı &quot;Qeydiyyat&quot; linkindən yeni
          hesab yarada bilərsiniz.
        </InfoNote>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-3">
          <Field label="Email">
            <Input type="email" placeholder="siz@example.com" {...register('email')} />
            <ErrorText>{errors.email?.message}</ErrorText>
          </Field>
          <Field label="Parol">
            <Input type="password" placeholder="Parol" {...register('password')} />
            <ErrorText>{errors.password?.message}</ErrorText>
          </Field>
          <ErrorText>{formError}</ErrorText>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Yüklənir...' : 'Daxil ol'}
          </Button>
        </form>
        <p className="mt-4 text-sm text-zinc-500">
          Hesabınız yoxdur?{' '}
          <Link href="/register" className="font-medium text-zinc-900 underline">
            Qeydiyyat
          </Link>
        </p>
      </Card>
    </div>
  );
}
