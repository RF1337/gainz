// i18n/index.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

// Import translations
import da from '../../locales/da.json';
import de from '../../locales/de.json';
import en from '../../locales/en.json';
import es from '../../locales/es.json';
import fr from '../../locales/fr.json';

// Create i18n instance
const i18n = new I18n({
  da,
  de,
  en,
  es,
  fr,
});

// Configuration
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Language storage key
const LANGUAGE_STORAGE_KEY = '@fitness_app_language';

// Set initial locale
const initializeLocale = async () => {
  try {
    // Try to get saved language preference
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    
    if (savedLanguage) {
      i18n.locale = savedLanguage;
    } else {
      // Use device locale if available
      const deviceLocales = getLocales();
      const deviceLanguage = deviceLocales[0]?.languageCode || 'en';
      
      // Check if we support the device language
      if (Object.keys(i18n.translations).includes(deviceLanguage)) {
        i18n.locale = deviceLanguage;
      } else {
        i18n.locale = 'en'; // fallback
      }
      
      // Save the initial language choice
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, i18n.locale);
    }
  } catch (error) {
    console.warn('Error initializing locale:', error);
    i18n.locale = 'en';
  }
};

// Change language function
export const changeLanguage = async (languageCode: string) => {
  try {
    i18n.locale = languageCode;
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
  } catch (error) {
    console.warn('Error saving language preference:', error);
  }
};

// Get current language
export const getCurrentLanguage = () => i18n.locale;

// Get available languages
export const getAvailableLanguages = () => [
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
];

// Translation function
export const t = (key: string, options?: any) => i18n.t(key, options);

// Initialize
initializeLocale();

export default i18n;