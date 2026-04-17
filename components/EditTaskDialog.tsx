'use client'
import { useState } from 'react'
import { format, addDays } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Pencil, AlertCircle } from 'lucide-react'
import { isTaskOverdue, isTaskDueToday, isTaskDueTomorrow, calcDaysBetween } from '@/lib/date-utils'

interface Task {
  id: string
  name: string
  startDate: string
  endDate: string
  actualFinishDate?: string | null
  duration: number
  includeWeekend: boolean
  keyPoints: string | null
  status: string
  favorite: boolean
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

export default function EditTaskDialog({ task, onUpdated }: { task: Task; onUpdated: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState(() => {
    const start = format(new Date(task.startDate), 'yyyy-MM-dd')
    const end = format(new Date(task.endDate), 'yyyy-MM-dd')
    return {
      name: task.name,
      startDate: start,
      endDate: end,
      duration: String(task.duration),
      includeWeekend: task.includeWeekend,
      keyPoints: task.keyPoints ?? '',
      status: task.status,
      actualFinishDate: task.actualFinishDate ? format(new Date(task.actualFinishDate), 'yyyy-MM-dd') : '',
    }
  })

  function openDialog() {
    const start = format(new Date(task.startDate), 'yyyy-MM-dd')
    const end = format(new Date(task.endDate), 'yyyy-MM-dd')
    setForm({
      name: task.name,
      startDate: start,
      endDate: end,
      duration: String(task.duration),
      includeWeekend: task.includeWeekend,
      keyPoints: task.keyPoints ?? '',
      status: task.status,
      actualFinishDate: task.actualFinishDate ? format(new Date(task.actualFinishDate), 'yyyy-MM-dd') : '',
    })
    setErrors({})
    setOpen(true)
  }

  function handleStartDateChange(start: string) {
    const dur = Number(form.duration) || 1
    setForm(f => ({ ...f, startDate: start, endDate: calcEndDate(start, dur) }))
    if (errors.startDate) setErrors(e => ({ ...e, startDate: '' }))
  }

  function handleDurationChange(dur: string) {
    const duration = Number(dur) || 1
    setForm(f => ({ ...f, duration: dur, endDate: calcEndDate(f.startDate, duration) }))
    if (errors.duration) setErrors(e => ({ ...e, duration: '' }))
  }

  function handleEndDateChange(end: string) {
    const newDur = calcDurationFromDates(form.startDate, end)
    setForm(f => ({ ...f, endDate: end, duration: String(newDur) }))
    if (errors.duration) setErrors(e => ({ ...e, duration: '' }))
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {}
    const startDate = new Date(form.startDate)
    const today = new Date()
    today.setHours(23, 59, 59, 999) // Set to end of today

    // Validate actualFinishDate if provided
    if (form.actualFinishDate) {
      const actualDate = new Date(form.actualFinishDate)
      const plannedEndDate = new Date(task.endDate)

      // actualFinishDate must be >= plannedStartDate
      if (actualDate < startDate) {
        newErrors.actualFinishDate = '实际完成日期不能早于计划开始日期'
      }

      // actualFinishDate must be <= today (can't be in the future)
      if (actualDate > today) {
        newErrors.actualFinishDate = '实际完成日期不能晚于今天'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('请填写任务名称')
      return
    }

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          startDate: form.startDate,
          duration: Number(form.duration),
          includeWeekend: form.includeWeekend,
          keyPoints: form.keyPoints || null,
          status: form.status,
          actualFinishDate: form.actualFinishDate || null,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('任务已更新')
      setOpen(false)
      onUpdated()
    } catch {
      toast.error('更新失败')
    } finally {
      setLoading(false)
    }
  }

  const overdue = isTaskOverdue(new Date(task.endDate)) && task.status !== 'DONE'
  const dueToday = isTaskDueToday(new Date(task.endDate)) && task.status !== 'DONE' && !overdue
  const dueTomorrow = isTaskDueTomorrow(new Date(task.endDate)) && task.status !== 'DONE' && !overdue && !dueToday

  // Calculate max date for actualFinishDate (today)
  const maxDate = format(new Date(), 'yyyy-MM-dd')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" onClick={openDialog}>
          <Pencil className="h-3.5 w-3.5 mr-1" />编辑
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>编辑任务</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>任务名称 *</Label>
            <Input value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>计划开始日期</Label>
              <Input type="date" value={form.startDate}
                onChange={e => handleStartDateChange(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>工期（天）</Label>
              <Input type="number" min="1" value={form.duration}
                onChange={e => handleDurationChange(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>计划完成日期</Label>
              <Input type="date" value={form.endDate}
                onChange={e => handleEndDateChange(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>实际完成日期</Label>
              <Input
                type="date"
                value={form.actualFinishDate}
                min={form.startDate}
                max={maxDate}
                onChange={e => {
                  setForm(f => ({ ...f, actualFinishDate: e.target.value }))
                  if (errors.actualFinishDate) {
                    setErrors(er => ({ ...er, actualFinishDate: '' }))
                  }
                }}
                className={errors.actualFinishDate ? 'border-red-300 bg-red-50' : ''}
              />
              {errors.actualFinishDate && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.actualFinishDate}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>状态</Label>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">待开始</SelectItem>
                <SelectItem value="IN_PROGRESS">进行中</SelectItem>
                <SelectItem value="DONE">已完成</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Switch checked={form.includeWeekend}
              onCheckedChange={v => setForm(f => ({ ...f, includeWeekend: v }))} />
            <div>
              <p className="text-sm font-medium">包含周末</p>
              <p className="text-xs text-gray-500">{form.includeWeekend ? '工期含周六日' : '工期仅计算工作日'}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>重点关注事项</Label>
            <Textarea value={form.keyPoints}
              onChange={e => setForm(f => ({ ...f, keyPoints: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button type="submit" disabled={loading}>{loading ? '保存中...' : '保存修改'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
