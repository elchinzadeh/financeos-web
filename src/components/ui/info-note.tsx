import type { ReactNode } from 'react';

export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">{children}</div>
  );
}
