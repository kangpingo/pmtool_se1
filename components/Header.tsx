'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, LogOut, Settings, FileText, MessageSquare, X, Database, Heart, Search, Folder, Sun, Moon, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useApp } from './AppProvider'
import UserProfileDialog from './UserProfileDialog'
import SettingsDialog from './SettingsDialog'
import LogViewer from './LogViewer'
import UserListDialog from './UserListDialog'
import MessageBoardDialog from './MessageBoardDialog'
import DeclarationDialog from './DeclarationDialog'
import DataManagementDialog from './DataManagementDialog'

const labels = {
  zh: {
    logout: '退出登录',
    settings: '设置',
    viewLogs: '查看日志',
    userList: '用户列表',
    setProgress: '进度百分比',
    dataManagement: '数据管理',
    logs: '日志',
    messageBoard: '留言板',
  },
  en: {
    logout: 'Logout',
    settings: 'Settings',
    viewLogs: 'View Logs',
    userList: 'User List',
    setProgress: 'Progress %',
    dataManagement: 'Data Management',
    logs: 'Logs',
    messageBoard: 'Message Board',
  },
}

export default function Header() {
  const router = useRouter()
  const { lang, setLang, theme, toggleTheme } = useApp()
  const t = labels[lang]
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [showMessageBoard, setShowMessageBoard] = useState(false)
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)
  const [showDataManagement, setShowDataManagement] = useState(false)
  const [showDeclaration, setShowDeclaration] = useState(false)
  const [showUserList, setShowUserList] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; fullName: string | null }[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [displayName, setDisplayName] = useState('User')
  const searchRef = useRef<HTMLDivElement>(null)

  // Load username from cookies
  useEffect(() => {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === 'displayName') {
        setDisplayName(decodeURIComponent(value))
        return
      }
      if (name === 'username') {
        setDisplayName(decodeURIComponent(value))
      }
    }
  }, [])

  useEffect(() => {
    if (searchQuery.length < 1) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        const data = await res.json()
        setSearchResults(data)
      } catch {
        setSearchResults([])
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch {
      toast.error('Logout failed')
    }
  }

  return (
    <header className="relative z-50 h-14 border-b border-gray-200/50 dark:border-gray-700 bg-white/80 dark:bg-gray-800 backdrop-blur-md flex items-center px-4 transition-colors duration-300">
      {/* Left placeholder for mobile menu button spacing */}
      <div className="w-12 shrink-0 md:w-20" />

      {/* Search - centered */}
      <div className="flex-1 flex justify-center" ref={searchRef}>
        <div className="relative">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-600 shadow-sm focus-within:shadow-md focus-within:border-blue-400 transition-all w-64 md:w-80">
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSearch(true) }}
              onFocus={() => setShowSearch(true)}
              placeholder={lang === 'zh' ? '搜索项目...' : 'Search...'}
              className="flex-1 text-sm bg-transparent outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 shrink-0"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchResults([]) }} className="text-gray-400 hover:text-gray-600 shrink-0">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {showSearch && searchResults.length > 0 && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-[80] bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 w-64 md:w-80 overflow-hidden">
              {searchResults.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => { router.push(`/projects/${p.id}`); setShowSearch(false); setSearchQuery('') }}
                  className="w-full px-3 py-2.5 text-left text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center shrink-0">
                    <Folder className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-gray-800 dark:text-gray-200 font-medium truncate">{p.name}</span>
                    {p.fullName && <span className="text-gray-400 text-xs truncate">{p.fullName}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side buttons */}
      <div className="flex items-center gap-0 shrink-0">
        {/* Theme toggle - mobile friendly */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={toggleTheme}
        >
          <span title={theme === 'dark' ? (lang === 'zh' ? '浅色模式' : 'Light Mode') : (lang === 'zh' ? '深色模式' : 'Dark Mode')}>
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </span>
        </Button>

        {/* Declaration button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20"
          onClick={() => setShowDeclaration(true)}
        >
          <span title={lang === 'zh' ? '声明' : 'About'}>
            <Heart className="h-4 w-4" />
          </span>
        </Button>

        {/* Message Board button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
          onClick={() => setShowMessageBoard(true)}
        >
          <span title={t.messageBoard}>
            <MessageSquare className="h-4 w-4" />
          </span>
        </Button>

        {/* Settings dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
            onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
          >
            <span title={t.settings}>
              <Settings className="h-4 w-4" />
            </span>
          </Button>
          {showSettingsDropdown && (
            <>
              <div className="fixed inset-0 z-[60]" onClick={() => setShowSettingsDropdown(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-[100] min-w-[192px]">
                <button
                  onClick={() => { setShowSettings(true); setShowSettingsDropdown(false) }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                >
                  <Settings className="h-4 w-4" />
                  {t.setProgress}
                </button>
                <button
                  onClick={() => { setShowDataManagement(true); setShowSettingsDropdown(false) }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                >
                  <Database className="h-4 w-4" />
                  {t.dataManagement}
                </button>
                <button
                  onClick={() => { setShowUserList(true); setShowSettingsDropdown(false) }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                >
                  <Users className="h-4 w-4" />
                  {t.userList}
                </button>
                <button
                  onClick={() => { setShowLogs(true); setShowSettingsDropdown(false) }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                >
                  <FileText className="h-4 w-4" />
                  {t.viewLogs}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Language toggle */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 md:px-3"
            onClick={() => setShowLangMenu(!showLangMenu)}
          >
            <Globe className="h-4 w-4" />
            <span className="text-xs hidden md:inline">{lang === 'zh' ? '中文' : 'EN'}</span>
          </Button>
          {showLangMenu && (
            <>
              <div className="fixed inset-0 z-[60]" onClick={() => setShowLangMenu(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-[100] min-w-[100px]">
                <button
                  onClick={() => { setLang('zh'); setShowLangMenu(false); router.refresh() }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 ${lang === 'zh' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}
                >
                  <span>🇨🇳</span> 中文
                </button>
                <button
                  onClick={() => { setLang('en'); setShowLangMenu(false); router.refresh() }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 ${lang === 'en' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}
                >
                  <span>🇺🇸</span> English
                </button>
              </div>
            </>
          )}
        </div>

        {/* User info */}
        <div className="flex items-center gap-0 pl-0.5 border-l border-gray-200 dark:border-gray-600">
          <button onClick={() => setShowUserProfile(true)} className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg px-2 py-1 transition-colors group">
            <img src="/avatar.svg" alt="Avatar" className="w-6 h-6 rounded-full" />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 hidden md:inline">{displayName}</span>
          </button>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-gray-400 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400" onClick={handleLogout}>
            <span title={t.logout}>
              <LogOut className="h-4 w-4" />
            </span>
          </Button>
        </div>
      </div>

      {showUserProfile && <UserProfileDialog onClose={() => setShowUserProfile(false)} />}
      {showSettings && <SettingsDialog open={showSettings} onClose={() => setShowSettings(false)} />}
      {showLogs && <LogViewer open={showLogs} onClose={() => setShowLogs(false)} />}
      {showMessageBoard && <MessageBoardDialog open={showMessageBoard} onClose={() => setShowMessageBoard(false)} />}
      {showDeclaration && <DeclarationDialog open={showDeclaration} onClose={() => setShowDeclaration(false)} />}
      {showDataManagement && <DataManagementDialog open={showDataManagement} onClose={() => setShowDataManagement(false)} />}
      {showUserList && <UserListDialog open={showUserList} onClose={() => setShowUserList(false)} />}
    </header>
  )
}
