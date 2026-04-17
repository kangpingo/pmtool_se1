import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const projectTemplates = [
  { name: '用户认证系统', fullName: '用户认证与授权管理系统', owner: '张三' },
  { name: 'API网关服务', fullName: '微服务API网关', owner: '李四' },
  { name: '数据同步平台', fullName: '跨系统数据同步平台', owner: '王五' },
  { name: '日志监控系统', fullName: '应用日志监控与分析系统', owner: '赵六' },
  { name: '配置管理中心', fullName: '分布式配置管理中心', owner: '钱七' },
  { name: '消息队列服务', fullName: '异步消息队列服务', owner: '孙八' },
  { name: '缓存优化系统', fullName: 'Redis缓存优化方案', owner: '周九' },
  { name: 'CI/CD流水线', fullName: '持续集成与持续部署流水线', owner: '吴十' },
  { name: '数据库迁移工具', fullName: '多数据库迁移工具', owner: '郑一' },
  { name: '接口文档平台', fullName: 'API接口文档管理平台', owner: '陈二' },
  { name: '支付网关', fullName: '第三方支付集成网关', owner: '刘三' },
  { name: '短信服务平台', fullName: '短信发送与验证平台', owner: '周四' },
  { name: '邮件服务', fullName: '企业邮件推送服务', owner: '吴五' },
  { name: '文件存储服务', fullName: '分布式文件存储系统', owner: '郑六' },
  { name: '搜索服务', fullName: '全文搜索与索引服务', owner: '王七' },
  { name: '推荐系统', fullName: '智能推荐算法系统', owner: '冯八' },
  { name: '数据分析平台', fullName: '用户行为数据分析', owner: '陈九' },
  { name: '权限管理系统', fullName: 'RBAC权限控制系统', owner: '沈十' },
  { name: '任务调度系统', fullName: '分布式任务调度平台', owner: '韩一' },
  { name: '服务监控平台', fullName: '微服务健康监控', owner: '杨二' },
]

const taskTemplates = [
  '需求分析', '技术方案设计', '数据库设计', '接口定义', '功能开发', '单元测试',
  '集成测试', '代码审查', '性能优化', '安全加固', '文档编写', '部署上线',
  '用户验收', '问题修复', '版本更新', '配置变更', '环境搭建', '数据迁移',
  '监控告警配置', '日志接入', '权限配置', '缓存策略设计', '负载均衡配置',
  '容器化部署', '集群扩容', '压测调优', '灰度发布', '回滚方案制定', '灾备演练',
]

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export async function POST(request: Request) {
  try {
    const { count, mode } = await request.json()

    if (!count || count < 1 || count > 20) {
      return NextResponse.json({ error: 'Invalid count' }, { status: 400 })
    }

    // Clear existing data if overwrite mode
    if (mode === 'overwrite') {
      await prisma.reply.deleteMany()
      await prisma.task.deleteMany()
      await prisma.project.deleteMany()
    }

    const startDate = new Date('2026-01-01')
    const endDate = new Date('2026-12-31')
    let createdCount = 0

    // Select random templates for the requested count
    const shuffled = [...projectTemplates].sort(() => Math.random() - 0.5)
    const selectedTemplates = shuffled.slice(0, count)

    for (const projectInfo of selectedTemplates) {
      const projectStart = randomDate(startDate, endDate)
      const duration = randomInt(30, 180)
      const completionTime = Math.random() > 0.3
        ? new Date(projectStart.getTime() + duration * 24 * 60 * 60 * 1000)
        : null

      const project = await prisma.project.create({
        data: {
          name: projectInfo.name,
          fullName: projectInfo.fullName,
          plannedStartDate: projectStart,
          duration: duration,
          description: `${projectInfo.fullName}开发任务`,
          owner: projectInfo.owner,
          link: 'https://github.com/storyeast',
          progress: completionTime ? 100 : Math.round(randomInt(0, 95) / 10) * 10,
          completionTime: completionTime,
        }
      })

      const taskCount = randomInt(5, 30)
      createdCount++

      for (let i = 0; i < taskCount; i++) {
        const taskStart = new Date(projectStart.getTime() + Math.random() * duration * 24 * 60 * 60 * 1000 * 0.8)
        const taskDuration = randomInt(1, 14)
        const taskEnd = new Date(taskStart.getTime() + taskDuration * 24 * 60 * 60 * 1000)
        const includeWeekend = Math.random() > 0.7

        const statuses = ['TODO', 'IN_PROGRESS', 'DONE']
        const rand = Math.random()
        let status = 'TODO'
        if (rand < 0.5) status = 'DONE'
        else if (rand < 0.8) status = 'IN_PROGRESS'

        const progress = status === 'DONE' ? 100 : status === 'IN_PROGRESS' ? Math.round(randomInt(20, 80) / 10) * 10 : 0
        const actualFinishDate = status === 'DONE' ? taskEnd : null

        await prisma.task.create({
          data: {
            name: `${randomChoice(taskTemplates)}-${i + 1}`,
            plannedStartDate: taskStart,
            plannedEndDate: taskEnd,
            actualFinishDate: actualFinishDate,
            includeWeekend: includeWeekend,
            duration: taskDuration,
            keyPoints: Math.random() > 0.7 ? '重点关注任务' : null,
            status: status,
            progress: progress,
            favorite: Math.random() > 0.9,
            projectId: project.id,
          }
        })
      }
    }

    return NextResponse.json({ success: true, count: createdCount })
  } catch (error) {
    console.error('Init data error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
