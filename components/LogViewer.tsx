'use client'
import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { FileText, LogIn, AlertCircle, Info, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'
import { useApp } from './AppProvider'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

interface LogEntry {
  id: string
  level?: string
  module?: string
  action?: string
  message: string
  details?: string
  userId?: string
  userName?: string
  ip?: string
  username?: string
  status?: string
  userAgent?: string
  createdAt: string
}

const labels = {
  zh: {
    title: '日志中心',
    systemLog: '功能操作日志',
    loginLog: '登录日志',
    noLogs: '暂无日志',
    level: '级别',
    module: '模块',
    action: '操作',
    message: '描述',
    user: '用户',
    ip: 'IP',
    time: '时间',
    status: '状态',
    prev: '上一页',
    next: '下一页',
    page: '第 {page} 页',
    total: '共 {total} 条',
    SUCCESS: '成功',
    FAILED: '失败',
    INFO: '信息',
    WARNING: '警告',
    ERROR: '错误',
    featureOpLog: '功能操作',
    loginOpLog: '登录操作',
  },
  en: {
    title: 'Log Center',
    systemLog: 'Feature Operation Log',
    loginLog: 'Login Log',
    noLogs: 'No logs',
    level: 'Level',
    module: 'Module',
    action: 'Action',
    message: 'Message',
    user: 'User',
    ip: 'IP',
    time: 'Time',
    status: 'Status',
    prev: 'Previous',
    next: 'Next',
    page: 'Page {page}',
    total: '{total} items',
    SUCCESS: 'Success',
    FAILED: 'Failed',
    INFO: 'Info',
    WARNING: 'Warning',
    ERROR: 'Error',
    featureOpLog: 'Feature',
    loginOpLog: 'Login',
  },
}

const levelConfig: Record<string, { icon: typeof Info, color: string, bg: string, darkColor: string, darkBg: string, labelKey: string }> = {
  INFO: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100', darkColor: 'dark:text-blue-400', darkBg: 'dark:bg-blue-900/40', labelKey: 'INFO' },
  WARNING: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100', darkColor: 'dark:text-amber-400', darkBg: 'dark:bg-amber-900/40', labelKey: 'WARNING' },
  ERROR: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', darkColor: 'dark:text-red-400', darkBg: 'dark:bg-red-900/40', labelKey: 'ERROR' },
  SUCCESS: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', darkColor: 'dark:text-green-400', darkBg: 'dark:bg-green-900/40', labelKey: 'SUCCESS' },
  FAILED: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', darkColor: 'dark:text-red-400', darkBg: 'dark:bg-red-900/40', labelKey: 'FAILED' },
}

// Action translation: maps action keys to {zh, en} labels
const actionLabels: Record<string, { zh: string; en: string }> = {
  复制: { zh: '复制', en: 'Copy' },
  创建: { zh: '创建', en: 'Create' },
  更新: { zh: '更新', en: 'Update' },
  删除: { zh: '删除', en: 'Delete' },
  移动: { zh: '移动', en: 'Move' },
  复制任务: { zh: '复制任务', en: 'Copy Task' },
  创建任务: { zh: '创建任务', en: 'Create Task' },
  更新任务: { zh: '更新任务', en: 'Update Task' },
  删除任务: { zh: '删除任务', en: 'Delete Task' },
  完成任务: { zh: '完成任务', en: 'Complete Task' },
  创建项目: { zh: '创建项目', en: 'Create Project' },
  更新项目: { zh: '更新项目', en: 'Update Project' },
  删除项目: { zh: '删除项目', en: 'Delete Project' },
  CREATE: { zh: '创建', en: 'Create' },
  UPDATE: { zh: '更新', en: 'Update' },
  DELETE: { zh: '删除', en: 'Delete' },
  MOVE: { zh: '移动', en: 'Move' },
  COPY: { zh: '复制', en: 'Copy' },
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function LogViewer({ open, onClose }: Props) {
  const { lang } = useApp()
  const t = labels[lang]
  const [logType, setLogType] = useState<'system' | 'login'>('system')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 12

  const fetchLogs = useCallback(async (type: 'system' | 'login', p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/logs?type=${type}&page=${p}&limit=${limit}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setLogs(data.logs || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
      setLogs([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      fetchLogs(logType, 1)
      setPage(1)
    }
  }, [open, logType, fetchLogs])

  function handleTabChange(type: 'system' | 'login') {
    if (logType === type) return
    setLogType(type)
    setPage(1)
  }

  function handlePageChange(newPage: number) {
    setPage(newPage)
    fetchLogs(logType, newPage)
  }

  const totalPages = Math.ceil(total / limit)

  function getLevelInfo(level: string) {
    const config = levelConfig[level] || levelConfig.INFO
    const label = t[config.labelKey as keyof typeof t] || level
    return { ...config, label }
  }

  function getActionLabel(action: string, lang: 'zh' | 'en') {
    const translation = actionLabels[action]
    if (translation) {
      return translation[lang]
    }
    // If no translation found, try to find by value match
    for (const [key, value] of Object.entries(actionLabels)) {
      if (value.zh === action || value.en === action) {
        return value[lang]
      }
    }
    return action
  }

  function renderLogCard(log: LogEntry) {
    const level = logType === 'login' ? (log.status || 'INFO') : (log.level || 'INFO')
    const levelInfo = getLevelInfo(level)
    const LevelIcon = levelInfo.icon

    return (
      <div key={log.id} className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all border border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded ${levelInfo.bg} ${levelInfo.color}`}>
            <LevelIcon className="h-3 w-3" />
            {levelInfo.label}
          </span>

          {log.module && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded">
              <LayoutGrid className="h-3 w-3" />
              {log.module}
            </span>
          )}

          {log.action && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 px-1.5 py-0.5">
              {getActionLabel(log.action, lang)}
            </span>
          )}

          <span className="ml-auto inline-flex items-center text-xs text-gray-400 dark:text-gray-500">
            {format(new Date(log.createdAt), 'MM-dd HH:mm:ss')}
          </span>
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-200 mt-1 leading-snug">{log.message}</p>

        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-gray-500">
          {log.userName && (
            <span className="font-medium text-gray-500 dark:text-gray-400">{log.userName}</span>
          )}
          {log.username && (
            <span className="font-medium text-gray-500 dark:text-gray-400">{log.username}</span>
          )}
          {log.ip && <span>IP: {log.ip}</span>}
          {log.details && (
            <span className="truncate max-w-[200px]">{log.details}</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[760px] h-[580px] max-w-[760px] max-h-[580px] flex flex-col dark:bg-gray-800 overflow-hidden p-0">
        <DialogHeader className="px-5 pt-5 pb-0 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {t.title}
            </DialogTitle>
          </div>

          <div className="flex gap-1 mt-4 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl w-fit">
            <button
              onClick={() => handleTabChange('system')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                logType === 'system'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {t.featureOpLog}
            </button>
            <button
              onClick={() => handleTabChange('login')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                logType === 'login'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {t.loginOpLog}
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700/30 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <FileText className="h-14 w-14 mb-3 opacity-30 dark:opacity-20" />
              <p className="text-base">{t.noLogs}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map(renderLogCard)}
            </div>
          )}
        </div>

        <div className="shrink-0 px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {t.total.replace('{total}', String(total))} · {t.page.replace('{page}', String(page))} / {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[60px] text-center">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
