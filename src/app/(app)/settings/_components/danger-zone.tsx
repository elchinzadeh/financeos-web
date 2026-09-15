'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { deactivateAccount, deleteAllData } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ErrorText } from '@/components/ui/error-text';
import { Field } from '@/components/ui/field';

function ConfirmActionForm({
  title,
  description,
  confirmMessage,
  buttonLabel,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmMessage: string;
  buttonLabel: string;
  onConfirm: (password: string) => void;
}) {
  const [password, setPassword] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (window.confirm(confirmMessage)) {
      onConfirm(password);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <p className="text-sm font-medium text-zinc-900">{title}</p>
      <p className="text-xs text-zinc-500">{description}</p>
      <div className="flex items-end gap-2">
        <Field label="Parol">
          <Input
            type="password"
            placeholder="Parolunuz"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <Button type="submit" variant="danger">
          {buttonLabel}
        </Button>
      </div>
    </form>
  );
}

export function DangerZone({ token }: { token: string }) {
  const router = useRouter();
  const { clearSession } = useAuth();

  const deactivateMutation = useMutation({
    mutationFn: (password: string) => deactivateAccount(token, password),
    onSuccess: () => {
      clearSession();
      router.replace('/login');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (password: string) => deleteAllData(token, password),
    onSuccess: () => {
      clearSession();
      router.replace('/login');
    },
  });

  return (
    <Card className="flex flex-col gap-5 border-red-200">
      <h2 className="text-sm font-medium text-red-700">Təhlükəli Zona</h2>

      <ConfirmActionForm
        title="Hesabı deaktiv et"
        description="Bütün sessiyalar ləğv olunur, gələcək login-lər bloklanır. Geri qaytarma yoxdur."
        confirmMessage="Hesabınızı deaktiv etmək istədiyinizə əminsiniz?"
        buttonLabel="Deaktiv et"
        onConfirm={(password) => deactivateMutation.mutate(password)}
      />
      {deactivateMutation.isError && (
        <ErrorText>
          {deactivateMutation.error instanceof ApiError ? deactivateMutation.error.message : 'Xəta baş verdi'}
        </ErrorText>
      )}

      <div className="border-t border-zinc-100 pt-4">
        <ConfirmActionForm
          title="Bütün məlumatları sil"
          description="Hesablarınız, əməliyyatlarınız, hədəfləriniz, büdcələriniz və istifadəçi hesabınız geri dönməz şəkildə silinir."
          confirmMessage="TÜM MƏLUMATLARINIZI GERİ DÖNMƏZ ŞƏKİLDƏ SİLMƏK istədiyinizə əminsiniz?"
          buttonLabel="Hər şeyi sil"
          onConfirm={(password) => deleteMutation.mutate(password)}
        />
        {deleteMutation.isError && (
          <ErrorText>
            {deleteMutation.error instanceof ApiError ? deleteMutation.error.message : 'Xəta baş verdi'}
          </ErrorText>
        )}
      </div>
    </Card>
  );
}
