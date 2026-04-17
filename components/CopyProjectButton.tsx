'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Copy, FolderOpen } from 'lucide-react'
import { useApp } from './AppProvider'

const labels = {
  zh: {
    copyTooltip: '复制项目',
    copyTitle: '复制项目',
    nameLabel: '项目名称',
    cancel: '取消',
    create: '创建',
    creating: '创建中...',
    createSuccess: '项目已创建',
    createFailed: '创建失败',
  },
  en: {
    copyTooltip: 'Copy Project',
    copyTitle: 'Copy Project',
    nameLabel: 'Project Name',
    cancel: 'Cancel',
    create: 'Create',
    creating: 'Creating...',
    createSuccess: 'Project created',
    createFailed: 'Failed to create',
  },
}

interface Project {
  id: string
  name: string
  shortName: string | null
  fullName: string | null
  plannedStartDate: string
  duration: number
  description: string | null
  owner: string | null
  link: string | null
  image: string | null
  completionTime: string | null
}

export default function CopyProjectButton({ project }: { project: Project }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(`${project.name} (Copy)`)
  const [creating, setCreating] = useState(false)
  const { lang } = useApp()
  const t = labels[lang]

  async function handleCreate() {
    if (!name.trim()) return
    setCreating(true)
    try {
      const res = await fetch(`/api/projects/${project.id}/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (res.ok) {
        toast.success(t.createSuccess)
        setOpen(false)
      } else {
        toast.error(t.createFailed)
      }
    } catch {
      toast.error(t.createFailed)
    } finally {
      setCreating(false)
    }
  }

  function handleOpenChange(open: boolean) {
    if (open) {
      setName(`${project.name} (Copy)`)
    }
    setOpen(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="h-9 w-9 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg"
          title={t.copyTooltip}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md dark:bg-gray-800">
        <DialogHeader>
          <div className="flex items-center gap-3 px-1 pb-3 border-b border-gray-100 dark:border-gray-700">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md shadow-blue-200 dark:shadow-blue-900/50">
              <FolderOpen className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {t.copyTitle}
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{t.nameLabel}</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              className="border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100 dark:text-gray-100"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !name.trim()}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-200 dark:shadow-blue-900/50 font-medium"
            >
              {creating ? t.creating : t.create}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
