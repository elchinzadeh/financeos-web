'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { Card } from '@/components/ui/card';
import { FxRatesSection } from './_components/fx-rates-section';
import { DangerZone } from './_components/danger-zone';

export default function SettingsPage() {
  const { token, user, client } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">Ayarlar</h1>

      <Card>
        <h2 className="mb-3 text-sm font-medium text-zinc-900">Hesab məlumatı</h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-zinc-500">Email</dt>
          <dd>{user?.email}</dd>
          <dt className="text-zinc-500">Baza valyuta</dt>
          <dd>{user?.baseCurrency}</dd>
          <dt className="text-zinc-500">Dil</dt>
          <dd>{user?.locale}</dd>
          <dt className="text-zinc-500">Client</dt>
          <dd>{client?.name}</dd>
        </dl>
      </Card>

      <FxRatesSection token={token!} />
      <DangerZone token={token!} />
    </div>
  );
}
