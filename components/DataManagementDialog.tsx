'use client'
import { useState } from 'react'
import { Database, Trash2, AlertTriangle, Check, FileText, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useApp } from './AppProvider'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const labels = {
  zh: {
    title: '数据管理',
    subtitle: '初始化或清空项目任务演示数据',
    clearData: '清空全部数据',
    clearHint: '删除所有项目和任务数据',
    clearConfirmMsg: '确定要清空所有数据吗？此操作不可恢复！',
    addChineseData: '新增中文演示数据',
    addChineseHint: '生成中文演示项目（信息系统+工程建设）',
    addEnglishData: '新增英文演示数据',
    addEnglishHint: '生成英文演示项目（IT + Engineering）',
    selectCount: '选择项目数量',
    cancel: '取消',
    confirm: '确认',
    clearSuccess: '数据已清空',
    clearFailed: '清空失败',
    initSuccess: '数据初始化成功！生成了 {count} 个项目',
    initFailed: '初始化失败',
    projectCount: '{count} 个项目',
    tasksPerProject: '每个项目 5-100 条任务',
  },
  en: {
    title: 'Data Management',
    subtitle: 'Initialize or clear project & task demo data',
    clearData: 'Clear All Data',
    clearHint: 'Delete all project and task data',
    clearConfirmMsg: 'Are you sure you want to clear all data? This cannot be undone!',
    addChineseData: 'Add Chinese Demo Data',
    addChineseHint: 'Generate Chinese demo projects (IT + Engineering)',
    addEnglishData: 'Add English Demo Data',
    addEnglishHint: 'Generate English demo projects (IT + Engineering)',
    selectCount: 'Select project count',
    cancel: 'Cancel',
    confirm: 'Confirm',
    clearSuccess: 'Data cleared successfully',
    clearFailed: 'Clear failed',
    initSuccess: 'Data initialized! Generated {count} projects',
    initFailed: 'Initialization failed',
    projectCount: '{count} projects',
    tasksPerProject: '5-100 tasks per project',
  },
}

type InitOption = 'clear' | 'addChinese' | 'addEnglish' | null

interface Props {
  open: boolean
  onClose: () => void
}

const projectCounts = [5, 10, 20]

export default function DataManagementDialog({ open, onClose }: Props) {
  const { lang } = useApp()
  const t = labels[lang]
  const [loading, setLoading] = useState(false)
  const [selectedOption, setSelectedOption] = useState<InitOption>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [selectedCount, setSelectedCount] = useState<number>(10)

  async function handleSubmit() {
    if (!selectedOption) {
      return
    }

    if (selectedOption === 'clear') {
      setShowClearConfirm(true)
      return
    }

    // Add Chinese or English data with selected count
    setLoading(true)
    try {
      const res = await fetch('/api/admin/init-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang: selectedOption === 'addChinese' ? 'zh' : 'en',
          mode: 'append',
          count: selectedCount
        }),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success(t.initSuccess.replace('{count}', String(data.count)))
        onClose()
        setTimeout(() => window.location.reload(), 500)
      } else {
        toast.error(t.initFailed)
      }
    } catch {
      toast.error(t.initFailed)
    } finally {
      setLoading(false)
    }
  }

  async function handleClear() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/clear-data', { method: 'POST' })
      if (res.ok) {
        toast.success(t.clearSuccess)
        onClose()
        setTimeout(() => window.location.reload(), 500)
      } else {
        toast.error(t.clearFailed)
      }
    } catch {
      toast.error(t.clearFailed)
    } finally {
      setLoading(false)
    }
  }

  function handleOptionClick(option: InitOption) {
    setSelectedOption(option)
    setShowClearConfirm(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-200 dark:shadow-purple-900/50">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">{t.title}</DialogTitle>
              <p className="text-xs text-gray-400 dark:text-gray-500">{t.subtitle}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Option 1: Clear All Data */}
          <button
            onClick={() => handleOptionClick('clear')}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              selectedOption === 'clear'
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${selectedOption === 'clear' ? 'bg-red-100 dark:bg-red-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <Trash2 className={`h-5 w-5 ${selectedOption === 'clear' ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t.clearData}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.clearHint}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedOption === 'clear' ? 'border-red-500 bg-red-500' : 'border-gray-300 dark:border-gray-500'
              }`}>
                {selectedOption === 'clear' && <Check className="h-3 w-3 text-white" />}
              </div>
            </div>
          </button>

          {/* Clear Confirmation */}
          {selectedOption === 'clear' && (
            <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">{t.clearConfirmMsg}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowClearConfirm(false)}
                  variant="outline"
                  className="flex-1 border-gray-200 dark:border-gray-600"
                >
                  {t.cancel}
                </Button>
                <Button
                  onClick={handleClear}
                  disabled={loading}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  {loading ? '...' : t.confirm}
                </Button>
              </div>
            </div>
          )}

          {/* Option 2: Add Chinese Data */}
          <button
            onClick={() => handleOptionClick('addChinese')}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              selectedOption === 'addChinese'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${selectedOption === 'addChinese' ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <Languages className={`h-5 w-5 ${selectedOption === 'addChinese' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t.addChineseData}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.addChineseHint}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedOption === 'addChinese' ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-500'
              }`}>
                {selectedOption === 'addChinese' && <Check className="h-3 w-3 text-white" />}
              </div>
            </div>
          </button>

          {/* Chinese count selection */}
          {selectedOption === 'addChinese' && (
            <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20 space-y-3">
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">{t.selectCount}</p>
              <div className="flex gap-2">
                {projectCounts.map(count => (
                  <button
                    key={count}
                    onClick={() => setSelectedCount(count)}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      selectedCount === count
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-blue-200 dark:border-blue-700 hover:border-blue-400 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    {t.projectCount.replace('{count}', String(count))}
                  </button>
                ))}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">{t.tasksPerProject}</p>
            </div>
          )}

          {/* Option 3: Add English Data */}
          <button
            onClick={() => handleOptionClick('addEnglish')}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              selectedOption === 'addEnglish'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${selectedOption === 'addEnglish' ? 'bg-green-100 dark:bg-green-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <FileText className={`h-5 w-5 ${selectedOption === 'addEnglish' ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t.addEnglishData}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.addEnglishHint}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedOption === 'addEnglish' ? 'border-green-500 bg-green-500' : 'border-gray-300 dark:border-gray-500'
              }`}>
                {selectedOption === 'addEnglish' && <Check className="h-3 w-3 text-white" />}
              </div>
            </div>
          </button>

          {/* English count selection */}
          {selectedOption === 'addEnglish' && (
            <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/20 space-y-3">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">{t.selectCount}</p>
              <div className="flex gap-2">
                {projectCounts.map(count => (
                  <button
                    key={count}
                    onClick={() => setSelectedCount(count)}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      selectedCount === count
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-green-200 dark:border-green-700 hover:border-green-400 text-green-700 dark:text-green-300'
                    }`}
                  >
                    {t.projectCount.replace('{count}', String(count))}
                  </button>
                ))}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">{t.tasksPerProject}</p>
            </div>
          )}

          {/* Submit Button - show for add options when option is selected */}
          {selectedOption && selectedOption !== 'clear' && (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {loading ? '...' : t.confirm}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
