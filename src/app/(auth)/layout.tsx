import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      <div className="relative hidden overflow-hidden bg-brand-ink px-12 py-12 lg:flex lg:w-[42%] lg:shrink-0 lg:flex-col lg:justify-between xl:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-16 select-none font-semibold leading-none text-brand-ink-foreground opacity-[0.06]"
          style={{ fontSize: '34rem' }}
        >
          ₼
        </div>

        <span className="relative text-lg font-semibold tracking-tight text-brand-ink-foreground">
          FinanceOS
        </span>

        <p className="relative max-w-sm text-2xl leading-snug font-medium text-balance text-brand-ink-foreground xl:text-3xl">
          Fərdi və freelancer maliyyəniz üçün tək mənbə.
        </p>
      </div>

      <div className="flex items-center justify-between px-6 py-5 lg:hidden">
        <span className="text-base font-semibold tracking-tight text-foreground">FinanceOS</span>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-8 lg:px-16 lg:py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
