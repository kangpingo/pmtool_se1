'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Trash2, AlertTriangle } from 'lucide-react'
import { useApp } from './AppProvider'

const labels = {
  zh: {
    deleteTooltip: '删除',
    confirmDelete: '确认删除',
    confirmMessage: '确定删除项目',
    deleteWarning: '删除后将同时删除所有相关任务，此操作不可撤销。',
    cancel: '取消',
    deleteBtn: '确认删除',
    deleteSuccess: '项目已删除',
    deleteFailed: '删除失败',
  },
  en: {
    deleteTooltip: 'Delete',
    confirmDelete: 'Confirm Delete',
    confirmMessage: 'Are you sure you want to delete project',
    deleteWarning: 'All related tasks will also be deleted. This action cannot be undone.',
    cancel: 'Cancel',
    deleteBtn: 'Confirm Delete',
    deleteSuccess: 'Project deleted',
    deleteFailed: 'Delete failed',
  },
}

export default function DeleteProjectButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { lang } = useApp()
  const t = labels[lang]

  async function handleDelete() {
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE', keepalive: true })
      toast.success(t.deleteSuccess)
      setOpen(false)
      // 跳转到项目列表页
      setTimeout(() => { router.push('/projects') }, 500)
    } catch {
      toast.error(t.deleteFailed)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="h-9 w-9 bg-gray-200 dark:bg-gray-700 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg" title={t.deleteTooltip}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm dark:bg-gray-800">
        <DialogHeader>
          <div className="flex items-center gap-3 px-1 pb-3 border-b border-gray-100 dark:border-gray-700">
            <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md shadow-red-200 dark:shadow-red-900/50">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {t.confirmDelete}
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              {t.confirmMessage} <span className="font-bold">「{name}」</span>？
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">{t.deleteWarning}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300">{t.cancel}</Button>
            <Button variant="destructive" onClick={handleDelete} className="bg-red-500 hover:bg-red-600">{t.deleteBtn}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
