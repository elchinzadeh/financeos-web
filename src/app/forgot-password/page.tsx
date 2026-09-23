'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { forgotPassword } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ErrorText } from '@/components/ui/error-text';
import { Field } from '@/components/ui/field';
import { InfoNote } from '@/components/ui/info-note';

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

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-2 text-lg font-semibold text-zinc-900">Şifrəni sıfırla</h1>

        {sent ? (
          <InfoNote>
            Əgər bu email qeydiyyatdan keçibsə, sıfırlama linki göndərildi. Emailinizi yoxlayın (spam qovluğu daxil).
          </InfoNote>
        ) : (
          <>
            <InfoNote>
              Qeydiyyatdan keçdiyiniz email ünvanını daxil edin — sizə parolu sıfırlamaq üçün link göndərəcəyik.
            </InfoNote>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-3">
              <Field label="Email">
                <Input type="email" placeholder="siz@example.com" {...register('email')} />
                <ErrorText>{errors.email?.message}</ErrorText>
              </Field>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Göndərilir...' : 'Sıfırlama linki göndər'}
              </Button>
            </form>
          </>
        )}

        <p className="mt-4 text-sm text-zinc-500">
          <Link href="/login" className="font-medium text-zinc-900 underline">
            Girişə qayıt
          </Link>
        </p>
      </Card>
    </div>
  );
}
