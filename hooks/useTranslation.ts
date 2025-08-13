// hooks/useTranslation.ts
import { useEffect, useState } from 'react';
import { changeLanguage, getAvailableLanguages, getCurrentLanguage, t } from '../services/i18n';

export const useTranslation = () => {
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

  // Force re-render when language changes
  const [, forceUpdate] = useState({});

  const handleLanguageChange = async (languageCode: string) => {
    await changeLanguage(languageCode);
    setCurrentLang(languageCode);
    forceUpdate({}); // Force re-render
  };

  useEffect(() => {
    setCurrentLang(getCurrentLanguage());
  }, []);

  return {
    t,
    currentLanguage: currentLang,
    changeLanguage: handleLanguageChange,
    availableLanguages: getAvailableLanguages(),
  };
};