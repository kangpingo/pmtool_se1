export type Language = 'zh' | 'en'

export const translations = {
  zh: {
    // Login page
    login: '登录',
    username: '用户名',
    password: '密码',
    loginButton: '登录',
    loggingIn: '登录中...',
    loginError: '用户名或密码错误',
    loginSuccess: '登录成功',
    forgotPassword: '忘记密码',
    language: '语言',
    theme: '主题',
    dark: '深色',
    light: '浅色',

    // System name
    systemName: '东方渡项目管理平台',
    systemNameEn: 'StoryEAST Project Management System',

    // Header
    logout: '退出登录',

    // Sidebar
    overview: '总览',
    projects: '项目',
    taskView: '任务视图',
    kanban: '看板',

    // Home page
    myProjects: '我的项目',
    allProjects: '全部项目',
    activeProjects: '进行中项目',
    activeTasks: '进行中任务',
    overdue: '已逾期',
    dueToday: '今天到期',
    dueTomorrow: '明天到期',
    noProjects: '暂无项目，点击「新建项目」开始',
    noTasks: '当前时间段内没有任务',
    noTasksInProject: '还没有任务，点击「添加任务」开始',
    progress: '进度',
    tasks: '任务',
    taskCount: '共 {count} 条任务',
    tasksCompleted: '{count} 条已完成',
    tasksOverdue: '{count} 条逾期',
    projectProgress: '{percent}% 完成',

    // Project page
    projectList: '项目列表',
    projectCount: '({count}个项目)',
    createProject: '新建项目',
    editProject: '编辑项目',
    deleteProject: '删除项目',
    projectName: '项目名称 *',
    projectShortName: '项目简称 *',
    projectFullName: '项目全称',
    startDate: '开始时间 *',
    duration: '工期（天）*',
    completionTime: '完成时间',
    autoCalculate: '留空则自动计算',
    owner: '责任人',
    projectLink: '项目链接',
    projectDescription: '项目描述',
    createButton: '创建项目',
    saveButton: '保存修改',
    cancel: '取消',
    createSuccess: '项目创建成功',
    updateSuccess: '项目信息已更新',
    deleteConfirm: '删除项目「{name}」？',
    deleteSuccess: '已删除',
    startLabel: '开始',
    durationLabel: '工期',
    taskList: '任务列表',
    addTask: '添加任务',
    exportTask: '导出任务',
    importTask: '导入任务',

    // Task page
    timeView: '按时间',
    projectView: '按项目',
    today: '今天',
    near3days: '近3天',
    near1week: '近1周',
    favorites: '收藏',
    overdueTasks: '已逾期',
    upcomingTasks: '即将到期',
    completedTasks: '已完成',
    todayDue: '今日到期',

    // Task card
    todo: '待开始',
    inProgress: '进行中',
    done: '已完成',
    taskOverdue: '任务已逾期',
    taskDueToday: '今天到期',
    taskDueTomorrow: '明天到期',
    dueSoon: '即将到期',
    keyPoints: '重点关注',
    editTask: '编辑任务',
    deleteTask: '删除任务',
    completeTask: '一键完成',
    reopenTask: '重开',
    taskCreated: '任务创建成功',
    taskDeleted: '已删除',
    progressUpdated: '进度已更新',
    statusUpdated: '状态已更新',
    taskCompleted: '任务已完成 ✓',
    taskReopened: '任务已重开',
    saveFailed: '保存失败',
    updateFailed: '更新失败',
    deleteFailed: '删除失败',
    operationFailed: '操作失败',

    // Dialog
    addTaskTitle: '添加任务 · {project}',
    editTaskTitle: '编辑任务',
    createProjectTitle: '新建项目',
    editProjectTitle: '编辑项目',
    importTaskTitle: '导入任务 · {project}',
    taskName: '任务名称 *',
    taskStartDate: '开始日期 *',
    taskEndDate: '完成日期',
    taskDuration: '工期（天）',
    includeWeekend: '包含周末',
    includeWeekendDesc: '工期含周六日',
    excludeWeekendDesc: '工期仅计算工作日（默认）',

    // Import/Export
    uploadCsv: '请上传 CSV 文件，文件应包含以下列：任务名称、开始日期、完成日期、工期(天)、包含周末、重点关注',
    importSuccess: '成功导入 {count} 个任务',
    importFailed: '导入失败',
    exportSuccess: '导出成功',
    exportFailed: '导出失败',
    invalidCsv: 'CSV 文件内容无效',
    invalidCsvFormat: 'CSV 格式不正确，缺少必要列',
    noValidData: '没有有效的任务数据',

    // Validation
    nameRequired: '请填写项目名称',
    taskNameRequired: '请填写任务名称',

    // General
    loading: '加载中...',
    creating: '创建中...',
    saving: '保存中...',
    version: 'v1.0 · 个人版',
  },
  en: {
    // Login page
    login: 'Login',
    username: 'Username',
    password: 'Password',
    loginButton: 'Login',
    loggingIn: 'Logging in...',
    loginError: 'Invalid username or password',
    loginSuccess: 'Login successful',
    forgotPassword: 'Forgot Password',
    language: 'Language',
    theme: 'Theme',
    dark: 'Dark',
    light: 'Light',

    // System name
    systemName: '东方渡项目管理平台',
    systemNameEn: 'StoryEAST Project Management System',

    // Header
    logout: 'Logout',

    // Sidebar
    overview: 'Overview',
    projects: 'Projects',
    taskView: 'Task View',
    kanban: 'Kanban',

    // Home page
    myProjects: 'My Projects',
    allProjects: 'All Projects',
    activeProjects: 'Active Projects',
    activeTasks: 'Active Tasks',
    overdue: 'Overdue',
    dueToday: 'Due Today',
    dueTomorrow: 'Due Tomorrow',
    noProjects: 'No projects yet. Click "New Project" to get started.',
    noTasks: 'No tasks in current period',
    noTasksInProject: 'No tasks yet. Click "Add Task" to get started.',
    progress: 'Progress',
    tasks: 'Tasks',
    taskCount: '{count} tasks',
    tasksCompleted: '{count} completed',
    tasksOverdue: '{count} overdue',
    projectProgress: '{percent}% done',

    // Project page
    projectList: 'Project List',
    projectCount: '({count} projects)',
    createProject: 'New Project',
    editProject: 'Edit Project',
    deleteProject: 'Delete Project',
    projectName: 'Project Name *',
    projectShortName: 'Short Name *',
    projectFullName: 'Full Name',
    startDate: 'Start Date *',
    duration: 'Duration (days) *',
    completionTime: 'Completion Date',
    autoCalculate: 'Auto-calculate if empty',
    owner: 'Owner',
    projectLink: 'Project Link',
    projectDescription: 'Description',
    createButton: 'Create Project',
    saveButton: 'Save Changes',
    cancel: 'Cancel',
    createSuccess: 'Project created successfully',
    updateSuccess: 'Project updated successfully',
    deleteConfirm: 'Delete project "{name}"?',
    deleteSuccess: 'Deleted',
    startLabel: 'Start',
    durationLabel: 'Duration',
    taskList: 'Task List',
    addTask: 'Add Task',
    exportTask: 'Export Tasks',
    importTask: 'Import Tasks',

    // Task page
    timeView: 'By Time',
    projectView: 'By Project',
    today: 'Today',
    near3days: '3 Days',
    near1week: '1 Week',
    favorites: 'Favorites',
    overdueTasks: 'Overdue',
    upcomingTasks: 'Upcoming',
    completedTasks: 'Completed',
    todayDue: 'Due Today',

    // Task card
    todo: 'To Do',
    inProgress: 'In Progress',
    done: 'Done',
    taskOverdue: 'Task Overdue',
    taskDueToday: 'Due Today',
    taskDueTomorrow: 'Due Tomorrow',
    dueSoon: 'Due Soon',
    keyPoints: 'Key Points',
    editTask: 'Edit Task',
    deleteTask: 'Delete Task',
    completeTask: 'Complete',
    reopenTask: 'Reopen',
    taskCreated: 'Task created successfully',
    taskDeleted: 'Deleted',
    progressUpdated: 'Progress updated',
    statusUpdated: 'Status updated',
    taskCompleted: 'Task completed ✓',
    taskReopened: 'Task reopened',
    saveFailed: 'Save failed',
    updateFailed: 'Update failed',
    deleteFailed: 'Delete failed',
    operationFailed: 'Operation failed',

    // Dialog
    addTaskTitle: 'Add Task · {project}',
    editTaskTitle: 'Edit Task',
    createProjectTitle: 'New Project',
    editProjectTitle: 'Edit Project',
    importTaskTitle: 'Import Tasks · {project}',
    taskName: 'Task Name *',
    taskStartDate: 'Start Date *',
    taskEndDate: 'End Date',
    taskDuration: 'Duration (days)',
    includeWeekend: 'Include Weekends',
    includeWeekendDesc: 'Duration includes weekends',
    excludeWeekendDesc: 'Duration is workdays only (default)',

    // Import/Export
    uploadCsv: 'Please upload a CSV file with columns: Task Name, Start Date, End Date, Duration (days), Include Weekends, Key Points',
    importSuccess: 'Successfully imported {count} tasks',
    importFailed: 'Import failed',
    exportSuccess: 'Export successful',
    exportFailed: 'Export failed',
    invalidCsv: 'Invalid CSV file',
    invalidCsvFormat: 'Invalid CSV format. Missing required columns.',
    noValidData: 'No valid task data',

    // Validation
    nameRequired: 'Please enter project name',
    taskNameRequired: 'Please enter task name',

    // General
    loading: 'Loading...',
    creating: 'Creating...',
    saving: 'Saving...',
    version: 'v1.0 · Personal',
  },
} as const

export type TranslationKey = keyof typeof translations.zh

export function t(key: TranslationKey, lang: Language, params?: Record<string, string | number>): string {
  let text: string = translations[lang][key] || translations.zh[key] || key
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v))
    })
  }
  return text
}
