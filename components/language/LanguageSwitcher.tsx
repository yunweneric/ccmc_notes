'use client';

import { Languages, Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
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

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();

  const currentLang = languages.find((l) => l.code === locale) ?? languages[0];

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

