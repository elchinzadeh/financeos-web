'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { forgotPassword } from '@/lib/api/auth';
import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/shadcn/field';

const schema = z.object({
  email: z.email('Düzgün email daxil edin'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    // Email mövcud olsun-olmasın eyni nəticə göstərilir — backend də eyni şəkildə davranır (sızdırmama).
    await forgotPassword(values.email).catch(() => undefined);
    setSent(true);
  }

  if (sent) {
    return (
      <div>
        <CheckCircle2 className="size-8 text-foreground" strokeWidth={1.5} />
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">Linki yoxlayın</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Əgər bu email qeydiyyatdan keçibsə, sıfırlama linki göndərildi. Emailinizi yoxlayın (spam qovluğu daxil).
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline underline-offset-4 hover:no-underline"
        >
          <ArrowLeft className="size-3.5" />
          Girişə qayıt
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Şifrəni sıfırlayın</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Qeydiyyatdan keçdiyiniz email ünvanını daxil edin — sizə sıfırlama linki göndərəcəyik.
      </p>

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
        </FieldGroup>

        <Button type="submit" size="lg" className="mt-6 w-full py-2.5 text-base" disabled={isSubmitting}>
          {isSubmitting ? 'Göndərilir…' : 'Sıfırlama linki göndər'}
        </Button>
      </form>

      <Link
        href="/login"
        className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Girişə qayıt
      </Link>
    </div>
  );
}
