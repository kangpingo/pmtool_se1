'use client'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'

type Language = 'zh' | 'en'
type Theme = 'dark' | 'light'

interface ThemeProviderProps {
  lang: Language
  theme: Theme
  children: React.ReactNode
}

export default function ThemeProvider({ lang, theme, children }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  if (!mounted) return null

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
