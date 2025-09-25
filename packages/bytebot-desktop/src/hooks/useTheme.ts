import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
    theme: Theme;
    actualTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('bytebot-theme');
        return (saved as Theme) || 'dark';
    });

    const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = () => {
            if (theme === 'auto') {
                setActualTheme(mediaQuery.matches ? 'dark' : 'light');
            }
        };

        handleChange();
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    useEffect(() => {
        if (theme === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            setActualTheme(mediaQuery.matches ? 'dark' : 'light');
        } else {
            setActualTheme(theme);
        }
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('bytebot-theme', theme);
    }, [theme]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', actualTheme);
        document.documentElement.className = actualTheme;
    }, [actualTheme]);

    const toggleTheme = () => {
        setTheme(prev => {
            switch (prev) {
                case 'light':
                    return 'dark';
                case 'dark':
                    return 'auto';
                case 'auto':
                    return 'light';
                default:
                    return 'dark';
            }
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, actualTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
