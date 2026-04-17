'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Settings, Check } from 'lucide-react'
import { useApp } from './AppProvider'

const labels = {
  zh: {
    title: '设置',
    subtitle: '设置进度百分比精度',
    precision: '进度百分比精度',
    preview: '预览',
    progress: '进度',
    save: '保存',
    cancel: '取消',
    saveSuccess: '设置已保存',
  },
  en: {
    title: 'Settings',
    subtitle: 'Set progress precision',
    precision: 'Progress Precision',
    preview: 'Preview',
    progress: 'Progress',
    save: 'Save',
    cancel: 'Cancel',
    saveSuccess: 'Settings saved',
  },
}

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

export default function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { lang } = useApp()
  const t = labels[lang]
  const [precision, setPrecision] = useState('2')

  const options = [
    { value: '0', label: '0%' },
    { value: '1', label: '.0%' },
    { value: '2', label: '.00%' },
  ]

  function handleSave() {
    localStorage.setItem('progressPrecision', precision)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm dark:bg-gray-800">
        <DialogHeader>
          <div className="flex items-center gap-3 px-1 pb-3 border-b border-gray-100 dark:border-gray-700">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/50">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {t.title}
              </DialogTitle>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{t.subtitle}</p>
            </div>
          </div>
        </DialogHeader>
        <div className="py-5 space-y-5">
          {/* Precision setting */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t.precision}</label>
            <div className="flex gap-2">
              {options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPrecision(opt.value)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all flex items-center gap-1.5 ${
                    precision === opt.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-100'
                  }`}
                >
                  {precision === opt.value && <Check className="h-3.5 w-3.5" />}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{t.preview}</p>
            <p className="text-sm text-gray-700 dark:text-gray-200">
              {t.progress}: <span className="text-blue-600 dark:text-blue-400 font-medium">
                {precision === '0' ? '50%' : precision === '1' ? '50.0%' : '50.00%'}
              </span>
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} className="border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{t.cancel}</Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-200 dark:shadow-blue-900/50 font-medium">{t.save}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
