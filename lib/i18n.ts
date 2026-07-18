import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import ru from './ru.json';
import uk from './uk.json';

const resources = {
  en: { translation: en },
  ru: { translation: ru },
  uk: { translation: uk }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", 
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

// Load saved language from electron-store on startup
if (typeof window !== 'undefined' && (window as any).electronAPI?.getLanguage) {
  (window as any).electronAPI.getLanguage().then((lang: string) => {
    if (lang && lang !== 'en') {
      i18n.changeLanguage(lang);
    }
  });
}

export default i18n;
