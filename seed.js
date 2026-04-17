const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const projectNames = [
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
]

const taskTemplates = [
  '需求分析', '技术方案设计', '数据库设计', '接口定义', '功能开发', '单元测试',
  '集成测试', '代码审查', '性能优化', '安全加固', '文档编写', '部署上线',
  '用户验收', '问题修复', '版本更新', '配置变更', '环境搭建', '数据迁移',
  '监控告警配置', '日志接入', '权限配置', '缓存策略设计', '负载均衡配置',
  '容器化部署', '集群扩容', '压测调优', '灰度发布', '回滚方案制定', '灾备演练',
  '自动化测试', '运维脚本编写', '故障排查', '性能分析', '代码重构', '设计模式应用',
  '微服务拆分', '服务治理', '限流熔断实现', '链路追踪集成', '服务注册发现',
  '配置热更新', '健康检查实现', '指标采集', '告警规则配置', '日志采集优化',
]

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function main() {
  console.log('开始生成数据...')

  const startDate = new Date('2026-01-01')
  const endDate = new Date('2026-12-31')

  for (const projectInfo of projectNames) {
    const projectStart = randomDate(startDate, endDate)
    const duration = randomInt(30, 180)
    const completionTime = Math.random() > 0.3 ? new Date(projectStart.getTime() + duration * 24 * 60 * 60 * 1000) : null

    const project = await prisma.project.create({
      data: {
        name: projectInfo.name,
        fullName: projectInfo.fullName,
        plannedStartDate: projectStart,
        duration: duration,
        description: `${projectInfo.fullName}开发任务`,
        owner: projectInfo.owner,
        link: 'https://github.com/storyeast',
        progress: completionTime ? 100 : randomInt(0, 95),
        completionTime: completionTime,
      }
    })

    const taskCount = randomInt(5, 100)
    console.log(`创建项目: ${projectInfo.name}, 任务数: ${taskCount}`)

    for (let i = 0; i < taskCount; i++) {
      const taskStart = new Date(projectStart.getTime() + Math.random() * duration * 24 * 60 * 60 * 1000 * 0.8)
      const taskDuration = randomInt(1, 14)
      const taskEnd = new Date(taskStart.getTime() + taskDuration * 24 * 60 * 60 * 1000)
      const includeWeekend = Math.random() > 0.7

      const statuses = ['TODO', 'IN_PROGRESS', 'DONE']
      const statusWeights = [0.2, 0.3, 0.5]
      let status = 'TODO'
      const rand = Math.random()
      if (rand < statusWeights[2]) {
        status = 'DONE'
      } else if (rand < statusWeights[2] + statusWeights[1]) {
        status = 'IN_PROGRESS'
      }

      const progress = status === 'DONE' ? 100 : status === 'IN_PROGRESS' ? randomInt(20, 80) : 0
      // 实际完成日期：如果任务已完成，则设置为实际完成时间；否则为null
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

  // 创建留言板示例数据
  await prisma.message.create({
    data: {
      content: '欢迎使用项目管理系统的留言板功能，有任何问题可以在这里留言反馈。',
      author: '管理员',
    }
  })

  console.log('数据生成完成!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
