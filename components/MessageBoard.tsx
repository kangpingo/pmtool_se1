'use client'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import { MessageSquare, Send, Trash2, Reply, Heart, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useApp } from './AppProvider'

interface ReplyType {
  id: string
  content: string
  author: string
  createdAt: string
  likes: number
  likedBy: string[]
}

interface MessageType {
  id: string
  content: string
  author: string
  createdAt: string
  replies: ReplyType[]
  likes: number
  likedBy: string[]
}

const labels = {
  zh: {
    title: '留言板',
    placeholder: '写下你的留言...',
    submit: '提交',
    replyPlaceholder: '写下你的回复...',
    reply: '回复',
    delete: '删除',
    noMessages: '暂无留言',
    replies: '回复',
    confirmDelete: '确定删除这条留言吗？',
    liked: '已赞',
    like: '赞',
  },
  en: {
    title: 'Message Board',
    placeholder: 'Write a message...',
    submit: 'Submit',
    replyPlaceholder: 'Write a reply...',
    reply: 'Reply',
    delete: 'Delete',
    noMessages: 'No messages yet',
    replies: 'Replies',
    confirmDelete: 'Delete this message?',
    liked: 'Liked',
    like: 'Like',
  },
}

export default function MessageBoard() {
  const { lang } = useApp()
  const t = labels[lang]
  const [messages, setMessages] = useState<MessageType[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const dateLocale = lang === 'zh' ? zhCN : enUS
  const currentUser = 'Calen'

  useEffect(() => {
    fetchMessages()
    const username = document.cookie.split(';').find(c => c.trim().startsWith('username='))?.split('=')[1]
    setIsAdmin(username === 'admin')
  }, [])

  async function fetchMessages() {
    try {
      const res = await fetch('/api/messages')
      if (res.ok) {
        const data = await res.json()
        // Ensure each message has likes and likedBy
        const normalizedData = data.map((m: any) => ({
          ...m,
          likes: m.likes ?? 0,
          likedBy: m.likedBy ?? [],
          replies: (m.replies || []).map((r: any) => ({
            ...r,
            likes: r.likes ?? 0,
            likedBy: r.likedBy ?? []
          }))
        }))
        setMessages(normalizedData)
        // Expand all replies by default
        const allIds = new Set<string>(normalizedData.map((m: MessageType) => m.id))
        setExpandedReplies(allIds)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSendMessage() {
    if (!newMessage.trim()) return
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage, author: currentUser })
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages(prev => [msg, ...prev])
        setNewMessage('')
        toast.success(lang === 'zh' ? '留言成功' : 'Message sent')
      } else {
        const err = await res.text()
        toast.error(lang === 'zh' ? `发送失败: ${err}` : `Failed: ${err}`)
      }
    } catch (err) {
      toast.error(lang === 'zh' ? `发送失败: ${err}` : `Failed: ${err}`)
    } finally {
      setSending(false)
    }
  }

  async function handleDeleteMessage(id: string) {
    if (!confirm(t.confirmDelete)) return
    try {
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id))
        toast.success(lang === 'zh' ? '已删除' : 'Deleted')
      } else {
        toast.error(lang === 'zh' ? '删除失败' : 'Failed to delete')
      }
    } catch {
      toast.error(lang === 'zh' ? '删除失败' : 'Failed to delete')
    }
  }

  async function handleSendReply(messageId: string) {
    if (!replyContent.trim()) return
    try {
      const res = await fetch(`/api/messages/${messageId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent, author: currentUser })
      })
      if (res.ok) {
        const reply = await res.json()
        setMessages(prev => prev.map(m => {
          if (m.id === messageId) {
            return { ...m, replies: [...m.replies, reply] }
          }
          return m
        }))
        setReplyContent('')
        setReplyingTo(null)
        toast.success(lang === 'zh' ? '回复成功' : 'Reply sent')
      } else {
        toast.error(lang === 'zh' ? '回复失败' : 'Failed to reply')
      }
    } catch {
      toast.error(lang === 'zh' ? '回复失败' : 'Failed to reply')
    }
  }

  function toggleLike(messageId: string, isReply: boolean, replyId?: string) {
    setMessages(prev => prev.map(m => {
      if (isReply) {
        if (m.id !== messageId) return m
        return {
          ...m,
          replies: m.replies.map(r => {
            if (r.id !== replyId) return r
            const liked = r.likedBy.includes(currentUser)
            return {
              ...r,
              likes: liked ? r.likes - 1 : r.likes + 1,
              likedBy: liked ? r.likedBy.filter(u => u !== currentUser) : [...r.likedBy, currentUser]
            }
          })
        }
      } else {
        if (m.id !== messageId) return m
        const liked = m.likedBy.includes(currentUser)
        return {
          ...m,
          likes: liked ? m.likes - 1 : m.likes + 1,
          likedBy: liked ? m.likedBy.filter(u => u !== currentUser) : [...m.likedBy, currentUser]
        }
      }
    }))
  }

  function toggleReplies(messageId: string) {
    setExpandedReplies(prev => {
      const next = new Set(prev)
      if (next.has(messageId)) {
        next.delete(messageId)
      } else {
        next.add(messageId)
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400">{lang === 'zh' ? '加载中...' : 'Loading...'}</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-3 space-y-3">
      {/* Input area */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-blue-100 dark:border-blue-900 p-4">
        <div className="flex gap-3">
          <img src="/avatar.svg" alt="Avatar" className="w-11 h-11 rounded-full shrink-0 ring-2 ring-blue-200 dark:ring-blue-800" />
          <div className="flex-1 space-y-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t.placeholder}
              rows={2}
              className="w-full px-4 py-2.5 border-2 border-blue-100 dark:border-blue-900 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-sm bg-blue-50/30 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm h-9 px-5 rounded-full shadow-lg shadow-blue-200 dark:shadow-blue-900/50"
              >
                <Send className="h-4 w-4 mr-1.5" />
                {t.submit}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {messages.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-900">
          <div className="bg-blue-50 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="h-8 w-8 text-blue-300 dark:text-blue-400" />
          </div>
          <p className="text-blue-400 dark:text-blue-400 font-medium">{t.noMessages}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => {
            const isExpanded = expandedReplies.has(message.id)
            const showReplyBox = replyingTo === message.id
            const isLiked = message.likedBy.includes(currentUser)

            return (
              <div key={message.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-blue-100 dark:border-blue-900 overflow-hidden hover:shadow-xl transition-shadow">
                {/* Main message - chat bubble style */}
                <div className="p-4">
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <img src="/avatar.svg" alt="Avatar" className="w-10 h-10 rounded-full shrink-0 mt-0.5 ring-2 ring-purple-200 dark:ring-purple-900" />

                    {/* Content area */}
                    <div className="flex-1 min-w-0">
                      {/* Header: author + time */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{message.author}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {format(new Date(message.createdAt), 'MM/dd HH:mm', { locale: dateLocale })}
                        </span>
                      </div>

                      {/* Message content - like SMS bubble */}
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl rounded-tl-sm px-4 py-2.5 mb-2 border border-blue-100 dark:border-blue-900">
                        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{message.content}</p>
                      </div>

                      {/* Actions: like + reply */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleLike(message.id, false)}
                          className={`flex items-center gap-1 text-xs transition-colors ${
                            isLiked ? 'text-red-500' : 'text-gray-400 dark:text-gray-500 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500' : ''}`} />
                          {message.likes > 0 && <span>{message.likes}</span>}
                        </button>

                        <button
                          onClick={() => setReplyingTo(showReplyBox ? null : message.id)}
                          className={`flex items-center gap-1 text-xs transition-colors ${
                            showReplyBox ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500 hover:text-blue-500'
                          }`}
                        >
                          <Reply className="h-4 w-4" />
                          <span>{t.reply}</span>
                        </button>

                        <button
                          onClick={() => toggleReplies(message.id)}
                          className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          {message.replies.length > 0 && (
                            <>
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              <span>{message.replies.length} {t.replies}</span>
                            </>
                          )}
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Reply input */}
                      {showReplyBox && (
                        <div className="flex gap-2 mt-3">
                          <input
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={t.replyPlaceholder}
                            className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSendReply(message.id)
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSendReply(message.id)}
                            disabled={!replyContent.trim()}
                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full h-8 px-4"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Replies section */}
                {isExpanded && message.replies.length > 0 && (
                  <div className="border-t-2 border-purple-100 dark:border-purple-900 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 pl-10">
                    {message.replies.map((reply) => {
                      const replyLiked = reply.likedBy.includes(currentUser)
                      return (
                        <div key={reply.id} className="py-3 border-b border-purple-100 dark:border-purple-900 last:border-b-0">
                          <div className="flex gap-2">
                            <img src="/avatar.svg" alt="Avatar" className="w-7 h-7 rounded-full shrink-0 mt-0.5 ring-2 ring-pink-200 dark:ring-pink-900" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-medium text-xs text-purple-700 dark:text-purple-300">{reply.author}</span>
                                <span className="text-xs text-purple-300 dark:text-purple-500">
                                  {format(new Date(reply.createdAt), 'MM/dd HH:mm', { locale: dateLocale })}
                                </span>
                              </div>
                              <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm border border-pink-100 dark:border-pink-900">
                                <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{reply.content}</p>
                              </div>
                              <button
                                onClick={() => toggleLike(message.id, true, reply.id)}
                                className={`flex items-center gap-1 text-xs mt-1.5 transition-colors ${
                                  replyLiked ? 'text-red-500' : 'text-gray-400 dark:text-gray-500 hover:text-red-500'
                                }`}
                              >
                                <Heart className={`h-3.5 w-3.5 ${replyLiked ? 'fill-red-500' : ''}`} />
                                {reply.likes > 0 && <span>{reply.likes}</span>}
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
