import { appWithTranslation, useTranslation } from 'next-i18next';
import i18nConfig from './next-i18next.config';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Placeholder resources. Replace with your actual translations.
const resources = {
  en: { translation: { WELCOME: "Welcome" } },
  hi: { translation: { WELCOME: "स्वागत है" } },
  as: { translation: { WELCOME: "স্বাগতম" } },
  bn: { translation: { WELCOME: "স্বাগতম" } },
  brx: { translation: { WELCOME: "बड़ो फुं" } },
  doi: { translation: { WELCOME: "स्वागत" } },
  gu: { translation: { WELCOME: "સ્વાગત છે" } },
  kn: { translation: { WELCOME: "ಸ್ವಾಗತ" } },
  ks: { translation: { WELCOME: "خوش آمدید" } },
  kok: { translation: { WELCOME: "स्वागत" } },
  mai: { translation: { WELCOME: "स्वागत अछि" } },
  ml: { translation: { WELCOME: "സ്വാഗതം" } },
  mni: { translation: { WELCOME: "ꯁꯣꯒꯠ ꯇꯧꯕꯥꯏ" } },
  mr: { translation: { WELCOME: "स्वागत आहे" } },
  ne: { translation: { WELCOME: "स्वागत छ" } },
  or: { translation: { WELCOME: "ସ୍ୱାଗତ" } },
  pa: { translation: { WELCOME: "ਜੀ ਆਇਆਂ ਨੂੰ" } },
  sa: { translation: { WELCOME: "स्वागतम्" } },
  sat: { translation: { WELCOME: "ᱥᱟᱹᱜᱚᱛᱟᱢ" } },
  sd: { translation: { WELCOME: "ڀليڪار" } },
  ta: { translation: { WELCOME: "வரவேற்கிறோம்" } },
  te: { translation: { WELCOME: "స్వాగతం" } },
  ur: { translation: { WELCOME: "خوش آمدید" } },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    ...i18nConfig,
  });

export { appWithTranslation, useTranslation, i18n };
export { i18nConfig };