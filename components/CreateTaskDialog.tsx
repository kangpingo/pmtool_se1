'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format, addDays } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Calendar, Clock, AlertCircle, Star, CheckSquare, ChevronDown, Folder } from 'lucide-react'
import { useApp } from './AppProvider'
import { calcDaysBetween } from '@/lib/date-utils'

interface Project {
  id: string
  name: string
}

// 根据开始日期和工期计算结束日期
function calcEndDate(start: string, dur: number): string {
  if (!start || !dur) return ''
  return format(addDays(new Date(start), dur - 1), 'yyyy-MM-dd')
}

// 根据开始和结束日期计算工期
function calcDurationFromDates(start: string, end: string): number {
  if (!start || !end) return 1
  return calcDaysBetween(new Date(start), new Date(end))
}

interface Props {
  projectId?: string
  projectName?: string
  projects?: Project[]
  trigger?: React.ReactNode
  username?: string
  open?: boolean
  onClose?: () => void
}

const labels = {
  zh: {
    title: '添加任务',
    projectLabel: '所属项目',
    projectPlaceholder: '选择所属项目',
    nameLabel: '任务名称',
    namePlaceholder: '输入任务名称',
    startDateLabel: '计划开始日期',
    durationLabel: '工期（天）',
    includeWeekend: '包含周末',
    weekendDescInclude: '工期含周六日',
    weekendDescExclude: '工期仅计算工作日（默认）',
    keyPointsLabel: '重点关注事项',
    keyPointsPlaceholder: '记录需要特别关注的事项...',
    cancel: '取消',
    create: '添加任务',
    creating: '创建中...',
    createSuccess: '任务创建成功',
    createFailed: '创建失败，请重试',
    nameRequired: '请填写任务名称',
    startDateRequired: '请选择开始日期',
    durationRequired: '请填写工期（需大于0）',
    projectRequired: '请选择所属项目',
  },
  en: {
    title: 'Add Task',
    projectLabel: 'Project',
    projectPlaceholder: 'Select Project',
    nameLabel: 'Task Name',
    namePlaceholder: 'Enter Task Name',
    startDateLabel: 'Planned Start Date',
    durationLabel: 'Duration (days)',
    includeWeekend: 'Include Weekend',
    weekendDescInclude: 'Duration includes weekends',
    weekendDescExclude: 'Duration only counts weekdays (default)',
    keyPointsLabel: 'Key Points',
    keyPointsPlaceholder: 'Record items requiring special attention...',
    cancel: 'Cancel',
    create: 'Add Task',
    creating: 'Creating...',
    createSuccess: 'Task Created Successfully',
    createFailed: 'Failed To Create Task',
    nameRequired: 'Task Name Is Required',
    startDateRequired: 'Start Date Is Required',
    durationRequired: 'Duration Must Be Greater Than 0',
    projectRequired: 'Please Select A Project',
  },
}

interface FieldErrors {
  name?: string
  startDate?: string
  duration?: string
  projectId?: string
}

export default function CreateTaskDialog({ projectId, projectName, projects: projectsProp, trigger, username, open: openProp, onClose }: Props) {
  const { lang } = useApp()
  const t = labels[lang]
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [projects, setProjects] = useState<Project[]>(projectsProp || [])
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    duration: '3',
    actualEndDate: '',
    keyPoints: '',
    projectId: projectId || '',
    projectName: projectName || '',
  })

  useEffect(() => {
    if (!openProp) return
    // If projectsProp provided, skip fetching
    if (projectsProp) return
    // If projectId provided, still need to fetch projects list for dropdown
    if (projectId) {
      fetch('/api/projects')
        .then(res => res.json())
        .then(data => setProjects(data.map((p: any) => ({ id: p.id, name: p.name }))))
        .catch(console.error)
      return
    }
    // No projectId, use temp project logic if username provided
    if (username) {
      fetch(`/api/projects/with-temp?username=${encodeURIComponent(username)}&lang=${lang}`)
        .then(res => res.json())
        .then(data => {
          if (data.projects) {
            setProjects(data.projects)
            if (data.tempProject) {
              setForm(f => ({ ...f, projectId: data.tempProject.id, projectName: data.tempProject.name }))
            }
          }
        })
        .catch(console.error)
    } else {
      fetch('/api/projects')
        .then(res => res.json())
        .then(data => setProjects(data.map((p: any) => ({ id: p.id, name: p.name }))))
        .catch(console.error)
    }
  }, [open, projectId, projectsProp, username, lang])

  function selectProject(project: Project) {
    setForm(f => ({ ...f, projectId: project.id, projectName: project.name }))
    setProjectDropdownOpen(false)
    if (errors.projectId) setErrors(er => ({ ...er, projectId: undefined }))
  }

  function handleStartDateChange(start: string) {
    const dur = Number(form.duration) || 3
    setForm(f => ({ ...f, startDate: start, endDate: calcEndDate(start, dur) }))
    if (errors.startDate) setErrors(er => ({ ...er, startDate: undefined }))
  }

  function handleDurationChange(dur: string) {
    const duration = Number(dur) || 1
    setForm(f => ({ ...f, duration: dur, endDate: calcEndDate(f.startDate, duration) }))
    if (errors.duration) setErrors(er => ({ ...er, duration: undefined }))
  }

  function handleEndDateChange(end: string) {
    const newDur = calcDurationFromDates(form.startDate, end)
    setForm(f => ({ ...f, endDate: end, duration: String(newDur) }))
    if (errors.duration) setErrors(er => ({ ...er, duration: undefined }))
  }

  function validate(): boolean {
    const newErrors: FieldErrors = {}
    if (!form.projectId) newErrors.projectId = t.projectRequired
    if (!form.name.trim()) newErrors.name = t.nameRequired
    if (!form.startDate) newErrors.startDate = t.startDateRequired
    if (!form.duration || Number(form.duration) <= 0) newErrors.duration = t.durationRequired
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) {
      toast.error(lang === 'zh' ? '请完善必填信息' : 'Please fill in required fields')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${form.projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          startDate: form.startDate,
          endDate: form.endDate || undefined,
          duration: form.duration,
          actualEndDate: form.actualEndDate || undefined,
          keyPoints: form.keyPoints,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success(t.createSuccess)
      setOpen(false)
      setForm({ name: '', startDate: format(new Date(), 'yyyy-MM-dd'), endDate: '', duration: '3', actualEndDate: '', keyPoints: '', projectId: projectId || '', projectName: projectName || '' })
      setErrors({})
      router.refresh()
    } catch {
      toast.error(t.createFailed)
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ name: '', startDate: format(new Date(), 'yyyy-MM-dd'), endDate: '', duration: '3', actualEndDate: '', keyPoints: '', projectId: projectId || '', projectName: projectName || '' })
    setErrors({})
  }

  // When open prop is provided, we're in controlled mode - don't render Dialog/DialogTrigger
  if (openProp !== undefined) {
    return (
      <Dialog open={openProp} onOpenChange={() => onClose?.()}>
        <DialogContent className="max-w-lg dark:bg-gray-800">
        <DialogHeader>
          <div className="flex items-center gap-3 px-1 pb-3 border-b border-gray-100 dark:border-gray-700">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md shadow-blue-200 dark:shadow-blue-900/50">
              <CheckSquare className="h-5 w-5 text-white" />
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
          {/* Project selection */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <Folder className="h-3.5 w-3.5 text-blue-500" />
              {t.projectLabel}
              <span className="text-red-500 text-xs">*</span>
            </Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                className={`w-full px-3 py-2 text-left border rounded-lg text-sm flex items-center justify-between ${
                  errors.projectId
                    ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <span className={form.projectName ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-400'}>
                  {form.projectName || t.projectPlaceholder}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${projectDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {projectDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProjectDropdownOpen(false)} />
                  <div className="absolute z-[80] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {projects.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selectProject(p)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          form.projectId === p.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            {errors.projectId && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.projectId}</p>}
          </div>
          {/* Task name */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              {t.nameLabel}
              <span className="text-red-500 text-xs">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={e => { setForm(f => ({ ...f, name: e.target.value })); if (errors.name) setErrors(er => ({ ...er, name: undefined })) }}
              className={`${errors.name ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100'} focus:ring-2 transition-all text-gray-900 dark:text-gray-100`}
              placeholder={t.namePlaceholder}
            />
            {errors.name && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.name}</p>}
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
                className={`${errors.startDate ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100'} focus:ring-2 transition-all text-gray-900 dark:text-gray-100`}
              />
              {errors.startDate && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.startDate}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-green-500" />
                {lang === 'zh' ? '计划完成日期' : 'Planned End Date'}
              </Label>
              <Input type="date" value={form.endDate || ''}
                onChange={e => handleEndDateChange(e.target.value)}
                className="border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100 focus:ring-2 transition-all text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                {t.durationLabel}
                <span className="text-red-500 text-xs">*</span>
              </Label>
              <Input type="number" min="1" value={form.duration}
                onChange={e => handleDurationChange(e.target.value)}
                className={`${errors.duration ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100'} focus:ring-2 transition-all text-gray-900 dark:text-gray-100`}
              />
              {errors.duration && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.duration}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-purple-500" />
                {lang === 'zh' ? '实际完成日期' : 'Actual End Date'}
              </Label>
              <Input type="date" value={form.actualEndDate || ''}
                onChange={e => { setForm(f => ({ ...f, actualEndDate: e.target.value })) }}
                className="border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100 focus:ring-2 transition-all text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-orange-400" />
              {t.keyPointsLabel}
            </Label>
            <Textarea value={form.keyPoints}
              onChange={e => setForm(f => ({ ...f, keyPoints: e.target.value }))}
              className="border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none text-gray-900 dark:text-gray-100"
              rows={3}
              placeholder={t.keyPointsPlaceholder}
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => { resetForm(); onClose?.() }} className="border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200">{t.cancel}</Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-200 dark:shadow-blue-900/50 font-medium">
              {loading ? t.creating : t.create}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    )
  }

  // Uncontrolled mode - render Dialog/DialogTrigger
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/50">
            <Plus className="h-4 w-4 mr-1" />
            {lang === 'zh' ? '添加任务' : 'Add Task'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg dark:bg-gray-800">
        <DialogHeader>
          <div className="flex items-center gap-3 px-1 pb-3 border-b border-gray-100 dark:border-gray-700">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md shadow-blue-200 dark:shadow-blue-900/50">
              <CheckSquare className="h-5 w-5 text-white" />
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
          {/* Project selection */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <Folder className="h-3.5 w-3.5 text-blue-500" />
              {t.projectLabel}
              <span className="text-red-500 text-xs">*</span>
            </Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                className={`w-full px-3 py-2 text-left border rounded-lg text-sm flex items-center justify-between ${
                  errors.projectId
                    ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <span className={form.projectName ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-400'}>
                  {form.projectName || t.projectPlaceholder}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${projectDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {projectDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProjectDropdownOpen(false)} />
                  <div className="absolute z-[80] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {projects.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selectProject(p)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          form.projectId === p.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            {errors.projectId && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.projectId}</p>}
          </div>
          {/* Task name */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              {t.nameLabel}
              <span className="text-red-500 text-xs">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={e => { setForm(f => ({ ...f, name: e.target.value })); if (errors.name) setErrors(er => ({ ...er, name: undefined })) }}
              className={`${errors.name ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100'} focus:ring-2 transition-all text-gray-900 dark:text-gray-100`}
              placeholder={t.namePlaceholder}
            />
            {errors.name && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.name}</p>}
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
                className={`${errors.startDate ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100'} focus:ring-2 transition-all text-gray-900 dark:text-gray-100`}
              />
              {errors.startDate && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.startDate}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-green-500" />
                {lang === 'zh' ? '计划完成日期' : 'Planned End Date'}
              </Label>
              <Input type="date" value={form.endDate || ''}
                onChange={e => handleEndDateChange(e.target.value)}
                className="border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100 focus:ring-2 transition-all text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                {t.durationLabel}
                <span className="text-red-500 text-xs">*</span>
              </Label>
              <Input type="number" min="1" value={form.duration}
                onChange={e => handleDurationChange(e.target.value)}
                className={`${errors.duration ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100'} focus:ring-2 transition-all text-gray-900 dark:text-gray-100`}
              />
              {errors.duration && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.duration}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-purple-500" />
                {lang === 'zh' ? '实际完成日期' : 'Actual End Date'}
              </Label>
              <Input type="date" value={form.actualEndDate || ''}
                onChange={e => { setForm(f => ({ ...f, actualEndDate: e.target.value })) }}
                className="border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-blue-100 focus:ring-2 transition-all text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-orange-400" />
              {t.keyPointsLabel}
            </Label>
            <Textarea value={form.keyPoints}
              onChange={e => setForm(f => ({ ...f, keyPoints: e.target.value }))}
              className="border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none text-gray-900 dark:text-gray-100"
              rows={3}
              placeholder={t.keyPointsPlaceholder}
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => { resetForm(); setOpen(false) }} className="border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200">{t.cancel}</Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-200 dark:shadow-blue-900/50 font-medium">
              {loading ? t.creating : t.create}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
