'use client'
import { ChevronDown, ChevronRight } from 'lucide-react'
import TaskCard from './TaskCard'

interface Task {
  id: string
  name: string
  status: string
  endDate: string
  startDate: string
  progress: number
  favorite: boolean
  duration: number
  includeWeekend: boolean
  keyPoints: string | null
  project: { id: string; name: string }
}

interface ProjectGroupViewProps {
  grouped: Record<string, Task[]>
  projectColors: { border: string; bg: string; bgValue: string; shadowColor: string }[]
  labels: {
    completion: string
    overdueTasks: string
  }
  lang: 'zh' | 'en'
  expandedProjects: Set<string>
  setExpandedProjects: React.Dispatch<React.SetStateAction<Set<string>>>
}

export default function ProjectGroupView({ grouped, projectColors, labels, lang, expandedProjects, setExpandedProjects }: ProjectGroupViewProps) {
  const now = new Date()

  function toggleProject(projectId: string) {
    setExpandedProjects(prev => {
      const next = new Set(prev)
      if (next.has(projectId)) {
        next.delete(projectId)
      } else {
        next.add(projectId)
      }
      return next
    })
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([, tasksInProject], idx) => {
        const projectId = tasksInProject[0].project.id
        const projectName = tasksInProject[0].project.name
        const colors = projectColors[idx % projectColors.length]
        const total = tasksInProject.length
        const doneCnt = tasksInProject.filter(t => t.status === 'DONE').length
        const overdueCnt = tasksInProject.filter(t => t.status !== 'DONE' && new Date(t.endDate) < new Date(now.getFullYear(), now.getMonth(), now.getDate())).length
        const pct = total > 0 ? Math.round(tasksInProject.reduce((sum, t) => sum + t.progress, 0) / total / 10) * 10 : 0
        const isExpanded = expandedProjects.has(projectId)

        return (
          <div key={projectId} className={`rounded-xl bg-white dark:bg-gray-800 overflow-hidden`} style={{ boxShadow: `0 4px 24px ${colors.shadowColor}60` }}>
            {/* Project header */}
            <div className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 ${colors.bg}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleProject(projectId)}
                    className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    )}
                  </button>
                  <div className={`w-1 h-6 rounded-full ${colors.border.replace('border-l-', 'bg-')}`} />
                  <h2 className="font-semibold text-gray-800 dark:text-gray-100">{projectName}</h2>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{doneCnt}/{total} {labels.completion}</span>
                  {overdueCnt > 0 && <span className="text-xs text-red-500 font-medium">{overdueCnt} {labels.overdueTasks}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Overall Progress:</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{pct}%</span>
                  <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${overdueCnt > 0 ? 'bg-red-400' : pct === 100 ? 'bg-green-400' : 'bg-blue-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks - only show when expanded */}
            {isExpanded && (
              <div className={`p-3 space-y-3`}>
                {tasksInProject.map((task, idx) => (
                  <TaskCard key={task.id} task={task} compact index={idx} bgColor={colors.bgValue} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
