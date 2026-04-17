import { PrismaClient } from '@prisma/client'
import { addDays, isWeekend } from 'date-fns'

const prisma = new PrismaClient()

function calcEndDate(startDate: Date, duration: number, includeWeekend: boolean): Date {
  if (includeWeekend) return addDays(startDate, duration - 1)
  let remaining = duration
  let current = new Date(startDate)
  while (remaining > 1) {
    current = addDays(current, 1)
    if (!isWeekend(current)) remaining--
  }
  return current
}

function wd(dateStr: string, days: number, includeWeekend = false, fav = false) {
  const start = new Date(dateStr)
  return { plannedStartDate: start, plannedEndDate: calcEndDate(start, days, includeWeekend), duration: days, includeWeekend, favorite: fav }
}

async function main() {
  // 清空旧数据
  await prisma.task.deleteMany()
  await prisma.project.deleteMany()

  console.log('🌱 开始初始化数据...\n')

  // ── 项目1：StoryEAST 品牌官网改版 ──
  const p1 = await prisma.project.create({
    data: {
      name: 'StoryEAST 品牌官网改版',
      plannedStartDate: new Date('2026-03-10'),
      duration: 60,
      description: '官网全面升级，强化品牌调性与用户转化路径',
      owner: '张明',
      completionTime: addDays(new Date('2026-03-10'), 59),
      tasks: {
        create: [
          {
            name: '竞品调研与用户访谈',
            ...wd('2026-03-10', 5),
            keyPoints: '重点访谈 10 名现有客户，收集对官网信息架构的改进建议',
            status: 'DONE',
          },
          {
            name: '信息架构梳理与页面规划',
            ...wd('2026-03-17', 4),
            keyPoints: '确定首页、产品、案例、关于、联系 5 大板块的内容框架',
            status: 'DONE',
          },
          {
            name: 'UI 设计稿（首页 + 产品页）',
            ...wd('2026-03-21', 8),
            keyPoints: '设计风格需与现有 VI 保持一致；首页需突出"东方叙事"主视觉',
            status: 'DONE',
          },
          {
            name: '前端开发：首页 & 导航',
            ...wd('2026-04-01', 6),
            keyPoints: '需兼容移动端；动效不超过 2 个，保持页面轻量',
            status: 'IN_PROGRESS',
          },
          {
            name: '前端开发：产品与案例页',
            ...wd('2026-04-09', 5),
            keyPoints: '案例页支持按行业筛选；图片需 WebP 格式优化',
            status: 'IN_PROGRESS',
            favorite: true,
          },
          {
            name: 'SEO 优化与关键词布局',
            ...wd('2026-04-16', 3),
            keyPoints: '目标关键词：文旅策划、东方美学、品牌叙事；TDK 需逐页设置',
            status: 'TODO',
          },
          {
            name: '测试与 Bug 修复',
            ...wd('2026-04-21', 4),
            keyPoints: '测试设备：iPhone 15、华为 Mate60、iPad；重点检查表单提交流程',
            status: 'TODO',
          },
          {
            name: '上线部署与数据验收',
            ...wd('2026-04-27', 2),
            keyPoints: 'GA4 埋点验证；确认 CDN 缓存策略；备份旧站数据',
            status: 'TODO',
          },
        ],
      },
    },
  })
  console.log(`✓ 项目1：${p1.name}（8 个任务）`)

  // ── 项目2：东方音乐节营销推广 ──
  const p2 = await prisma.project.create({
    data: {
      name: '东方音乐节营销推广',
      plannedStartDate: new Date('2026-03-20'),
      duration: 45,
      description: '2026 东方音乐节全渠道营销策划与执行',
      owner: '李霞',
      completionTime: addDays(new Date('2026-03-20'), 44),
      tasks: {
        create: [
          {
            name: '营销策略方案制定',
            ...wd('2026-03-20', 4),
            keyPoints: '明确目标受众（25-40岁文化消费群体）、渠道组合与预算分配',
            status: 'DONE',
          },
          {
            name: '视觉物料设计（KV 主视觉）',
            ...wd('2026-03-25', 5),
            keyPoints: 'KV 需体现东方意境，避免过度商业化；需出竖版、横版两套',
            status: 'DONE',
          },
          {
            name: '小红书内容矩阵策划',
            ...wd('2026-04-01', 4),
            keyPoints: '规划 20 篇笔记，含 3 篇探店类、5 篇艺人故事类、12 篇活动预告类',
            status: 'IN_PROGRESS',
            favorite: true,
          },
          {
            name: '微博话题运营与 KOL 合作',
            ...wd('2026-04-07', 5),
            keyPoints: '确定 #东方音乐节2026# 话题；接触 3 位文化类 KOL，预算控制在 8 万内',
            status: 'IN_PROGRESS',
          },
          {
            name: '预售票务系统上线',
            ...wd('2026-04-14', 3),
            keyPoints: '对接大麦平台；设置早鸟价（9 折），仅限首 500 张',
            status: 'TODO',
          },
          {
            name: '线下物料制作与配送',
            ...wd('2026-04-17', 4, true),
            keyPoints: '物料清单：易拉宝×20、海报×500、门票手环×2000；提前 1 周到场',
            status: 'TODO',
          },
          {
            name: '活动现场直播统筹',
            ...wd('2026-04-28', 2),
            keyPoints: '协调 B 站与抖音双平台直播；预计同时在线 5000 人',
            status: 'TODO',
          },
        ],
      },
    },
  })
  console.log(`✓ 项目2：${p2.name}（7 个任务）`)

  // ── 项目3：企业内训体系搭建 ──
  const p3 = await prisma.project.create({
    data: {
      name: '企业内训体系搭建',
      plannedStartDate: new Date('2026-04-01'),
      duration: 30,
      description: '针对核心团队搭建标准化内训课程体系',
      owner: '王强',
      completionTime: addDays(new Date('2026-04-01'), 29),
      tasks: {
        create: [
          {
            name: '培训需求调研',
            ...wd('2026-04-01', 3),
            keyPoints: '对 5 个部门负责人做一对一访谈，收集技能短板与学习意愿',
            status: 'DONE',
          },
          {
            name: '课程体系框架设计',
            ...wd('2026-04-07', 4),
            keyPoints: '规划通识课、专项课、管理课三条培养路径；每条路径 6-8 个模块',
            status: 'IN_PROGRESS',
          },
          {
            name: '第一批课程内容开发',
            ...wd('2026-04-13', 5),
            keyPoints: '优先开发"项目管理"与"创意简报"两门；每门课不少于 4 课时',
            status: 'IN_PROGRESS',
          },
          {
            name: '讲师资源整合与签约',
            ...wd('2026-04-16', 3),
            keyPoints: '目标：3 位内部讲师 + 2 位外部专家讲师；签约前确认版权归属',
            status: 'TODO',
          },
          {
            name: '线上学习平台配置',
            ...wd('2026-04-21', 4),
            keyPoints: '使用企业微信学习平台；完成课程上传、权限设置、进度跟踪',
            status: 'TODO',
          },
          {
            name: '试运行与效果评估',
            ...wd('2026-04-27', 3),
            keyPoints: '首批 20 名学员参与；设置满意度问卷，80分以上视为达标',
            status: 'TODO',
          },
        ],
      },
    },
  })
  console.log(`✓ 项目3：${p3.name}（6 个任务）`)

  // ── 项目4：Q2 季度复盘与 Q3 规划 ──
  const p4 = await prisma.project.create({
    data: {
      name: 'Q2 复盘 & Q3 计划制定',
      plannedStartDate: new Date('2026-04-13'),
      duration: 10,
      description: '季度经营复盘与下季度目标拆解',
      owner: '张明',
      completionTime: addDays(new Date('2026-04-13'), 9),
      tasks: {
        create: [
          {
            name: '各部门 Q2 数据汇总',
            ...wd('2026-04-13', 2),
            keyPoints: '收集：营收、项目完成率、人力投入、客户满意度 4 项核心指标',
            status: 'DONE',
          },
          {
            name: 'Q2 复盘会议',
            ...wd('2026-04-15', 1),
            keyPoints: '时长 3 小时；复盘模板：亮点 → 问题 → 根因 → 改进措施',
            status: 'TODO',
            favorite: true,
          },
          {
            name: 'Q3 OKR 制定与对齐',
            ...wd('2026-04-16', 3),
            keyPoints: '公司层面 O 不超过 3 个，每个 O 对应 2-4 个 KR；需全员知悉',
            status: 'TODO',
          },
          {
            name: 'Q3 项目立项与资源分配',
            ...wd('2026-04-21', 2),
            keyPoints: '优先级排序：战略价值 × 可行性矩阵；人力缺口需提前招聘',
            status: 'TODO',
          },
        ],
      },
    },
  })
  console.log(`✓ 项目4：${p4.name}（4 个任务）`)

  const total = await prisma.task.count()
  console.log(`\n🎉 数据初始化完成！共 4 个项目，${total} 个任务`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
