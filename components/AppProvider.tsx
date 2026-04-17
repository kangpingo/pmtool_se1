'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Language } from '@/lib/i18n'

type Theme = 'light' | 'dark'

interface AppContextType {
  lang: Language
  setLang: (lang: Language) => void
  theme: Theme
  toggleTheme: () => void
}

const AppContext = createContext<AppContextType>({
  lang: 'en',
  setLang: () => {},
  theme: 'light',
  toggleTheme: () => {},
})

export function useApp() {
  return useContext(AppContext)
}

export function AppProvider({ children, initialLang }: { children: ReactNode; initialLang: Language }) {
  const [lang, setLangState] = useState<Language>(initialLang || 'en')
  const [theme, setThemeState] = useState<Theme>('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      setThemeState(savedTheme)
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark')
      }
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        setThemeState('dark')
        document.documentElement.classList.add('dark')
      }
    }
  }, [])

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    document.cookie = `lang=${newLang};path=/;max-age=${60 * 60 * 24 * 365}`
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <AppContext.Provider value={{ lang, setLang, theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  )
}
