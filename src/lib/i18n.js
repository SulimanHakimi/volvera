import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from '../../public/locales/en/common.json';
import faCommon from '../../public/locales/fa/common.json';
import psCommon from '../../public/locales/ps/common.json';

const resources = {
    en: {
        common: enCommon,
    },
    fa: {
        common: faCommon,
    },
    ps: {
        common: psCommon,
    },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en', // default language
        fallbackLng: 'en',
        defaultNS: 'common',
        interpolation: {
            escapeValue: false, // React already escapes values
        },
        react: {
            useSuspense: false,
        },
    });

export default i18n;
