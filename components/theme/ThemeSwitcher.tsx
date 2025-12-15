'use client';

import { Moon, Sun, Monitor, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
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

