import { clsx } from 'clsx';
import { forwardRef, type InputHTMLAttributes } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={clsx(
          'w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500',
          className,
        )}
        {...props}
      />
    );
  },
);
