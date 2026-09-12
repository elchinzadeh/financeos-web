import type { ReactNode } from 'react';

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <p className="text-sm text-red-600">{children}</p>;
}
