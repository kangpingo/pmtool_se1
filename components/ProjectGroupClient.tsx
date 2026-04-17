'use client'
import { useState } from 'react'
import TaskViewToggle from './TaskViewToggle'
import ProjectGroupView from './ProjectGroupView'
import CreateTaskDialog from './CreateTaskDialog'

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

interface Props {
  grouped: Record<string, Task[]>
  projectColors: { border: string; bg: string; bgValue: string; shadowColor: string }[]
  labels: {
    completion: string
    overdueTasks: string
  }
  lang: 'zh' | 'en'
  currentGroupBy: 'time' | 'project'
  currentWindow: string
  currentFavorite?: string
  currentOverdue?: string
}

export default function ProjectGroupClient({
  grouped, projectColors, labels, lang,
  currentGroupBy, currentWindow, currentFavorite, currentOverdue
}: Props) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set(Object.keys(grouped)))
  const [showCreateTask, setShowCreateTask] = useState(false)

  function expandAll() {
    setExpandedProjects(new Set(Object.keys(grouped)))
  }

  function collapseAll() {
    setExpandedProjects(new Set())
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{lang === 'zh' ? '任务视图' : 'Task View'}</h1>
        <TaskViewToggle
          currentGroupBy={currentGroupBy}
          currentWindow={currentWindow}
          currentFavorite={currentFavorite}
          currentOverdue={currentOverdue}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
          showExpandCollapse={currentGroupBy === 'project'}
          onAddTask={() => setShowCreateTask(true)}
        />
      </div>

      <ProjectGroupView
        grouped={grouped}
        projectColors={projectColors}
        labels={labels}
        lang={lang}
        expandedProjects={expandedProjects}
        setExpandedProjects={setExpandedProjects}
      />

      {showCreateTask && (
        <CreateTaskDialog
          open={showCreateTask}
          onClose={() => setShowCreateTask(false)}
          username="Calen"
        />
      )}
    </>
  )
}
