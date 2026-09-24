'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { register as registerRequest } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from '@/components/shadcn/field';

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
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Hesab yaradın</h1>
      <p className="mt-2 text-sm text-muted-foreground">Bir dəqiqədən az vaxt aparır.</p>

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
              {...registerField('email')}
            />
            <FieldError errors={[errors.email]} />
          </Field>
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Parol</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="ən azı 8 simvol"
              aria-invalid={!!errors.password}
              {...registerField('password')}
            />
            <FieldError errors={[errors.password]} />
          </Field>
          <Field data-invalid={!!errors.baseCurrency}>
            <FieldLabel htmlFor="baseCurrency">Baza valyuta</FieldLabel>
            <Input
              id="baseCurrency"
              placeholder="AZN"
              className="uppercase"
              maxLength={3}
              aria-invalid={!!errors.baseCurrency}
              {...registerField('baseCurrency')}
            />
            <FieldDescription>Bütün hesablarınızın ümumi dəyəri bu valyutada göstəriləcək.</FieldDescription>
            <FieldError errors={[errors.baseCurrency]} />
          </Field>
        </FieldGroup>

        {formError && (
          <p role="alert" className="mt-4 flex items-start gap-1.5 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-6 w-full py-2.5 text-base" disabled={isSubmitting}>
          {isSubmitting ? 'Yüklənir…' : 'Qeydiyyatdan keç'}
        </Button>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        Artıq hesabınız var?{' '}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4 hover:no-underline">
          Daxil olun
        </Link>
      </p>
    </div>
  );
}
