import * as React from 'react';
import { cn } from '@/src/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-sm font-semibold leading-none text-stone-700 dark:text-stone-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-rose-500 text-xs">*</span>}
    </label>
  )
);
Label.displayName = 'Label';
