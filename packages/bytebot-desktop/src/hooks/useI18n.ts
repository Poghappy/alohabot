import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';

export type Locale = 'zh' | 'en';

export interface LocaleMessages {
    [key: string]: string | LocaleMessages;
}

interface I18nContextType {
    locale: Locale;
    messages: LocaleMessages;
    setLocale: (locale: Locale) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
    children: ReactNode;
}

// 简化的消息对象
const messages: Record<Locale, LocaleMessages> = {
    zh: {
        common: {
            loading: '加载中...',
            error: '错误',
            success: '成功',
            cancel: '取消',
            confirm: '确认'
        },
        nav: {
            tasks: '任务',
            automation: '自动化',
            localai: '本地AI'
        },
        automation: {
            title: '桌面自动化',
            click: { title: '点击操作' },
            type: { title: '文本输入' },
            key: { title: '按键操作' },
            scroll: { title: '滚动操作' }
        },
        localAI: {
            title: '本地AI模型'
        }
    },
    en: {
        common: {
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
            cancel: 'Cancel',
            confirm: 'Confirm'
        },
        nav: {
            tasks: 'Tasks',
            automation: 'Automation',
            localai: 'Local AI'
        },
        automation: {
            title: 'Desktop Automation',
            click: { title: 'Click Action' },
            type: { title: 'Type Text' },
            key: { title: 'Key Press' },
            scroll: { title: 'Scroll Action' }
        },
        localAI: {
            title: 'Local AI Models'
        }
    }
};

const getNestedMessage = (obj: LocaleMessages, key: string): string => {
    const keys = key.split('.');
    let current: any = obj;

    for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
            current = current[k];
        } else {
            return key; // Return key if not found
        }
    }

    return typeof current === 'string' ? current : key;
};

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
    const [locale, setLocaleState] = useState<Locale>(() => {
        const saved = localStorage.getItem('bytebot-locale') as Locale;
        return saved || 'zh';
    });

    const [currentMessages, setCurrentMessages] = useState<LocaleMessages>(() =>
        messages[locale]
    );

    useEffect(() => {
        setCurrentMessages(messages[locale]);
    }, [locale]);

    useEffect(() => {
        localStorage.setItem('bytebot-locale', locale);
    }, [locale]);

    useEffect(() => {
        document.documentElement.setAttribute('lang', locale);
        document.documentElement.setAttribute('data-locale', locale);
    }, [locale]);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
    };

    const t = (key: string, params?: Record<string, string | number>): string => {
        let message = getNestedMessage(currentMessages, key);

        if (params) {
            Object.entries(params).forEach(([param, value]) => {
                message = message.replace(`{${param}}`, String(value));
            });
        }

        return message;
    };

    return (
        <I18nContext.Provider value={{ locale, messages: currentMessages, setLocale, t }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = (): I18nContextType => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
};
