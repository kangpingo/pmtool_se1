'use client'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import MessageBoard from './MessageBoard'
import { MessageSquare } from 'lucide-react'

interface MessageBoardDialogProps {
  open: boolean
  onClose: () => void
}

export default function MessageBoardDialog({ open, onClose }: MessageBoardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden p-0 [&>button]:hidden dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-500">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-white" />
            <span className="text-lg font-bold text-white">留言板</span>
          </div>
        </div>
        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(85vh-60px)]">
          <MessageBoard />
        </div>
      </DialogContent>
    </Dialog>
  )
}
