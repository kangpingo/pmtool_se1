'use client'
import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useApp } from './AppProvider'
import { User, Upload, Camera, X } from 'lucide-react'

const avatarOptions = [
  '/avatar.svg',
  '/avatar2.svg',
  '/avatar3.svg',
]

const labels = {
  zh: {
    title: '用户信息',
    accountLabel: '账号',
    nameLabel: '用户名',
    emailLabel: '邮箱',
    emailHint: '方便联系时使用（非必填）',
    sloganLabel: '口号',
    sloganPlaceholder: '输入你的口号...',
    save: '保存',
    cancel: '取消',
    saveSuccess: '保存成功',
    avatarLabel: '头像',
    uploadAvatar: '上传头像',
    dragHint: '拖放图片到此处上传',
    orBrowse: '或点击选择图片',
    removeImage: '移除',
    sloganRequired: '口号不能超过50个字符',
  },
  en: {
    title: 'User Profile',
    accountLabel: 'Account',
    nameLabel: 'Username',
    emailLabel: 'Email',
    emailHint: 'Used for contact (optional)',
    sloganLabel: 'Slogan',
    sloganPlaceholder: 'Enter your slogan...',
    save: 'Save',
    cancel: 'Cancel',
    saveSuccess: 'Saved successfully',
    avatarLabel: 'Avatar',
    uploadAvatar: 'Upload Avatar',
    dragHint: 'Drag & drop image here',
    orBrowse: 'or click to select',
    removeImage: 'Remove',
    sloganRequired: 'Slogan cannot exceed 50 characters',
  },
}

interface UserProfileDialogProps {
  onClose: () => void
}

export default function UserProfileDialog({ onClose }: UserProfileDialogProps) {
  const { lang } = useApp()
  const t = labels[lang]
  const [accountName] = useState('Administrator')
  const [userName, setUserName] = useState('Administrator')
  const [email, setEmail] = useState('')
  const [slogan, setSlogan] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0])
  const [customAvatarUrl, setCustomAvatarUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Load saved settings on mount
  useEffect(() => {
    const savedAvatar = localStorage.getItem('userAvatar')
    const savedSlogan = localStorage.getItem('userSlogan')
    const savedName = localStorage.getItem('userName')
    const savedEmail = localStorage.getItem('userEmail')
    if (savedAvatar) setSelectedAvatar(savedAvatar)
    if (savedSlogan) setSlogan(savedSlogan)
    if (savedName) setUserName(savedName)
    if (savedEmail) setEmail(savedEmail)
  }, [])

  async function handleSave() {
    if (slogan.length > 50) {
      toast.error(t.sloganRequired)
      return
    }
    setLoading(true)
    try {
      // Save to localStorage
      localStorage.setItem('userAvatar', selectedAvatar)
      localStorage.setItem('userSlogan', slogan)
      localStorage.setItem('userName', userName)
      localStorage.setItem('userEmail', email)
      toast.success(t.saveSuccess)
      setTimeout(() => window.location.reload(), 500)
    } catch {
      toast.error('Save failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setCustomAvatarUrl(result)
        setSelectedAvatar(result)
      }
      reader.onerror = () => toast.error('Failed to read image')
      reader.readAsDataURL(file)
    } else {
      toast.error(lang === 'zh' ? '请上传图片文件' : 'Please upload an image file')
    }
  }, [lang])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setCustomAvatarUrl(result)
        setSelectedAvatar(result)
      }
      reader.onerror = () => toast.error('Failed to read image')
      reader.readAsDataURL(file)
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
            <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-input')?.click()}>
              <div className="w-[80px] h-[80px] rounded-full bg-white border-4 border-white/30 shadow-xl overflow-hidden">
                {selectedAvatar ? (
                  <img src={selectedAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User className="h-10 w-10 text-blue-400" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="h-7 w-7 text-white" />
              </div>
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
            <div className="text-white">
              <div className="text-xl font-bold drop-shadow-sm">
                {userName || accountName}
              </div>
              <div className="text-sm text-white/80">{accountName}</div>
            </div>
          </div>
        </div>
        <div className="p-6 -mt-10 space-y-4 bg-white dark:bg-gray-800 rounded-t-3xl">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t.nameLabel} <span className="text-red-500">*</span>
            </Label>
            <Input
              value={userName}
              onChange={e => setUserName(e.target.value)}
              placeholder={lang === 'zh' ? '输入用户名' : 'Enter username'}
              className="h-10 text-sm border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100 rounded-xl text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">{lang === 'zh' ? '联系邮箱' : 'Email'}</Label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={lang === 'zh' ? '输入邮箱' : 'Enter email'}
              className="h-10 text-sm border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100 rounded-xl text-gray-900 dark:text-gray-100"
            />
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
