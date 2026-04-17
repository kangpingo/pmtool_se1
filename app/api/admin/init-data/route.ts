import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const zhITProjectTemplates = [
  { name: '用户认证系统项目', fullName: '用户认证与授权管理系统', owner: '张三' },
  { name: 'API网关服务项目', fullName: '微服务API网关', owner: '李四' },
  { name: '数据同步平台项目', fullName: '跨系统数据同步平台', owner: '王五' },
  { name: '日志监控系统项目', fullName: '应用日志监控与分析系统', owner: '赵六' },
  { name: '配置管理中心项目', fullName: '分布式配置管理中心', owner: '钱七' },
  { name: '消息队列服务项目', fullName: '异步消息队列服务', owner: '孙八' },
  { name: '缓存优化系统项目', fullName: 'Redis缓存优化方案', owner: '周九' },
  { name: 'CI/CD流水线项目', fullName: '持续集成与持续部署流水线', owner: '吴十' },
  { name: '数据库迁移工具项目', fullName: '多数据库迁移工具', owner: '郑一' },
  { name: '接口文档平台项目', fullName: 'API接口文档管理平台', owner: '陈二' },
  { name: '支付网关项目', fullName: '第三方支付集成网关', owner: '刘三' },
  { name: '短信服务平台项目', fullName: '短信发送与验证平台', owner: '周四' },
  { name: '邮件服务项目', fullName: '企业邮件推送服务', owner: '吴五' },
  { name: '文件存储服务项目', fullName: '分布式文件存储系统', owner: '郑六' },
  { name: '搜索服务项目', fullName: '全文搜索与索引服务', owner: '王七' },
  { name: '推荐系统项目', fullName: '智能推荐算法系统', owner: '冯八' },
  { name: '数据分析平台项目', fullName: '用户行为数据分析', owner: '陈九' },
  { name: '权限管理系统项目', fullName: 'RBAC权限控制系统', owner: '沈十' },
  { name: '任务调度系统项目', fullName: '分布式任务调度平台', owner: '韩一' },
  { name: '服务监控平台项目', fullName: '微服务健康监控', owner: '杨二' },
  { name: '容器编排平台项目', fullName: 'Kubernetes容器编排系统', owner: '朱一' },
  { name: '分布式事务平台项目', fullName: 'Seata分布式事务方案', owner: '秦二' },
  { name: '链路追踪系统项目', fullName: '全链路追踪与监控', owner: '许三' },
  { name: '配置热更新平台项目', fullName: '运行时配置热更新系统', owner: '何四' },
  { name: '网关鉴权服务项目', fullName: 'API网关统一鉴权', owner: '罗五' },
]

const zhEngineeringProjectTemplates = [
  { name: '智慧园区项目', fullName: '智慧园区信息化建设', owner: '陈建设' },
  { name: '数据中心迁移项目', fullName: '企业数据中心迁移工程', owner: '李工程' },
  { name: '网络改造项目', fullName: '园区网络升级改造', owner: '王实施' },
  { name: '楼宇智能化工程项目', fullName: '智能楼宇系统集成', owner: '张项目' },
  { name: '机房建设项目', fullName: 'B级机房建设实施', owner: '刘施工' },
  { name: '视频监控升级项目', fullName: '高清视频监控系统', owner: '赵监工' },
  { name: '门禁系统部署项目', fullName: '人脸识别门禁系统', owner: '钱现场' },
  { name: '广播系统改造项目', fullName: '公共广播系统升级', owner: '孙工程' },
  { name: '考勤系统建设项目', fullName: '智能考勤管理系统', owner: '周五金' },
  { name: '会议室改造项目', fullName: '智能会议室系统集成', owner: '吴施工' },
  { name: '停车场系统项目', fullName: '智慧停车场管理系统', owner: '郑项目' },
  { name: '能耗监控系统项目', fullName: '建筑能耗监测平台', owner: '冯监工' },
  { name: '消防系统升级项目', fullName: '智能消防报警系统', owner: '陈工程' },
  { name: '电梯监控系统项目', fullName: '电梯物联网监控', owner: '沈实施' },
  { name: '给排水系统项目', fullName: '智慧水务管理系统', owner: '韩项目' },
  { name: '暖通空调系统项目', fullName: 'HVAC智能控制系统', owner: '杨施工' },
  { name: '电力监控系统项目', fullName: '智能电力监控系统', owner: '朱监工' },
  { name: '气体消防系统项目', fullName: '气体灭火监控系统', owner: '秦工程' },
  { name: '防雷接地系统项目', fullName: '防雷接地工程', owner: '许实施' },
  { name: '综合布线系统项目', fullName: '光纤网络布线工程', owner: '何项目' },
  { name: '信息发布系统项目', fullName: '多媒体信息发布系统', owner: '罗施工' },
  { name: '排队叫号系统项目', fullName: '智能排队管理系统', owner: '蒋监工' },
  { name: '婴儿防盗系统项目', fullName: '婴儿安全防盗系统', owner: '沈工程' },
  { name: '寻车系统部署项目', fullName: '反向寻车系统', owner: '韩实施' },
  { name: '引导机器人项目', fullName: '服务机器人引导系统', owner: '杨项目' },
]

const enITProjectTemplates = [
  { name: 'User Auth System Project', fullName: 'User Authentication & Authorization System', owner: 'Zhang San' },
  { name: 'API Gateway Project', fullName: 'Microservices API Gateway', owner: 'Li Si' },
  { name: 'Data Sync Platform Project', fullName: 'Cross-System Data Synchronization', owner: 'Wang Wu' },
  { name: 'Log Monitoring Project', fullName: 'Application Log Monitoring & Analysis', owner: 'Zhao Liu' },
  { name: 'Config Center Project', fullName: 'Distributed Configuration Management', owner: 'Qian Qi' },
  { name: 'Message Queue Project', fullName: 'Async Message Queue Service', owner: 'Sun Ba' },
  { name: 'Cache System Project', fullName: 'Redis Cache Optimization', owner: 'Zhou Jiu' },
  { name: 'CI/CD Pipeline Project', fullName: 'Continuous Integration & Deployment', owner: 'Wu Shi' },
  { name: 'DB Migration Project', fullName: 'Multi-Database Migration Tool', owner: 'Zheng Yi' },
  { name: 'API Documentation Project', fullName: 'API Documentation Platform', owner: 'Chen Er' },
  { name: 'Payment Gateway Project', fullName: 'Third-Party Payment Integration', owner: 'Liu San' },
  { name: 'SMS Platform Project', fullName: 'SMS Sending & Verification Platform', owner: 'Zhou Si' },
  { name: 'Email Service Project', fullName: 'Enterprise Email Push Service', owner: 'Wu Wu' },
  { name: 'File Storage Project', fullName: 'Distributed File Storage System', owner: 'Zheng Liu' },
  { name: 'Search Service Project', fullName: 'Full-Text Search & Indexing', owner: 'Wang Qi' },
  { name: 'Recommendation Project', fullName: 'Smart Recommendation System', owner: 'Feng Ba' },
  { name: 'Data Analytics Project', fullName: 'User Behavior Data Analysis', owner: 'Chen Jiu' },
  { name: 'RBAC System Project', fullName: 'Role-Based Access Control', owner: 'Shen Shi' },
  { name: 'Task Scheduler Project', fullName: 'Distributed Task Scheduling', owner: 'Han Yi' },
  { name: 'Service Monitor Project', fullName: 'Microservice Health Monitoring', owner: 'Yang Er' },
  { name: 'Container Orchestration Project', fullName: 'Kubernetes Orchestration System', owner: 'Zhu Yi' },
  { name: 'Distributed Transaction Project', fullName: 'Seata Distributed Transaction', owner: 'Qin Er' },
  { name: 'Tracing System Project', fullName: 'Full-Link Tracking & Monitoring', owner: 'Xu San' },
  { name: 'Hot Config Update Project', fullName: 'Runtime Configuration Update', owner: 'He Si' },
  { name: 'Gateway Auth Project', fullName: 'API Gateway Unified Auth', owner: 'Luo Wu' },
]

const enEngineeringProjectTemplates = [
  { name: 'Smart Park Project', fullName: 'Smart Park IT Infrastructure', owner: 'Chen Jianshe' },
  { name: 'Data Center Migration Project', fullName: 'Enterprise Data Center Migration', owner: 'Li Gongcheng' },
  { name: 'Network Upgrade Project', fullName: 'Campus Network Upgrade Project', owner: 'Wang Shishi' },
  { name: 'Building Automation Project', fullName: 'Smart Building System Integration', owner: 'Zhang Xiangmu' },
  { name: 'Server Room Construction Project', fullName: 'Tier-B Data Center Construction', owner: 'Liu Shigong' },
  { name: 'Video Surveillance Project', fullName: 'HD Video Surveillance System', owner: 'Zhao Jiangong' },
  { name: 'Access Control Project', fullName: 'Face Recognition Access Control', owner: 'Qian Xianchang' },
  { name: 'Public Address System Project', fullName: 'Public Broadcasting Upgrade', owner: 'Sun Gongcheng' },
  { name: 'Attendance System Project', fullName: 'Smart Attendance Management', owner: 'Zhou Zhujin' },
  { name: 'Conference Room Project', fullName: 'Smart Conference Room System', owner: 'Wu Shigong' },
  { name: 'Parking System Project', fullName: 'Smart Parking Management', owner: 'Zheng Xiangmu' },
  { name: 'Energy Monitoring Project', fullName: 'Building Energy Monitoring', owner: 'Feng Jiangong' },
  { name: 'Fire Alarm System Project', fullName: 'Intelligent Fire Alarm System', owner: 'Chen Gongcheng' },
  { name: 'Elevator Monitoring Project', fullName: 'Elevator IoT Monitoring', owner: 'Shen Shishi' },
  { name: 'Water Management Project', fullName: 'Smart Water Management System', owner: 'Han Xiangmu' },
  { name: 'HVAC System Project', fullName: 'HVAC Intelligent Control', owner: 'Yang Shigong' },
  { name: 'Power Monitoring Project', fullName: 'Intelligent Power Monitoring', owner: 'Zhu Jiangong' },
  { name: 'Gas Suppression Project', fullName: 'Gas Fire Extinguishing System', owner: 'Qin Gongcheng' },
  { name: 'Lightning Protection Project', fullName: 'Lightning Grounding System', owner: 'Xu Shishi' },
  { name: 'Structured Cabling Project', fullName: 'Fiber Network Cabling', owner: 'He Xiangmu' },
  { name: 'Info Display Project', fullName: 'Digital Signage System', owner: 'Luo Shigong' },
  { name: 'Queue Management Project', fullName: 'Intelligent Queue System', owner: 'Jiang Jiangong' },
  { name: 'Baby Tracking Project', fullName: 'Baby Security & Tracking System', owner: 'Shen Gongcheng' },
  { name: 'Car Finder Project', fullName: 'Reverse Car Finding System', owner: 'Han Shishi' },
  { name: 'Guide Robot Project', fullName: 'Service Robot Guidance System', owner: 'Yang Xiangmu' },
]

const zhTaskTemplates = [
  '需求分析', '技术方案设计', '数据库设计', '接口定义', '功能开发', '单元测试',
  '集成测试', '代码审查', '性能优化', '安全加固', '文档编写', '部署上线',
  '用户验收', '问题修复', '版本更新', '配置变更', '环境搭建', '数据迁移',
  '监控告警配置', '日志接入', '权限配置', '缓存策略设计', '负载均衡配置',
  '容器化部署', '集群扩容', '压测调优', '灰度发布', '回滚方案制定', '灾备演练',
]

const enTaskTemplates = [
  'Requirements Analysis', 'Technical Design', 'Database Design', 'API Definition', 'Feature Development', 'Unit Testing',
  'Integration Testing', 'Code Review', 'Performance Optimization', 'Security Hardening', 'Documentation', 'Deployment',
  'User Acceptance', 'Bug Fix', 'Version Update', 'Config Change', 'Environment Setup', 'Data Migration',
  'Monitoring Setup', 'Log Integration', 'Permission Config', 'Cache Strategy', 'Load Balancing',
  'Container Deployment', 'Cluster Scaling', 'Stress Testing', 'Canary Release', 'Rollback Plan', 'DR Drill',
]

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export async function POST(request: Request) {
  try {
    const { lang = 'zh', count = 10, mode = 'append' } = await request.json()

    // Validate count
    if (![5, 10, 20].includes(count)) {
      return NextResponse.json({ error: 'Invalid count. Must be 5, 10, or 20' }, { status: 400 })
    }

    // Clear existing data if overwrite mode
    if (mode === 'overwrite') {
      await prisma.reply.deleteMany()
      await prisma.task.deleteMany()
      await prisma.project.deleteMany()
    }

    // Select templates based on language
    const itTemplates = lang === 'zh' ? zhITProjectTemplates : enITProjectTemplates
    const engTemplates = lang === 'zh' ? zhEngineeringProjectTemplates : enEngineeringProjectTemplates
    const taskTemplates = lang === 'zh' ? zhTaskTemplates : enTaskTemplates

    // Combine and shuffle templates (IT + Engineering mixed)
    const allTemplates = [...itTemplates, ...engTemplates]
    const shuffled = allTemplates.sort(() => Math.random() - 0.5)
    const selectedTemplates = shuffled.slice(0, count)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let createdCount = 0

    for (const projectInfo of selectedTemplates) {
      // 20% chance: project with no tasks (not started)
      const hasNoTasks = Math.random() < 0.2

      // Project spans 30-180 days starting from past to future
      const projectStartOffset = randomInt(-180, 60)
      const projectStart = addDays(today, projectStartOffset)
      const duration = randomInt(30, 180)

      if (hasNoTasks) {
        // Create project with no tasks - progress = 0
        await prisma.project.create({
          data: {
            name: projectInfo.name,
            fullName: projectInfo.fullName,
            plannedStartDate: projectStart,
            duration: duration,
            description: `${projectInfo.fullName}${lang === 'zh' ? '开发任务' : ' Development'}`,
            owner: projectInfo.owner,
            link: 'https://github.com/storyeast',
            progress: 0,
            completionTime: null,
          }
        })
        createdCount++
      } else {
        // Create project with tasks
        const project = await prisma.project.create({
          data: {
            name: projectInfo.name,
            fullName: projectInfo.fullName,
            plannedStartDate: projectStart,
            duration: duration,
            description: `${projectInfo.fullName}${lang === 'zh' ? '开发任务' : ' Development'}`,
            owner: projectInfo.owner,
            link: 'https://github.com/storyeast',
            progress: 0,
            completionTime: null,
          }
        })

        // 8-15 tasks per project to ensure variety
        const taskCount = randomInt(8, 15)
        const taskProgressList: number[] = []
        createdCount++

        // Distribute tasks across different date scenarios
        const dateScenarios = [
          { label: 'overdue', daysOffset: randomInt(-60, -1), weight: 2 },      // Overdue
          { label: 'dueToday', daysOffset: 0, weight: 2 },                      // Due today
          { label: 'due3Days', daysOffset: randomInt(1, 3), weight: 2 },        // Due in 1-3 days
          { label: 'dueWeek', daysOffset: randomInt(4, 7), weight: 2 },          // Due in 4-7 days
          { label: 'future', daysOffset: randomInt(8, 60), weight: 2 },          // Future tasks
          { label: 'completed', daysOffset: randomInt(-30, -1), weight: 3 },      // Already completed (overdue but DONE)
        ]

        for (let i = 0; i < taskCount; i++) {
          // Pick a random date scenario based on weight
          const scenario = randomChoice(dateScenarios)
          const taskEndDate = addDays(today, scenario.daysOffset)
          const taskDuration = randomInt(1, 7)
          const taskStartDate = addDays(taskEndDate, -taskDuration)

          // Determine status based on scenario
          let status: string
          let progress: number
          let actualFinishDate: Date | null = null

          if (scenario.label === 'completed') {
            status = 'DONE'
            progress = 100
            actualFinishDate = addDays(taskEndDate, randomInt(-3, 0))
          } else if (scenario.label === 'overdue') {
            // 50% DONE (completed late), 30% IN_PROGRESS, 20% TODO
            const rand = Math.random()
            if (rand < 0.5) {
              status = 'DONE'
              progress = 100
              actualFinishDate = taskEndDate
            } else if (rand < 0.8) {
              status = 'IN_PROGRESS'
              progress = Math.round(randomInt(30, 80) / 10) * 10
            } else {
              status = 'TODO'
              progress = 0
            }
          } else {
            // Future or today due: 30% DONE, 50% IN_PROGRESS, 20% TODO
            const rand = Math.random()
            if (rand < 0.3) {
              status = 'DONE'
              progress = 100
              actualFinishDate = taskEndDate
            } else if (rand < 0.8) {
              status = 'IN_PROGRESS'
              progress = Math.round(randomInt(10, 80) / 10) * 10
            } else {
              status = 'TODO'
              progress = 0
            }
          }

          await prisma.task.create({
            data: {
              name: `${randomChoice(taskTemplates)}${lang === 'zh' ? '-' : ': '}${i + 1}`,
              plannedStartDate: taskStartDate,
              plannedEndDate: taskEndDate,
              actualFinishDate: actualFinishDate,
              includeWeekend: Math.random() > 0.5,
              duration: taskDuration,
              keyPoints: Math.random() > 0.7 ? (lang === 'zh' ? '重点关注任务' : 'Key Task') : null,
              status: status,
              progress: progress,
              favorite: Math.random() > 0.9,
              projectId: project.id,
            }
          })
          taskProgressList.push(progress)
        }

        // Calculate project progress as average of task progress, rounded to nearest 10
        const avgProgress = taskProgressList.length > 0
          ? Math.round(taskProgressList.reduce((a, b) => a + b, 0) / taskProgressList.length / 10) * 10
          : 0

        // Update project with calculated progress
        await prisma.project.update({
          where: { id: project.id },
          data: {
            progress: avgProgress,
            completionTime: avgProgress === 100
              ? addDays(projectStart, duration)
              : null
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
