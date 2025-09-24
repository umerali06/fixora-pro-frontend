import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import enTranslation from "./i18n/locales/en.json";
import deTranslation from "./i18n/locales/de.json";

// Supported languages configuration
export const supportedLanguages = {
  en: { name: "English", nativeName: "English", flag: "🇺🇸" },
  de: { name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  es: { name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  fr: { name: "French", nativeName: "Français", flag: "🇫🇷" },
  it: { name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  pt: { name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  ru: { name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  zh: { name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  ja: { name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  ko: { name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  ar: { name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  hi: { name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" }
};

const resources = {
  en: {
    translation: enTranslation,
  },
  de: {
    translation: deTranslation,
  },
  // Add placeholder resources for other languages
  es: {
    translation: enTranslation, // Use English as fallback for now
  },
  fr: {
    translation: enTranslation,
  },
  it: {
    translation: enTranslation,
  },
  pt: {
    translation: enTranslation,
  },
  ru: {
    translation: enTranslation,
  },
  zh: {
    translation: enTranslation,
  },
  ja: {
    translation: enTranslation,
  },
  ko: {
    translation: enTranslation,
  },
  ar: {
    translation: enTranslation,
  },
  hi: {
    translation: enTranslation,
  }
};

// Get saved language from localStorage or default to English
const getInitialLanguage = (): string => {
  try {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage && Object.keys(supportedLanguages).includes(savedLanguage)) {
      return savedLanguage;
    }
  } catch (error) {
    console.warn("Could not access localStorage:", error);
  }
  return "en";
};

const initialLanguage = getInitialLanguage();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable Suspense for better compatibility
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "language",
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
      convertDetectedLanguage: (lng: string) => {
        // Map browser languages to supported languages
        const languageMap: { [key: string]: string } = {
          'de': 'de',
          'de-DE': 'de',
          'de-AT': 'de',
          'de-CH': 'de',
          'es': 'es',
          'es-ES': 'es',
          'es-MX': 'es',
          'fr': 'fr',
          'fr-FR': 'fr',
          'fr-CA': 'fr',
          'it': 'it',
          'it-IT': 'it',
          'pt': 'pt',
          'pt-BR': 'pt',
          'pt-PT': 'pt',
          'ru': 'ru',
          'ru-RU': 'ru',
          'zh': 'zh',
          'zh-CN': 'zh',
          'zh-TW': 'zh',
          'ja': 'ja',
          'ja-JP': 'ja',
          'ko': 'ko',
          'ko-KR': 'ko',
          'ar': 'ar',
          'ar-SA': 'ar',
          'ar-EG': 'ar',
          'hi': 'hi',
          'hi-IN': 'hi'
        };
        
        // Check for exact match first
        if (languageMap[lng]) {
          return languageMap[lng];
        }
        
        // Check for language code match
        const langCode = lng.split('-')[0];
        if (languageMap[langCode]) {
          return languageMap[langCode];
        }
        
        // Default to English
        return "en";
      },
    },
  });

// Listen for language changes and save to localStorage
i18n.on("languageChanged", (lng: string) => {
  try {
    localStorage.setItem("language", lng);
    // Also update the HTML lang attribute for accessibility
    document.documentElement.lang = lng;
    
    // Update document direction for RTL languages
    if (['ar', 'he', 'fa'].includes(lng)) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  } catch (error) {
    console.warn("Could not save language to localStorage:", error);
  }
});

// Set initial HTML lang attribute and direction
document.documentElement.lang = initialLanguage;
if (['ar', 'he', 'fa'].includes(initialLanguage)) {
  document.documentElement.dir = 'rtl';
} else {
  document.documentElement.dir = 'ltr';
}

export default i18n;
