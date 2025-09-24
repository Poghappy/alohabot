import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { Locale, LocaleMessages, getLocaleMessages, formatMessage, getNestedMessage } from '../i18n';

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

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
    const [locale, setLocaleState] = useState<Locale>(() => {
        const saved = localStorage.getItem('bytebot-locale') as Locale;
        return saved || 'zh';
    });

    const [messages, setMessages] = useState<LocaleMessages>(() =>
        getLocaleMessages(locale)
    );

    useEffect(() => {
        setMessages(getLocaleMessages(locale));
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
        const message = getNestedMessage(messages, key);
        return params ? formatMessage(message, params) : message;
    };

    return (
        <I18nContext.Provider value= {{ locale, messages, setLocale, t }
}>
    { children }
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

export const useTranslation = () => {
    const { t } = useI18n();
    return t;
};