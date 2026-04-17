'use client'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Users, X, User } from 'lucide-react'
import { useApp } from './AppProvider'
import { toast } from 'sonner'

interface User {
  username: string
  name: string | null
  email: string | null
}

const labels = {
  zh: {
    title: '用户列表',
    subtitle: '系统中的所有用户',
    account: '账户名',
    displayName: '用户名',
    email: '邮箱',
    noEmail: '未填写',
    loading: '加载中...',
    loadFailed: '加载失败',
    refresh: '刷新',
  },
  en: {
    title: 'User List',
    subtitle: 'All users in the system',
    account: 'Account',
    displayName: 'Display Name',
    email: 'Email',
    noEmail: 'Not set',
    loading: 'Loading...',
    loadFailed: 'Failed to load',
    refresh: 'Refresh',
  },
}

interface UserListDialogProps {
  open: boolean
  onClose: () => void
}

export default function UserListDialog({ open, onClose }: UserListDialogProps) {
  const { lang } = useApp()
  const t = labels[lang] || labels.en
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchUsers()
    }
  }, [open])

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      } else {
        toast.error(t.loadFailed)
      }
    } catch {
      toast.error(t.loadFailed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md dark:bg-gray-800 [&>button]:hidden">
        <DialogHeader>
          <div className="flex items-center justify-between px-1 pb-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-200 dark:shadow-green-900/50">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {t.title}
                </DialogTitle>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{t.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {/* Header row */}
          <div className="grid grid-cols-3 gap-2 px-1 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400">
            <div>{t.account}</div>
            <div>{t.displayName}</div>
            <div>{t.email}</div>
          </div>

          {/* User list */}
          {loading ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-500 rounded-full mr-2" />
              {t.loading}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-400">{t.loadFailed}</div>
          ) : (
            users.map((user) => (
              <div
                key={user.username}
                className="grid grid-cols-3 gap-2 px-1 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors items-center"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center shrink-0">
                    <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                    {user.username}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {user.name || user.username}
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-500 truncate">
                  {user.email || t.noEmail}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-700">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            className="border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t.refresh}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
