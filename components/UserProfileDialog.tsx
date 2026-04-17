'use client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useApp } from './AppProvider'
import { User, X } from 'lucide-react'

const avatarOptions = [
  '/avatar.svg',
  '/avatar2.svg',
  '/avatar3.svg',
]

const labels = {
  zh: {
    title: '用户信息',
    accountLabel: '账号',
    accountHint: '账号不可修改',
    nameLabel: '用户名',
    nameHint: '显示在页面顶部的名称',
    emailLabel: '邮箱',
    emailHint: '方便联系时使用（选填）',
    save: '保存',
    cancel: '取消',
    saveSuccess: '保存成功',
  },
  en: {
    title: 'User Profile',
    accountLabel: 'Account',
    accountHint: 'Account cannot be changed',
    nameLabel: 'Display Name',
    nameHint: 'Shown at the top of the page',
    emailLabel: 'Email',
    emailHint: 'For contact purposes (optional)',
    save: 'Save',
    cancel: 'Cancel',
    saveSuccess: 'Saved successfully',
  },
}

interface UserProfileDialogProps {
  onClose: () => void
}

export default function UserProfileDialog({ onClose }: UserProfileDialogProps) {
  const { lang } = useApp()
  const t = labels[lang] || labels.zh
  const [accountName, setAccountName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0])
  const [loading, setLoading] = useState(false)

  // Load settings from cookies and localStorage on mount
  useEffect(() => {
    // Load account name from cookie (username = account name)
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === 'username') {
        const decodedValue = decodeURIComponent(value)
        setAccountName(decodedValue)
        // Default displayName to account name if no saved name
        const savedDisplayName = localStorage.getItem('userDisplayName')
        setDisplayName(savedDisplayName || decodedValue)
        break
      }
    }

    // Load other settings from localStorage
    const savedAvatar = localStorage.getItem('userAvatar')
    const savedEmail = localStorage.getItem('userEmail')
    if (savedAvatar) setSelectedAvatar(savedAvatar)
    if (savedEmail) setEmail(savedEmail)
  }, [])

  async function handleSave() {
    setLoading(true)
    try {
      // Save to localStorage
      localStorage.setItem('userAvatar', selectedAvatar)
      localStorage.setItem('userDisplayName', displayName)
      localStorage.setItem('userEmail', email)

      // Also save displayName to cookie so Header can read it
      document.cookie = `displayName=${encodeURIComponent(displayName)}; path=/; max-age=${60 * 60 * 24 * 365}`

      toast.success(t.saveSuccess)
      setTimeout(() => window.location.reload(), 500)
    } catch {
      toast.error('Save failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md overflow-hidden rounded-2xl p-0 [&>button]:hidden dark:bg-gray-800">
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-6 pb-16 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur flex items-center justify-center text-white/80 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-white/20 backdrop-blur rounded-xl">
              <User className="h-4 w-4 text-white" />
            </div>
            <DialogTitle className="text-base font-bold text-white">
              {t.title}
            </DialogTitle>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-[80px] h-[80px] rounded-full bg-white border-4 border-white/30 shadow-xl overflow-hidden">
              {selectedAvatar ? (
                <img src={selectedAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <User className="h-10 w-10 text-blue-400" />
                </div>
              )}
            </div>
            <div className="text-white">
              <div className="text-xl font-bold drop-shadow-sm">
                {displayName || accountName}
              </div>
              <div className="text-sm text-white/80">@{accountName}</div>
            </div>
          </div>
        </div>

        <div className="p-6 -mt-10 space-y-4 bg-white dark:bg-gray-800 rounded-t-3xl">
          {/* Account (read-only) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t.accountLabel}
            </Label>
            <Input
              value={accountName}
              disabled
              className="h-10 text-sm border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">{t.accountHint}</p>
          </div>

          {/* Display Name (editable) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t.nameLabel} <span className="text-red-500">*</span>
            </Label>
            <Input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder={lang === 'zh' ? '输入用户名' : 'Enter display name'}
              className="h-10 text-sm border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100 rounded-xl text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">{t.nameHint}</p>
          </div>

          {/* Email (editable) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t.emailLabel}
            </Label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={lang === 'zh' ? '输入邮箱' : 'Enter email'}
              className="h-10 text-sm border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100 rounded-xl text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">{t.emailHint}</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="h-10 px-6 text-sm border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl">{t.cancel}</Button>
            <Button onClick={handleSave} disabled={loading} className="h-10 px-6 text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 font-medium shadow-lg shadow-blue-200 dark:shadow-blue-900/50 rounded-xl">
              {loading ? '...' : t.save}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
