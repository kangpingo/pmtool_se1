'use client'
import { useState, useRef } from 'react'
import { Upload, Download, FileText, AlertCircle, CheckCircle2, X, FileSpreadsheet, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useApp } from './AppProvider'
import * as XLSX from 'xlsx'

interface Props {
  projectId: string
  projectName: string
}

const labels = {
  zh: {
    exportTitle: '导出',
    importTitle: '导入',
    selectFile: '选择 Excel/CSV 文件',
    dragHint: '点击选择文件或拖拽到此处',
    importPreview: '预览：共 {count} 个任务待导入',
    fileRequired: '请先选择文件',
    importBtn: '确认导入',
    importing: '导入中...',
    importHint: '支持 .xlsx 和 .csv 格式文件',
    importFormat: '支持格式：Excel (.xlsx) 和 CSV (.csv)',
    downloadTemplate: '下载模板',
    templateHint: '下载 Excel 模板，按格式填写后导入',
    excelTemplate: 'Excel 模板',
    csvTemplate: 'CSV 模板',
    importSuccess: '成功导入 {count} 个任务',
    importFailed: '导入失败，请检查文件格式',
    invalidFile: '文件格式不正确',
    noData: '文件中没有有效数据',
    wrongFormat: '文件格式不正确，请使用标准模板',
    reset: '重新选择',
    cancel: '取消',
    duplicateWarning: '发现 {count} 条重复任务',
    duplicateDesc: '任务名称、开始时间、完成时间都相同的任务将被视为重复',
    duplicateContinue: '继续导入（忽略重复）',
    duplicateCancel: '取消',
    skipDuplicate: '跳过重复',
  },
  en: {
    exportTitle: 'Export',
    importTitle: 'Import',
    selectFile: 'Select Excel/CSV File',
    dragHint: 'Click to select or drag file here',
    importPreview: 'Preview: {count} tasks ready to import',
    fileRequired: 'Please select a file first',
    importBtn: 'Confirm Import',
    importing: 'Importing...',
    importHint: 'Supports .xlsx and .csv format files',
    importFormat: 'Supported: Excel (.xlsx) and CSV (.csv)',
    downloadTemplate: 'Download Template',
    templateHint: 'Download template, fill in and import',
    excelTemplate: 'Excel Template',
    csvTemplate: 'CSV Template',
    importSuccess: 'Successfully imported {count} tasks',
    importFailed: 'Import failed, please check file format',
    invalidFile: 'Invalid file format',
    noData: 'No valid data in file',
    wrongFormat: 'Incorrect file format, please use standard template',
    reset: 'Select Again',
    cancel: 'Cancel',
    duplicateWarning: 'Found {count} duplicate tasks',
    duplicateDesc: 'Tasks with same name, start date and end date are considered duplicates',
    duplicateContinue: 'Continue (skip duplicates)',
    duplicateCancel: 'Cancel',
    skipDuplicate: 'Skip duplicates',
  },
}

export default function ImportExportButtons({ projectId, projectName }: Props) {
  const { lang } = useApp()
  const t = labels[lang]
  const [importOpen, setImportOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<any[] | null>(null)
  const [previewCount, setPreviewCount] = useState<number>(0)
  const [duplicateCount, setDuplicateCount] = useState<number>(0)
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleExport() {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks?format=csv`)
      if (!res.ok) {
        const text = await res.text()
        console.error('Export failed:', res.status, text)
        throw new Error(text)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${projectName}-tasks.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(t.importSuccess || 'Export successful')
    } catch (err) {
      console.error('Export error:', err)
      toast.error(t.importFailed || 'Export failed')
    }
  }

  function handleDownloadExcelTemplate() {
    const wb = XLSX.utils.book_new()
    const headers = lang === 'zh'
      ? ['任务名称', '开始日期', '完成日期', '工期(天)', '包含周末', '重点关注']
      : ['Task Name', 'Start Date', 'End Date', 'Duration', 'Include Weekend', 'Key Points']
    const example = lang === 'zh'
      ? ['示例任务', '2026-04-01', '2026-04-03', '3', '否', '这是重点关注内容']
      : ['Sample Task', '2026-04-01', '2026-04-03', '3', 'No', 'Key points here']
    const ws = XLSX.utils.aoa_to_sheet([headers, example])
    ws['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 30 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Tasks')
    XLSX.writeFile(wb, `${lang === 'zh' ? '任务导入模板' : 'Task Import Template'}.xlsx`)
    toast.success(lang === 'zh' ? '模板已下载' : 'Template downloaded')
  }

  function handleDownloadCSVTemplate() {
    const template = lang === 'zh'
      ? '任务名称,开始日期,完成日期,工期(天),包含周末,重点关注\n示例任务,2026-04-01,2026-04-03,3,否,这是重点关注内容'
      : 'Task Name,Start Date, End Date,Duration,Include Weekend,Key Points\nSample Task,2026-04-01,2026-04-03,3,No,Key points here'
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${lang === 'zh' ? '任务导入模板' : 'Task Import Template'}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(lang === 'zh' ? '模板已下载' : 'Template downloaded')
  }

  async function parseFile(file: File): Promise<{ tasks: any[], error: string | null }> {
    const ext = file.name.split('.').pop()?.toLowerCase()

    if (ext === 'xlsx' || ext === 'xls') {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

      if (json.length < 2) {
        return { tasks: [], error: t.noData }
      }

      const headers = json[0].map((h: any) => String(h).trim())
      const nameKeys = lang === 'zh' ? ['任务名称', '任务名称'] : ['Task Name', 'Task Name']
      const startKeys = lang === 'zh' ? ['开始日期', '开始时间'] : ['Start Date', 'Start Time']
      const endKeys = lang === 'zh' ? ['完成日期', '结束日期', '完成时间'] : ['End Date', 'Due Date', 'End Time']
      const durKeys = lang === 'zh' ? ['工期(天)', '工期', 'Duration'] : ['Duration', 'Days']
      const wkndKeys = lang === 'zh' ? ['包含周末', 'Include Weekend'] : ['Include Weekend']
      const kpKeys = lang === 'zh' ? ['重点关注', '备注', 'Key Points'] : ['Key Points', 'Notes']

      const getIdx = (keys: string[]) => {
        for (const k of keys) {
          const idx = headers.findIndex((h: string) => h.includes(k))
          if (idx >= 0) return idx
        }
        return -1
      }

      const nameIdx = getIdx(nameKeys)
      const startIdx = getIdx(startKeys)
      const endIdx = getIdx(endKeys)
      const durIdx = getIdx(durKeys)
      const wkndIdx = getIdx(wkndKeys)
      const kpIdx = getIdx(kpKeys)

      if (nameIdx < 0 || startIdx < 0 || endIdx < 0) {
        return { tasks: [], error: t.wrongFormat }
      }

      const tasks: any[] = []
      for (let i = 1; i < json.length; i++) {
        const row = json[i]
        if (!row || row.length === 0) continue
        const name = String(row[nameIdx] || '').trim()
        const startDate = String(row[startIdx] || '').trim()
        const endDate = String(row[endIdx] || '').trim()
        if (!name || !startDate || !endDate) continue

        let duration = 3
        let includeWeekend = false
        let keyPoints = ''

        if (durIdx >= 0) {
          const d = parseInt(String(row[durIdx] || '3'))
          if (!isNaN(d) && d > 0) duration = d
        }
        if (wkndIdx >= 0) {
          const w = String(row[wkndIdx] || '').toLowerCase()
          includeWeekend = w === '是' || w === 'yes' || w === 'true' || w === '1'
        }
        if (kpIdx >= 0) {
          keyPoints = String(row[kpIdx] || '').trim()
        }

        tasks.push({ name, startDate, endDate, duration, includeWeekend, keyPoints })
      }

      return { tasks, error: tasks.length === 0 ? t.noData : null }
    } else if (ext === 'csv') {
      const text = await file.text()
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length < 2) {
        return { tasks: [], error: t.noData }
      }

      const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/"/g, ''))
      const nameKeys = lang === 'zh' ? ['任务名称', '任务名称'] : ['Task Name', 'Task Name']
      const startKeys = lang === 'zh' ? ['开始日期'] : ['Start Date']
      const endKeys = lang === 'zh' ? ['完成日期'] : ['End Date']
      const durKeys = lang === 'zh' ? ['工期(天)'] : ['Duration']
      const wkndKeys = lang === 'zh' ? ['包含周末'] : ['Include Weekend']
      const kpKeys = lang === 'zh' ? ['重点关注'] : ['Key Points']

      const getIdx = (keys: string[]) => {
        for (const k of keys) {
          const idx = headers.findIndex(h => h.includes(k))
          if (idx >= 0) return idx
        }
        return -1
      }

      const nameIdx = getIdx(nameKeys)
      const startIdx = getIdx(startKeys)
      const endIdx = getIdx(endKeys)
      const durIdx = getIdx(durKeys)
      const wkndIdx = getIdx(wkndKeys)
      const kpIdx = getIdx(kpKeys)

      if (nameIdx < 0 || startIdx < 0 || endIdx < 0) {
        return { tasks: [], error: t.wrongFormat }
      }

      const tasks: any[] = []
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i])
        const name = values[nameIdx]?.trim() || ''
        const startDate = values[startIdx]?.trim() || ''
        const endDate = values[endIdx]?.trim() || ''
        if (!name || !startDate || !endDate) continue

        const duration = durIdx >= 0 ? parseInt(values[durIdx]) || 3 : 3
        const includeWeekend = wkndIdx >= 0 ? values[wkndIdx] === '是' || values[wkndIdx] === 'Yes' : false
        const keyPoints = kpIdx >= 0 ? values[kpIdx]?.trim() : ''

        tasks.push({ name, startDate, endDate, duration, includeWeekend, keyPoints })
      }

      return { tasks, error: tasks.length === 0 ? t.noData : null }
    } else {
      return { tasks: [], error: t.invalidFile }
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null)
    const file = e.target.files?.[0]
    if (!file) {
      setSelectedFile(null)
      setParsedData(null)
      setPreviewCount(0)
      return
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
      setFileError(t.invalidFile)
      setSelectedFile(null)
      setParsedData(null)
      setPreviewCount(0)
      return
    }

    setSelectedFile(file)
    setFileError(null)

    // Preview parse
    parseFile(file).then(result => {
      if (result.error) {
        setFileError(result.error)
        setParsedData(null)
        setPreviewCount(0)
      } else {
        setParsedData(result.tasks)
        setPreviewCount(result.tasks.length)
        setFileError(null)
      }
    })
  }

  function resetDialog() {
    setImportOpen(false)
    setSelectedFile(null)
    setFileError(null)
    setParsedData(null)
    setPreviewCount(0)
    setDuplicateCount(0)
    setShowDuplicateWarning(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleReset() {
    setSelectedFile(null)
    setFileError(null)
    setParsedData(null)
    setPreviewCount(0)
    setDuplicateCount(0)
    setShowDuplicateWarning(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  // Detect duplicates within parsed data
  function detectDuplicates(tasks: any[]): number {
    const seen = new Set<string>()
    let duplicates = 0
    for (const task of tasks) {
      const key = `${task.name}|${task.startDate}|${task.endDate}`
      if (seen.has(key)) {
        duplicates++
      } else {
        seen.add(key)
      }
    }
    return duplicates
  }

  async function handleImportConfirm() {
    if (!selectedFile || !parsedData || parsedData.length === 0) {
      setFileError(t.fileRequired)
      return
    }

    // Check for duplicates within the file
    const dupCount = detectDuplicates(parsedData)

    if (dupCount > 0 && !showDuplicateWarning) {
      setDuplicateCount(dupCount)
      setShowDuplicateWarning(true)
      return
    }

    // Filter out duplicates if user confirmed
    const uniqueTasks = parsedData.filter((task, idx, arr) => {
      const key = `${task.name}|${task.startDate}|${task.endDate}`
      const firstIdx = arr.findIndex(t => `${t.name}|${t.startDate}|${t.endDate}` === key)
      return firstIdx === idx
    })

    setImporting(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: uniqueTasks }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      toast.success(t.importSuccess.replace('{count}', String(data.count)))
      resetDialog()
      setTimeout(() => { window.location.href = window.location.href }, 500)
    } catch {
      setFileError(t.importFailed)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {/* Export */}
      <Button
        onClick={handleExport}
        className="h-7 px-2 py-1 bg-green-600 text-white hover:bg-green-700 rounded-lg gap-1"
      >
        <Download className="h-3 w-3" />
      </Button>

      {/* Import */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogTrigger asChild>
          <Button
            className="h-7 px-2 py-1 bg-green-600 text-white hover:bg-green-700 rounded-lg gap-1"
          >
            <Upload className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md [&>button]:hidden">
          <DialogHeader>
            <div className="flex items-center justify-between px-1 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-200">
                  <Upload className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-gray-900">
                    {t.importTitle}
                  </DialogTitle>
                  <p className="text-xs text-gray-400 mt-0.5">{projectName}</p>
                </div>
              </div>
              <button
                onClick={resetDialog}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Format hint */}
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg p-3">
              <FileSpreadsheet className="h-5 w-5 text-blue-500 shrink-0" />
              <div>
                <p className="text-sm text-blue-700 font-medium">{t.importFormat}</p>
                <p className="text-xs text-blue-500 mt-0.5">{t.importHint}</p>
              </div>
            </div>

            {/* Download templates */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-2.5 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                {t.templateHint}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadExcelTemplate}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all text-xs font-medium text-gray-600"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  {t.excelTemplate}
                </button>
                <button
                  onClick={handleDownloadCSVTemplate}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all text-xs font-medium text-gray-600"
                >
                  <FileText className="h-4 w-4" />
                  {t.csvTemplate}
                </button>
              </div>
            </div>

            {/* File select */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                {t.selectFile}
                <span className="text-red-500 text-xs">*</span>
              </label>
              <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${fileError ? 'border-red-300 bg-red-50' : selectedFile ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  disabled={importing}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                    <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                    <button
                      onClick={(e) => { e.preventDefault(); handleReset() }}
                      className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      {t.reset}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      {t.dragHint}
                    </p>
                  </div>
                )}
              </div>

              {/* Preview count */}
              {previewCount > 0 && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg p-2.5">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <p className="text-sm text-green-700">
                    {t.importPreview?.replace('{count}', String(previewCount)) || `Preview: ${previewCount} tasks ready to import`}
                  </p>
                </div>
              )}

              {/* Error */}
              {fileError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg p-2.5">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-600">{fileError}</p>
                </div>
              )}

              {/* Duplicate Warning */}
              {showDuplicateWarning && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-800">
                        {t.duplicateWarning.replace('{count}', String(duplicateCount))}
                      </p>
                      <p className="text-xs text-amber-600 mt-1">{t.duplicateDesc}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setShowDuplicateWarning(false); setDuplicateCount(0); resetDialog() }}
                      className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-100"
                    >
                      {t.duplicateCancel}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleImportConfirm}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      {t.duplicateContinue}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {!showDuplicateWarning && (
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={resetDialog}
                  disabled={importing}
                  className="border-gray-200 text-gray-500 hover:bg-gray-50"
                >
                  {t.cancel}
                </Button>
                <Button
                  onClick={handleImportConfirm}
                  disabled={importing || !parsedData || parsedData.length === 0}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-200 font-medium"
                >
                  {importing ? (
                    <>
                      <span className="animate-spin mr-1">⏳</span>
                      {t.importing}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-1" />
                      {t.importBtn}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}
