import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
    const variants: Record<ButtonProps['variant'], string> = {
      default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
      outline:
        'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
    };
    const sizes: Record<ButtonProps['size'], string> = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4 text-sm',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';


