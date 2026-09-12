'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { useAuth } from '@/lib/auth/auth-context';
import { logout as logoutRequest } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/accounts', label: 'Hesablar' },
  { href: '/ledger', label: 'Əməliyyatlar' },
  { href: '/budget', label: 'Büdcə', soon: true },
  { href: '/goals', label: 'Hədəflər', soon: true },
  { href: '/settings', label: 'Ayarlar', soon: true },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { token, user, clearSession } = useAuth();

  async function handleLogout() {
    if (token) {
      await logoutRequest(token).catch(() => undefined);
    }
    clearSession();
    router.replace('/login');
  }

  return (
    <nav className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-zinc-900">FinanceOS</span>
        {LINKS.map((link) =>
          link.soon ? (
            <span key={link.href} className="text-sm text-zinc-300" title="Tezliklə">
              {link.label}
            </span>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'text-sm text-zinc-600 hover:text-zinc-900',
                pathname?.startsWith(link.href) && 'font-medium text-zinc-900',
              )}
            >
              {link.label}
            </Link>
          ),
        )}
      </div>
      <div className="flex items-center gap-3">
        {user && <span className="text-sm text-zinc-500">{user.email}</span>}
        <Button variant="secondary" onClick={handleLogout}>
          Çıxış
        </Button>
      </div>
    </nav>
  );
}
