import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-zinc-900 text-white hover:bg-zinc-700 disabled:bg-zinc-300',
  secondary: 'bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-50 disabled:text-zinc-400',
  danger: 'bg-red-600 text-white hover:bg-red-500 disabled:bg-red-300',
};

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
}
