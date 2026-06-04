'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { translations, type Locale } from '@/lib/translations'

export type Translation = typeof translations[Locale]

type LanguageContextType = {
  locale: Locale
  t: Translation
  toggleLocale: () => void
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'fr',
  t: translations.fr as Translation,
  toggleLocale: () => {},
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('fr')

  useEffect(() => {
    const saved = localStorage.getItem('wybob-locale') as Locale | null
    if (saved === 'fr' || saved === 'en') setLocale(saved)
  }, [])

  const toggleLocale = () => {
    setLocale(prev => {
      const next: Locale = prev === 'fr' ? 'en' : 'fr'
      localStorage.setItem('wybob-locale', next)
      return next
    })
  }

  return (
    <LanguageContext.Provider value={{ locale, t: translations[locale], toggleLocale }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
