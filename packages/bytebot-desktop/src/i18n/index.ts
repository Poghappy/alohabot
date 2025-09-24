import { en } from './locales/en';
import { vi } from './locales/vi';
import { zh } from './locales/zh';

export type Locale = 'zh' | 'en' | 'vi';
export type LocaleMessages = typeof zh;

export const locales = {
    zh,
    en,
    vi,
} as const;

export const localeNames: Record<Locale, string> = {
    zh: '中文',
    en: 'English',
    vi: 'Tiếng Việt',
};

export const localeFlags: Record<Locale, string> = {
    zh: '🇨🇳',
    en: '🇺🇸',
    vi: '🇻🇳',
};

export const defaultLocale: Locale = 'zh';

export const supportedLocales: Locale[] = ['zh', 'en', 'vi'];

export function getLocaleMessages(locale: Locale): LocaleMessages {
    return locales[locale] || locales[defaultLocale];
}

export function formatMessage(
    message: string,
    params: Record<string, string | number> = {}
): string {
    return Object.keys(params).reduce((msg, key) => {
        return msg.replace(new RegExp(`{${key}}`, 'g'), String(params[key]));
    }, message);
}

export function getNestedMessage(
    messages: LocaleMessages,
    key: string
): string {
    const keys = key.split('.');
    let result: any = messages;

    for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
            result = result[k];
        } else {
            return key; // 返回原始 key 如果找不到
        }
    }

    return typeof result === 'string' ? result : key;
}
