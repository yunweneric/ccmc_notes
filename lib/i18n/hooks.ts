import { useLanguageContext } from './context';
import type { Locale } from './types';

export function useTranslation() {
  const { locale, setLocale, t } = useLanguageContext();

  // Helper function to replace placeholders in strings
  const translate = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = t;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation key "${key}" not found`);
        return key;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation value for "${key}" is not a string`);
      return key;
    }

    // Replace placeholders like {level} with actual values
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() ?? match;
      });
    }

    return value;
  };

  return {
    t: translate,
    locale,
    setLocale,
  };
}

