import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import './globals.css'
import { Toaster } from 'sonner'
import { AppProvider } from '@/components/AppProvider'

export const metadata: Metadata = {
  title: 'PM System',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('lang')?.value as 'zh' | 'en') || 'zh'

  return (
    <html lang={lang}>
      <body>
        <AppProvider initialLang={lang}>
          {children}
        </AppProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
