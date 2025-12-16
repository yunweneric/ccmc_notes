'use client';

import { Languages, Check } from 'lucide-react';
import { useTranslation } from '@/lib/features/i18n';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const languages = [
  { code: 'en' as const, name: 'English', flag: '🇬🇧' },
  { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
] as const;

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'buttons';
  showLabels?: boolean;
}

export function LanguageSwitcher({ variant = 'dropdown', showLabels = false }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useTranslation();

  const currentLang = languages.find((l) => l.code === locale) ?? languages[0];

  if (variant === 'buttons') {
    return (
      <ButtonGroup orientation="horizontal" className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLocale(lang.code)}
            className={cn(
              'h-8 text-xs font-medium transition-colors border-0',
              showLabels ? 'px-3' : 'px-1.5 sm:px-3',
              locale === lang.code
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 z-10'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 bg-transparent'
            )}
            aria-label={lang.name}
          >
            <span className={cn('text-sm leading-none', (showLabels ? 'mr-1.5' : 'sm:mr-1.5'))}>
              {lang.flag}
            </span>
            {showLabels ? <span>{lang.name}</span> : <span className="hidden sm:inline">{lang.name}</span>}
          </Button>
        ))}
      </ButtonGroup>
    );
  }

  // Default dropdown variant
  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as 'en' | 'fr')}>
      <SelectTrigger className="h-9 w-9 p-0 justify-center border-zinc-300 dark:border-zinc-700 [&>*:last-child]:hidden">
        <SelectValue aria-label="Language">
          <span className="text-base leading-none">{currentLang.flag}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
              {locale === lang.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

