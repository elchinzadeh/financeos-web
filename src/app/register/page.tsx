'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { register as registerRequest } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ErrorText } from '@/components/ui/error-text';

const schema = z.object({
  email: z.email('Düzgün email daxil edin'),
  password: z.string().min(8, 'Parol ən azı 8 simvol olmalıdır'),
  baseCurrency: z.string().length(3, 'ISO 4217 kodu, məs. AZN'),
  locale: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { baseCurrency: 'AZN', locale: 'az-AZ' },
  });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      const res = await registerRequest(values);
      setSession(res.accessToken, res.user, res.client);
      router.replace('/dashboard');
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Qeydiyyat uğursuz oldu');
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-4 text-lg font-semibold text-zinc-900">Qeydiyyat</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div>
            <Input type="email" placeholder="Email" {...registerField('email')} />
            <ErrorText>{errors.email?.message}</ErrorText>
          </div>
          <div>
            <Input type="password" placeholder="Parol (ən azı 8 simvol)" {...registerField('password')} />
            <ErrorText>{errors.password?.message}</ErrorText>
          </div>
          <div>
            <Input placeholder="Baza valyuta (məs. AZN)" {...registerField('baseCurrency')} />
            <ErrorText>{errors.baseCurrency?.message}</ErrorText>
          </div>
          <ErrorText>{formError}</ErrorText>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Yüklənir...' : 'Qeydiyyatdan keç'}
          </Button>
        </form>
        <p className="mt-4 text-sm text-zinc-500">
          Artıq hesabınız var?{' '}
          <Link href="/login" className="font-medium text-zinc-900 underline">
            Giriş
          </Link>
        </p>
      </Card>
    </div>
  );
}
