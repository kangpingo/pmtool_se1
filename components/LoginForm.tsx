'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MessageCircle, Mail } from 'lucide-react'

type Language = 'zh' | 'en'

const labels = {
  zh: {
    title: '登录',
    username: '用户名',
    password: '密码',
    login: '登录',
    loggingIn: '登录中...',
    error: '用户名或密码错误',
    forgotPassword: '忘记密码',
    contactAdmin: '联系管理员',
    contactMessage: '如有登录问题，请联系管理员：',
    wechat: 'Wechat',
    email: 'E-mail',
  },
  en: {
    title: 'Login',
    username: 'Username',
    password: 'Password',
    login: 'Login',
    loggingIn: 'Logging in...',
    error: 'Invalid username or password',
    forgotPassword: 'Forgot Password',
    contactAdmin: 'Contact Admin',
    contactMessage: 'Please contact administrator:',
    wechat: 'Wechat',
    email: 'E-mail',
  },
}

export default function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<Language>('en')
  const [forgotOpen, setForgotOpen] = useState(false)

  const t = labels[lang]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      toast.error(lang === 'zh' ? '请填写用户名和密码' : 'Please enter username and password')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim(), lang }),
      })

      if (res.ok) {
        toast.success(lang === 'zh' ? '登录成功' : 'Login successful')
        router.push('/')
        router.refresh()
      } else {
        toast.error(t.error)
      }
    } catch {
      toast.error(lang === 'zh' ? '登录失败，请重试' : 'Login failed, please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-gray-300 text-sm">{t.username}</Label>
          <Input
            id="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
            placeholder="admin"
            autoComplete="username"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-gray-300 text-sm">{t.password}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
        >
          {loading ? t.loggingIn : t.login}
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-between">
        <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
          <DialogTrigger asChild>
            <button className="text-gray-400 text-sm hover:text-white transition-colors">
              {t.forgotPassword}
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <div className="flex items-start gap-3 px-1 pb-3 border-b border-gray-100">
                <div className="text-5xl leading-none select-none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
                  🐶
                </div>
                <div className="pt-1" style={{ marginTop: '5px' }}>
                  <DialogTitle className="text-lg font-bold text-gray-900">
                    Forgot Password
                  </DialogTitle>
                </div>
              </div>
            </DialogHeader>
            <div className="py-4 space-y-3" style={{ marginTop: '-10px', marginRight: '10px' }}>
              <p className="text-sm text-gray-600">{t.contactMessage}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  <span className="text-gray-500">{t.wechat}:</span>
                  <span className="font-medium text-gray-800">kangpingchn</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-500">{t.email}:</span>
                  <span className="font-medium text-gray-800">kangpingchn@hotmail.com</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Language toggle */}
        <div className="flex gap-1">
          <button
            onClick={() => setLang('zh')}
            className={`px-2 py-1 text-xs rounded ${lang === 'zh' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            中文
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-2 py-1 text-xs rounded ${lang === 'en' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            EN
          </button>
        </div>
      </div>
    </div>
  )
}
