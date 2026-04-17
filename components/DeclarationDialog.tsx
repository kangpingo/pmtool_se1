'use client'
import { useApp } from './AppProvider'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Heart } from 'lucide-react'

interface DeclarationDialogProps {
  open: boolean
  onClose: () => void
}

export default function DeclarationDialog({ open, onClose }: DeclarationDialogProps) {
  const { lang } = useApp()

  const zhContent = {
    intro: '本系统由作者康平（Calen）根据个人项目管理经验与想法，结合 AI 工具创作而成。',
    features: '功能特点',
    featureItems: ['可视化任务管理与看板视图', '项目进度跟踪与统计', '团队协作与留言交流', '数据初始化与管理'],
    usage: '使用说明',
    usageText: '如您在使用本系统或借鉴其功能设计，欢迎注明来源，功能问题可联系作者交流探讨。',
    contact: '联系作者',
    email: 'kangpingchn@hotmail.com',
  }

  const enContent = {
    intro: 'This system was created by KangPing (Calen) based on personal project management experience and ideas, with the assistance of AI tools.',
    features: 'Features',
    featureItems: ['Visual task management & kanban view', 'Project progress tracking & statistics', 'Team collaboration & messaging', 'Data initialization & management'],
    usage: 'Usage',
    usageText: 'If you use this system or reference its design, you are welcome to mention me. Feel free to contact me for feature discussions.',
    contact: 'Contact',
    email: 'kangpingchn@hotmail.com',
  }

  const content = lang === 'zh' ? zhContent : enContent

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden p-0 [&>button]:hidden dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-500 to-rose-500">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-white" />
            <span className="text-lg font-bold text-white">{lang === 'zh' ? '关于系统' : 'About'}</span>
          </div>
        </div>
        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(85vh-60px)] p-6 space-y-4">
          <p className="text-gray-700 dark:text-gray-200">{content.intro}</p>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">{content.features}</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
              {content.featureItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">{content.usage}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{content.usageText}</p>
          </div>
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{content.contact}</p>
            <p className="text-sm text-blue-500">{content.email}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
