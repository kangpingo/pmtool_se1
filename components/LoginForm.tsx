'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MessageCircle, Mail, UserPlus } from 'lucide-react'

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
    contactAdmin: '如有登录问题，请联系管理员',
    wechat: '微信',
    email: '邮箱',
  },
  en: {
    title: 'Login',
    username: 'Username',
    password: 'Password',
    login: 'Login',
    loggingIn: 'Logging in...',
    error: 'Invalid username or password',
    forgotPassword: 'Forgot Password',
    contactAdmin: 'Please contact administrator',
    wechat: 'Wechat',
    email: 'Email',
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
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t.title}</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {lang === 'zh' ? '项目管理工具' : 'Project Management Tool'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-slate-700 dark:text-slate-300 text-sm font-medium">{t.username}</Label>
          <Input
            id="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
            placeholder="admin"
            autoComplete="username"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 text-sm font-medium">{t.password}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5"
        >
          {loading ? t.loggingIn : t.login}
        </Button>
      </form>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <Link
              href="/login/register"
              className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
            >
              {lang === 'zh' ? '注册账户' : 'Create Account'}
            </Link>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
              <DialogTrigger asChild>
                <button className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors">
                  {t.forgotPassword}
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-slate-800 dark:text-white">
                    {t.forgotPassword}
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t.contactAdmin}</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <MessageCircle className="h-4 w-4 text-green-500" />
                      <span className="text-slate-500">{t.wechat}:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">kangpingchn</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <span className="text-slate-500">{t.email}:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">kangpingchn@hotmail.com</span>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Language toggle */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setLang('zh')}
              className={`px-3 py-1 text-xs rounded-md transition-all ${lang === 'zh' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              中文
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 text-xs rounded-md transition-all ${lang === 'en' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
