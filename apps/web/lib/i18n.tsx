"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'te' | 'es';

interface Translations {
  [key: string]: {
    [K in Language]: string;
  };
}

export const translations: Translations = {
  // Navigation
  travel: { en: 'Travel', hi: 'यात्रा', te: 'ప్రయాణం', es: 'Viajar' },
  check: { en: 'Check', hi: 'जांच', te: 'తనిఖీ', es: 'Revisar' },
  ship: { en: 'Ship', hi: 'शिपिंग', te: 'షిప్పింగ్', es: 'Enviar' },
  admin: { en: 'Admin', hi: 'प्रशासन', te: 'అడ్మిన్', es: 'Admin' },
  signin: { en: 'Sign in', hi: 'साइन इन', te: 'సైన్ ఇన్', es: 'Ingresar' },
  
  // Passenger Dashboard
  passenger_workspace: { en: 'Passenger workspace', hi: 'यात्री कार्यस्थान', te: 'ప్రయాణీకుల వర్క్‌స్పేస్', es: 'Espacio de pasajeros' },
  travel_hero_title: { en: 'Travel with connected buses.', hi: 'कनेक्टेड बसों के साथ यात्रा करें।', te: 'కనెక్ట్ చేయబడిన బస్సులతో ప్రయాణించండి.', es: 'Viaja con autobuses conectados.' },
  search_buses: { en: 'Search buses', hi: 'बसें खोजें', te: 'బస్సుల కోసం వెతకండి', es: 'Buscar autobuses' },
  active_ticket: { en: 'Active ticket', hi: 'सक्रिय टिकट', te: 'యాక్టివ్ టికెట్', es: 'Ticket activo' },
  
  // Logistics
  logistics_workspace: { en: 'Logistics workspace', hi: 'रसद कार्यस्थान', te: 'లాజిస్టిక్స్ వర్క్‌స్పేస్', es: 'Espacio de logística' },
  ship_hero_title: { en: 'Ship small parcels.', hi: 'छोटे पार्सल भेजें।', te: 'చిన్న పార్సెల్స్ పంపండి.', es: 'Envía paquetes pequeños.' },
  book_shipment: { en: 'Book shipment', hi: 'शिपमेंट बुक करें', te: 'షిప్‌మెంట్ బుక్ చేయండి', es: 'Reservar envío' },
  
  // Common
  loading: { en: 'Loading...', hi: 'लोड हो रहा है...', te: 'లోడ్ అవుతోంది...', es: 'Cargando...' },
  stats: { en: 'Stats', hi: 'आंकड़े', te: 'గణాంకాలు', es: 'Estadísticas' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('via-lang') as Language;
    if (savedLang && ['en', 'hi', 'te', 'es'].includes(savedLang)) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('via-lang', lang);
  };

  const t = (key: string) => {
    if (!translations[key]) return key;
    return translations[key][language] || translations[key]['en'];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
