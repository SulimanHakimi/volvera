'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../lib/i18n';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const { i18n } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState('en');
    const [direction, setDirection] = useState('ltr');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const savedLang = localStorage.getItem('language') || 'en';
            changeLanguage(savedLang);
        }
    }, []);

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        setCurrentLanguage(lang);

        const isRTL = lang === 'fa' || lang === 'ps';
        setDirection(isRTL ? 'rtl' : 'ltr');

        if (typeof document !== 'undefined') {
            document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
            document.documentElement.lang = lang;
        }

        if (typeof window !== 'undefined') {
            localStorage.setItem('language', lang);
        }
    };

    const value = {
        currentLanguage,
        direction,
        changeLanguage,
        isRTL: direction === 'rtl',
        mounted,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
