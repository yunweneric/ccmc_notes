'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ReactNode } from 'react';
import type { ComponentProps } from 'react';

type ThemeProviderProps = {
  children: ReactNode;
} & Omit<ComponentProps<typeof NextThemesProvider>, 'children'>;

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

