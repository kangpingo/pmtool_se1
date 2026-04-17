'use client'
import { useState } from 'react'
import { Database, Trash2, Plus, AlertTriangle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useApp } from './AppProvider'

const labels = {
  zh: {
    title: '数据管理',
    subtitle: '初始化或清空项目任务数据',
    initData: '初始化数据',
    initHint: '选择要初始化的项目数量',
    clearData: '清空数据',
    clearHint: '清空所有项目和任务数据',
    clearConfirm: '确定要清空所有数据吗？此操作不可恢复！',
    selectOption: '请选择一个选项',
    overwrite: '覆盖',
    overwriteDesc: '清空现有数据后重新生成',
    append: '追加',
    appendDesc: '在现有数据基础上增加',
    initBtn: '开始初始化',
    clearBtn: '清空所有数据',
    initSuccess: '数据初始化成功！生成了 {count} 个项目',
    clearSuccess: '数据已清空',
    initFailed: '初始化失败',
    clearFailed: '清空失败',
    projects: '个项目',
  },
  en: {
    title: 'Data Management',
    subtitle: 'Initialize or clear project & task data',
    initData: 'Initialize Data',
    initHint: 'Select number of projects to generate',
    clearData: 'Clear Data',
    clearHint: 'Clear all project and task data',
    clearConfirm: 'Are you sure you want to clear all data? This cannot be undone!',
    selectOption: 'Please select an option',
    overwrite: 'Overwrite',
    overwriteDesc: 'Clear existing data and regenerate',
    append: 'Append',
    appendDesc: 'Add to existing data',
    initBtn: 'Start Initialize',
    clearBtn: 'Clear All Data',
    initSuccess: 'Data initialized! Generated {count} projects',
    clearSuccess: 'Data cleared successfully',
    initFailed: 'Initialization failed',
    clearFailed: 'Clear failed',
    projects: 'projects',
  },
}

const projectCounts = [
  { value: 5, labelZh: '5个项目', labelEn: '5 Projects' },
  { value: 10, labelZh: '10个项目', labelEn: '10 Projects' },
  { value: 20, labelZh: '20个项目', labelEn: '20 Projects' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function DataManagementDialog({ open, onClose }: Props) {
  const { lang } = useApp()
  const t = labels[lang]
  const [loading, setLoading] = useState(false)
  const [selectedCount, setSelectedCount] = useState<number | null>(null)
  const [mode, setMode] = useState<'overwrite' | 'append' | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  async function handleInit() {
    if (!selectedCount || !mode) {
      toast.error(t.selectOption)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/init-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: selectedCount, mode }),
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

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-200">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{t.title}</h2>
              <p className="text-xs text-gray-400">{t.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Initialize Data Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-purple-500" />
              <h3 className="font-semibold text-gray-900">{t.initData}</h3>
            </div>
            <p className="text-xs text-gray-500">{t.initHint}</p>

            {/* Project count selection */}
            <div className="flex gap-2">
              {projectCounts.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedCount(opt.value)}
                  className={`flex-1 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    selectedCount === opt.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {lang === 'zh' ? opt.labelZh : opt.labelEn}
                </button>
              ))}
            </div>

            {/* Mode selection */}
            {selectedCount && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setMode('overwrite')}
                  className={`flex-1 px-3 py-3 rounded-lg border text-sm text-left transition-all ${
                    mode === 'overwrite'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`font-medium ${mode === 'overwrite' ? 'text-red-700' : 'text-gray-700'}`}>
                    {t.overwrite}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{t.overwriteDesc}</div>
                </button>
                <button
                  onClick={() => setMode('append')}
                  className={`flex-1 px-3 py-3 rounded-lg border text-sm text-left transition-all ${
                    mode === 'append'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`font-medium ${mode === 'append' ? 'text-green-700' : 'text-gray-700'}`}>
                    {t.append}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{t.appendDesc}</div>
                </button>
              </div>
            )}

            <Button
              onClick={handleInit}
              disabled={loading || !selectedCount || !mode}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            >
              {loading ? '...' : t.initBtn}
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Clear Data Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500" />
              <h3 className="font-semibold text-gray-900">{t.clearData}</h3>
            </div>
            <p className="text-xs text-gray-500">{t.clearHint}</p>

            {!showClearConfirm ? (
              <Button
                onClick={() => setShowClearConfirm(true)}
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t.clearBtn}
              </Button>
            ) : (
              <div className="border border-red-200 rounded-lg p-4 bg-red-50 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium">{t.clearConfirm}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowClearConfirm(false)}
                    variant="outline"
                    className="flex-1 border-gray-200"
                  >
                    {lang === 'zh' ? '取消' : 'Cancel'}
                  </Button>
                  <Button
                    onClick={handleClear}
                    disabled={loading}
                    className="flex-1 bg-red-500 hover:bg-red-600"
                  >
                    {lang === 'zh' ? '确认清空' : 'Confirm Clear'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
