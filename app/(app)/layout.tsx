import type { Metadata, Viewport } from 'next'
import '../globals.css'
import { Toaster } from 'sonner'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
export const metadata: Metadata = {
  title: '东方渡项目管理平台',
  description: 'StoryEAST Project Management System',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#e8edf4] dark:bg-gray-900 transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(99, 102, 241, 0.95))',
            border: 'none',
            color: '#fff',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
          },
          className: 'toast-immersion',
        }}
        className="toaster-immersion"
        theme="light"
      />
    </div>
  )
}
