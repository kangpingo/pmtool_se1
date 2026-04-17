'use client'
import { useState } from 'react'
import { format, addDays } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Calendar, Clock, User, Link2, FileText, AlertCircle, FolderOpen, Image } from 'lucide-react'
import { useApp } from './AppProvider'

function isValidUrl(s: string): boolean {
  if (!s) return false
  try { new URL(s); return true } catch { return false }
}

function computeCompletion(start: string, dur: string): string {
  if (!start || !dur) return ''
  return format(addDays(new Date(start), Number(dur) - 1), 'yyyy-MM-dd')
}

const labels = {
  zh: {
    title: '新建项目',
    nameLabel: '项目简称',
    namePlaceholder: '输入项目简称',
    fullNameLabel: '项目全称',
    fullNamePlaceholder: '输入项目全称（可选）',
    startDateLabel: '开始日期',
    durationLabel: '工期（天）',
    completionLabel: '完成日期',
    completionPlaceholder: '留空则自动计算',
    ownerLabel: '责任人',
    ownerPlaceholder: '输入责任人',
    linkLabel: '项目链接',
    linkPlaceholder: 'https://...',
    imageLabel: '项目图片',
    imagePlaceholder: '图片URL（可选）',
    descLabel: '项目描述',
    descPlaceholder: '输入项目描述（可选）',
    cancel: '取消',
    create: '创建项目',
    createSuccess: '项目创建成功',
    createFailed: '创建失败',
    nameRequired: '请填写项目简称',
    startDateRequired: '请选择开始日期',
    durationRequired: '请填写工期',
  },
  en: {
    title: 'New Project',
    nameLabel: 'Short Name',
    namePlaceholder: 'Enter short name',
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'Enter full name (optional)',
    startDateLabel: 'Start Date',
    durationLabel: 'Duration (days)',
    completionLabel: 'Completion Date',
    completionPlaceholder: 'Auto-calculate if empty',
    ownerLabel: 'Owner',
    ownerPlaceholder: 'Enter owner',
    linkLabel: 'Project Link',
    linkPlaceholder: 'https://...',
    imageLabel: 'Project Image',
    imagePlaceholder: 'Image URL (optional)',
    descLabel: 'Description',
    descPlaceholder: 'Enter description (optional)',
    cancel: 'Cancel',
    create: 'Create Project',
    createSuccess: 'Project created successfully',
    createFailed: 'Failed to create project',
    nameRequired: 'Short name is required',
    startDateRequired: 'Start date is required',
    durationRequired: 'Duration is required',
  },
}

interface FieldErrors {
  name?: string
  startDate?: string
  duration?: string
}

export default function CreateProjectDialog() {
  const { lang } = useApp()
  const t = labels[lang]
  const [open, setOpen] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [form, setForm] = useState({
    name: '',
    shortName: '',
    fullName: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    duration: '30',
    description: '',
    owner: '',
    link: 'http://127.0.0.1:3000',
    completionTime: '',
    image: 'https://www.oracle.com/assets/images/oracle-logo.png',
  })

  function handleDurationChange(dur: string) {
    setForm(f => ({ ...f, duration: dur, completionTime: computeCompletion(f.startDate, dur) }))
    if (errors.duration) setErrors(e => ({ ...e, duration: undefined }))
  }

  function handleStartDateChange(start: string) {
    setForm(f => ({ ...f, startDate: start, completionTime: computeCompletion(start, f.duration) }))
    if (errors.startDate) setErrors(e => ({ ...e, startDate: undefined }))
  }

  function resetForm() {
    setForm({
      name: '',
      shortName: '',
      fullName: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      duration: '30',
      description: '',
      owner: '',
      link: 'http://127.0.0.1:3000',
      completionTime: '',
      image: 'https://www.oracle.com/assets/images/oracle-logo.png',
    })
    setErrors({})
  }

  function validate(): boolean {
    const newErrors: FieldErrors = {}
    if (!form.name.trim()) newErrors.name = t.nameRequired
    if (!form.startDate) newErrors.startDate = t.startDateRequired
    if (!form.duration || Number(form.duration) <= 0) newErrors.duration = t.durationRequired
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!validate()) {
      toast.error(lang === 'zh' ? '请完善必填信息' : 'Please fill in required fields')
      return
    }

    const payload: Record<string, any> = {
      name: form.name.trim(),
      shortName: form.shortName || null,
      fullName: form.fullName || null,
      startDate: form.startDate,
      duration: Number(form.duration),
      description: form.description || null,
      owner: form.owner || null,
    }
    if (form.link) {
      payload.link = isValidUrl(form.link) ? form.link : null
    }
    if (form.completionTime) {
      payload.completionTime = form.completionTime
    }
    if (form.image) {
      payload.image = form.image
    }

    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) {
          toast.error(t.createFailed)
          return
        }
        toast.success(t.createSuccess)
        resetForm()
        setOpen(false)
        setTimeout(() => { window.location.href = window.location.href }, 800)
      })
      .catch(() => {
        toast.error(t.createFailed)
      })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/50"><Plus className="h-4 w-4 mr-2" />{lang === 'zh' ? '新建项目' : 'New Project'}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg dark:bg-gray-800">
        <DialogHeader>
          <div className="flex items-center gap-3 px-1 pb-3 border-b border-gray-100 dark:border-gray-700">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md shadow-blue-200 dark:shadow-blue-900/50">
              <FolderOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {t.title}
              </DialogTitle>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{lang === 'zh' ? '带 * 为必填项' : '* Required fields'}</p>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                {t.nameLabel}
                <span className="text-red-500 text-xs">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); if (errors.name) setErrors(er => ({ ...er, name: undefined })) }}
                className={`${errors.name ? 'border-red-300 bg-red-50 dark:bg-red-900/20 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100'} dark:text-gray-100 focus:ring-2 transition-all`}
                placeholder={t.namePlaceholder}
              />
              {errors.name && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-500 rounded-full" />
                {t.fullNameLabel}
              </Label>
              <Input value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                className="border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100 dark:text-gray-100 transition-all"
                placeholder={t.fullNamePlaceholder}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                {t.startDateLabel}
                <span className="text-red-500 text-xs">*</span>
              </Label>
              <Input type="date" value={form.startDate}
                onChange={e => handleStartDateChange(e.target.value)}
                className={`${errors.startDate ? 'border-red-300 bg-red-50 dark:bg-red-900/20 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100'} dark:text-gray-100 focus:ring-2 transition-all`}
              />
              {errors.startDate && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.startDate}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                {t.durationLabel}
                <span className="text-red-500 text-xs">*</span>
              </Label>
              <Input type="number" min="1" value={form.duration}
                onChange={e => handleDurationChange(e.target.value)}
                className={`${errors.duration ? 'border-red-300 bg-red-50 dark:bg-red-900/20 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100'} dark:text-gray-100 focus:ring-2 transition-all`}
              />
              {errors.duration && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.duration}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-green-500" />
                {t.completionLabel}
              </Label>
              <Input type="date" value={form.completionTime}
                onChange={e => setForm(f => ({ ...f, completionTime: e.target.value }))}
                placeholder={t.completionPlaceholder}
                className="border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100 dark:text-gray-100 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-purple-500" />
                {t.ownerLabel}
              </Label>
              <Input value={form.owner}
                onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                className="border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100 dark:text-gray-100 transition-all"
                placeholder={t.ownerPlaceholder}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5 text-blue-400" />
              {t.linkLabel}
            </Label>
            <Input placeholder={t.linkPlaceholder} value={form.link}
              onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
              className="border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100 dark:text-gray-100 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
              <Image className="h-3.5 w-3.5 text-purple-400" />
              {t.imageLabel}
            </Label>
            <Input placeholder={t.imagePlaceholder} value={form.image}
              onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
              className="border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100 dark:text-gray-100 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-orange-400" />
              {t.descLabel}
            </Label>
            <Textarea value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100 dark:text-gray-100 transition-all resize-none"
              rows={3}
              placeholder={t.descPlaceholder}
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => { resetForm(); setOpen(false) }} className="border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-100">{t.cancel}</Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-200 dark:shadow-blue-900/50 font-medium">{t.create}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
