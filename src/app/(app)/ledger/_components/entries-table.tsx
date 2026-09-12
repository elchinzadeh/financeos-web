import type { LedgerEntry } from '@/lib/api/ledger';
import type { AccountWithBalance } from '@/lib/api/accounts';
import type { Category } from '@/lib/api/categories';

export function EntriesTable({
  entries,
  accounts,
  categories,
}: {
  entries: LedgerEntry[];
  accounts: AccountWithBalance[];
  categories: Category[];
}) {
  const accountById = new Map(accounts.map((a) => [a.id, a]));
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  if (entries.length === 0) {
    return <p className="text-sm text-zinc-400">Hələ əməliyyat yoxdur.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200 text-xs text-zinc-500">
          <tr>
            <th className="px-4 py-2">Tarix</th>
            <th className="px-4 py-2">Hesab</th>
            <th className="px-4 py-2">Kateqoriya</th>
            <th className="px-4 py-2">İstiqamət</th>
            <th className="px-4 py-2">Məbləğ</th>
            <th className="px-4 py-2">Qeyd</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-zinc-100 last:border-0">
              <td className="px-4 py-2 text-zinc-500">{new Date(entry.occurredAt).toLocaleString('az-AZ')}</td>
              <td className="px-4 py-2">{accountById.get(entry.accountId)?.name ?? entry.accountId}</td>
              <td className="px-4 py-2 text-zinc-500">
                {entry.categoryId ? (categoryById.get(entry.categoryId)?.name ?? '—') : '—'}
              </td>
              <td className="px-4 py-2">
                <span className={entry.direction === 'credit' ? 'text-emerald-600' : 'text-red-600'}>
                  {entry.direction === 'credit' ? 'Kredit' : 'Debit'}
                </span>
              </td>
              <td className="px-4 py-2">
                {entry.amount} {entry.currency}
              </td>
              <td className="px-4 py-2 text-zinc-500">{entry.note ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
