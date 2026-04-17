'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useApp } from './AppProvider'
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Overview', labelZh: '总览', icon: HomeIcon },
  { href: '/projects', label: 'Project', labelZh: '项目', icon: FolderIcon },
  { href: '/tasks', label: 'Task', labelZh: '任务', icon: ListIcon },
  { href: '/kanban', label: 'Kanban', labelZh: '看板', icon: KanbanIcon },
  { href: '/gantt', label: 'Gantt', labelZh: '甘特图', icon: GanttIcon },
]

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>
    </svg>
  )
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
    </svg>
  )
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>
    </svg>
  )
}

function KanbanIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18"/>
    </svg>
  )
}

function GanttIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18"/><path d="M3 12h14"/><path d="M3 18h10"/>
      <rect x="5" y="4" width="8" height="4" rx="1" fill="currentColor" stroke="none"/>
      <rect x="5" y="10" width="10" height="4" rx="1" fill="currentColor" stroke="none"/>
      <rect x="5" y="16" width="6" height="4" rx="1" fill="currentColor" stroke="none"/>
    </svg>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const { lang } = useApp()
  const [collapsed, setCollapsed] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleToggle = () => {
    setTransitioning(true)
    setCollapsed(!collapsed)
    setTimeout(() => setTransitioning(false), 300)
  }

  const handleNavClick = () => {
    setMobileOpen(false)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo区域 */}
      <div className="h-14 flex items-center border-b border-white/10 shrink-0 px-3">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="Logo" className="w-8 h-8 rounded-lg shrink-0" />
          <span
            className={cn(
              'text-white font-bold text-base tracking-tight transition-all duration-200 whitespace-nowrap',
              collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            )}
          >
            PM System
          </span>
        </div>
      </div>

      {/* 导航 */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, labelZh, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          const isHovered = hoveredItem === href

          return (
            <Link
              key={href}
              href={href}
              onClick={handleNavClick}
              onMouseEnter={() => setHoveredItem(href)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 relative overflow-hidden group'
              )}
              style={{
                backgroundColor: active ? '#3b82f6' : isHovered ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                color: active ? '#ffffff' : '#e2e8f0',
              }}
            >
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent transition-opacity duration-300',
                  isHovered && !active ? 'opacity-100' : 'opacity-0'
                )}
              />
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-500',
                  isHovered ? 'translate-x-full' : '-translate-x-full'
                )}
              />

              <Icon className="h-5 w-5 flex-shrink-0 relative z-10" />

              <span
                className={cn(
                  'transition-all duration-200 whitespace-nowrap relative z-10',
                  collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                )}
              >
                {lang === 'zh' ? labelZh : label}
              </span>

              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* 折叠按钮 */}
      <div className={cn('border-t border-white/10 px-2 py-3', collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100')} />

      {/* 折叠/展开按钮 */}
      <button
        onClick={handleToggle}
        className={cn(
          'absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-700 border-2 border-gray-600 rounded-full flex items-center justify-center',
          'hover:bg-blue-500 hover:border-blue-400 transition-all duration-200 hover:scale-110 z-20',
          'shadow-lg shadow-gray-900/50 hidden md:flex'
        )}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-gray-300" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-gray-300" />
        )}
      </button>

      {/* 底部信息 */}
      <div
        className={cn(
          'px-4 py-4 border-t border-white/10 transition-all duration-200',
          collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
      >
        <p className="text-gray-400 text-xs">v1.2 @2026 StoryEAST PMS</p>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 w-10 h-10 bg-gray-800 text-white rounded-lg flex items-center justify-center shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-shrink-0 flex-col h-full border-r shadow-lg transition-all duration-300 ease-in-out relative',
          'bg-gray-800 border-gray-700',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'md:hidden fixed inset-y-0 left-0 z-50 flex-shrink-0 flex-col h-full border-r shadow-xl transition-all duration-300 ease-in-out',
          'bg-gray-800 border-gray-700',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-14 border-b border-white/10 px-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="Logo" className="w-8 h-8 rounded-lg" />
            <span className="text-white font-bold text-base">PM System</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>
    </>
  )
}
