import React, { useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { Locale, localeFlags, localeNames, supportedLocales } from '../i18n';
import './LanguageToggle.css';

const LanguageToggle: React.FC = () => {
    const { locale, setLocale, t } = useI18n();
    const [isOpen, setIsOpen] = useState(false);

    const handleLocaleChange = (newLocale: Locale) => {
        setLocale(newLocale);
        setIsOpen(false);
    };

    const currentLocaleName = localeNames[locale];
    const currentLocaleFlag = localeFlags[locale];

    return (
        <div className="language-toggle">
            <button
                className="language-toggle-button"
                onClick={() => setIsOpen(!isOpen)}
                title={t('language.switchTo') + ' ' + currentLocaleName}
                aria-label={`${t('language.current')}: ${currentLocaleName}, ${t('language.switchTo')}`}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <span className="language-flag" aria-hidden="true">
                    {currentLocaleFlag}
                </span>
                <span className="language-name">
                    {currentLocaleName}
                </span>
                <span className={`language-arrow ${isOpen ? 'open' : ''}`} aria-hidden="true">
                    ▼
                </span>
            </button>

            {isOpen && (
                <div className="language-dropdown" role="listbox">
                    {supportedLocales.map((supportedLocale) => (
                        <button
                            key={supportedLocale}
                            className={`language-option ${locale === supportedLocale ? 'selected' : ''}`}
                            onClick={() => handleLocaleChange(supportedLocale)}
                            role="option"
                            aria-selected={locale === supportedLocale}
                            title={t('language.description.' + supportedLocale)}
                        >
                            <span className="language-flag" aria-hidden="true">
                                {localeFlags[supportedLocale]}
                            </span>
                            <span className="language-name">
                                {localeNames[supportedLocale]}
                            </span>
                            {locale === supportedLocale && (
                                <span className="language-check" aria-hidden="true">
                                    ✓
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* 点击外部关闭下拉菜单 */}
            {isOpen && (
                <div
                    className="language-overlay"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}
        </div>
    );
};

export default LanguageToggle;
