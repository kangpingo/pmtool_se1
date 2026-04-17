'use client'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { X, FileText, LogIn, AlertCircle, Info, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
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
    systemLog: '系统日志',
    loginLog: '登录日志',
    noLogs: '暂无日志',
    level: '级别',
    module: '模块',
    action: '操作',
    message: '消息',
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
  },
  en: {
    title: 'Log Center',
    systemLog: 'System Log',
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
  },
}

const levelConfig: Record<string, { icon: typeof Info, color: string, bg: string, darkColor: string, darkBg: string, label: string }> = {
  INFO: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100', darkColor: 'dark:text-blue-400', darkBg: 'dark:bg-blue-900/40', label: 'zh' },
  WARNING: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100', darkColor: 'dark:text-amber-400', darkBg: 'dark:bg-amber-900/40', label: 'zh' },
  ERROR: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', darkColor: 'dark:text-red-400', darkBg: 'dark:bg-red-900/40', label: 'zh' },
  SUCCESS: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', darkColor: 'dark:text-green-400', darkBg: 'dark:bg-green-900/40', label: 'zh' },
  FAILED: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', darkColor: 'dark:text-red-400', darkBg: 'dark:bg-red-900/40', label: 'zh' },
}

function getLevelConfig(level: string, t: typeof labels.zh) {
  const config = levelConfig[level] || levelConfig.INFO
  return {
    ...config,
    label: t[level as keyof typeof t] || level,
    color: `${config.color} ${config.darkColor}`,
    bg: `${config.bg} ${config.darkBg}`,
  }
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
  const limit = 15

  useEffect(() => {
    if (open) {
      setPage(1)
      fetchLogs(1)
    }
  }, [open])

  async function fetchLogs(p: number) {
    setLoading(true)
    try {
      const res = await fetch(`/api/logs?type=${logType}&page=${p}&limit=${limit}`)
      const data = await res.json()
      setLogs(data.logs || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  function handlePageChange(newPage: number) {
    setPage(newPage)
    fetchLogs(newPage)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col dark:bg-gray-800">
        <DialogHeader>
          <div className="flex items-center gap-3 px-1 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="p-2.5 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl shadow-lg shadow-slate-200 dark:shadow-slate-900/50">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {t.title}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Tab switch */}
        <div className="flex gap-2 py-3 border-b border-gray-100 dark:border-gray-700">
          <button
            onClick={() => {
              setPage(1)
              setLogType('system')
              setLoading(true)
              fetch(`/api/logs?type=system&page=1&limit=${limit}`)
                .then(res => res.json())
                .then(data => {
                  setLogs(data.logs || [])
                  setTotal(data.total || 0)
                })
                .catch(console.error)
                .finally(() => setLoading(false))
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              logType === 'system'
                ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            <FileText className="h-4 w-4" />
            {t.systemLog}
          </button>
          <button
            onClick={() => {
              setPage(1)
              setLogType('login')
              setLoading(true)
              fetch(`/api/logs?type=login&page=1&limit=${limit}`)
                .then(res => res.json())
                .then(data => {
                  setLogs(data.logs || [])
                  setTotal(data.total || 0)
                })
                .catch(console.error)
                .finally(() => setLoading(false))
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              logType === 'login'
                ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            <LogIn className="h-4 w-4" />
            {t.loginLog}
          </button>
        </div>

        {/* Log list */}
        <div className="flex-1 overflow-y-auto py-3 min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400 dark:text-gray-500">
              <div className="animate-spin mr-2">⏳</div>
              Loading...
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
              <FileText className="h-12 w-12 mb-3 opacity-30 dark:opacity-20" />
              <p>{t.noLogs}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map(log => {
                const level = logType === 'login' ? (log.status || 'INFO') : (log.level || 'INFO')
                const levelConfig = getLevelConfig(level, t)
                const LevelIcon = levelConfig.icon

                return (
                  <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                    <div className={`p-1.5 rounded-lg shrink-0 ${levelConfig.bg}`}>
                      <LevelIcon className={`h-4 w-4 ${levelConfig.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {logType === 'system' && (
                          <>
                            {log.level && (
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${levelConfig.bg} ${levelConfig.color}`}>
                                {levelConfig.label}
                              </span>
                            )}
                            {log.module && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded">
                                {log.module}
                              </span>
                            )}
                            {log.action && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {log.action}
                              </span>
                            )}
                          </>
                        )}
                        {logType === 'login' && (
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${levelConfig.bg} ${levelConfig.color}`}>
                            {levelConfig.label}
                          </span>
                        )}
                        {log.userName && (
                          <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{log.userName}</span>
                        )}
                        {log.username && (
                          <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{log.username}</span>
                        )}
                        {log.ip && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">IP: {log.ip}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">{log.message}</p>
                      {log.details && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">{log.details}</p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t.total.replace('{total}', String(total))} · {t.page.replace('{page}', String(page))}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
