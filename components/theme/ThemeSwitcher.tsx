'use client';

import { Moon, Sun, Monitor, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { useTranslation } from '@/lib/features/i18n';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ThemeSwitcherProps {
  variant?: 'dropdown' | 'buttons';
  showLabels?: boolean;
}

export function ThemeSwitcher({ variant = 'dropdown', showLabels = false }: ThemeSwitcherProps) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    if (variant === 'buttons') {
      return (
        <ButtonGroup orientation="horizontal" className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs font-medium border-0 bg-transparent"
            disabled
            aria-label="Theme switcher"
          >
            <Monitor className="h-3.5 w-3.5" />
          </Button>
        </ButtonGroup>
      );
    }
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-9 w-9 p-0"
        disabled
        aria-label="Theme switcher"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    );
  }

  const currentTheme = theme || 'system';

  if (variant === 'buttons') {
    const themes = [
      { value: 'light', label: t('theme.light'), icon: Sun },
      { value: 'dark', label: t('theme.dark'), icon: Moon },
      { value: 'system', label: t('theme.system'), icon: Monitor },
    ];

    return (
      <ButtonGroup orientation="horizontal" className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        {themes.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTheme(value)}
            className={cn(
              'h-8 text-xs font-medium transition-colors border-0',
              showLabels ? 'px-3' : 'px-1.5 sm:px-3',
              currentTheme === value
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 z-10'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 bg-transparent'
            )}
            aria-label={label}
          >
            <Icon className={cn('h-3.5 w-3.5', (showLabels ? 'mr-1.5' : 'sm:mr-1.5'))} />
            {showLabels ? <span>{label}</span> : <span className="hidden sm:inline">{label}</span>}
          </Button>
        ))}
      </ButtonGroup>
    );
  }

  // Default dropdown variant
  const currentIcon =
    currentTheme === 'light' ? (
      <Sun className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
    ) : currentTheme === 'dark' ? (
      <Moon className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
    ) : (
      <Monitor className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
    );

  return (
    <Select value={currentTheme} onValueChange={setTheme}>
      <SelectTrigger className="h-9 w-9 p-0 justify-center border-zinc-300 dark:border-zinc-700 [&>*:last-child]:hidden">
        <SelectValue aria-label="Theme">{currentIcon}</SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="light">
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <span>{t('theme.light')}</span>
            </div>
            {currentTheme === 'light' && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </div>
        </SelectItem>
        <SelectItem value="dark">
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              <span>{t('theme.dark')}</span>
            </div>
            {currentTheme === 'dark' && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </div>
        </SelectItem>
        <SelectItem value="system">
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span>{t('theme.system')}</span>
            </div>
            {currentTheme === 'system' && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

