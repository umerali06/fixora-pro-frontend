import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setLanguage } from '../store/slices/uiSlice';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => Promise<void>;
  isChanging: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector((state) => state.ui);
  const [isChanging, setIsChanging] = useState(false);

  const changeLanguage = async (newLanguage: string) => {
    if (newLanguage === language) return;
    
    setIsChanging(true);
    
    try {
      console.log('LanguageProvider: Changing language to:', newLanguage);
      
      // Update Redux store
      dispatch(setLanguage(newLanguage as 'en' | 'de'));
      
      // Update i18n
      await i18n.changeLanguage(newLanguage);
      
      // Force a small delay to ensure all components re-render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('LanguageProvider: Language changed successfully to:', newLanguage);
    } catch (error) {
      console.error('LanguageProvider: Error changing language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  // Sync Redux and i18n on mount and when language changes
  useEffect(() => {
    const syncLanguages = async () => {
      if (language !== i18n.language) {
        console.log('LanguageProvider: Syncing languages - Redux:', language, 'i18n:', i18n.language);
        await i18n.changeLanguage(language);
      }
    };
    
    syncLanguages();
  }, [language, i18n]);

  // Listen for i18n language changes and sync with Redux
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      if (lng !== language) {
        console.log('LanguageProvider: i18n language changed, updating Redux:', lng);
        dispatch(setLanguage(lng as 'en' | 'de'));
      }
    };

    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, language, dispatch]);

  const value: LanguageContextType = {
    currentLanguage: language,
    changeLanguage,
    isChanging,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};