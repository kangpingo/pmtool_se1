'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RefreshCw, ArrowLeft, Check, X, UserPlus } from 'lucide-react'
import Link from 'next/link'

type Language = 'zh' | 'en'

const labels = {
  zh: {
    title: '注册账户',
    subtitle: '创建一个新账户',
    username: '账户名',
    usernameHint: '仅限字母、数字、下划线，不能使用汉字',
    password: '密码',
    confirmPassword: '确认密码',
    verificationCode: '验证码',
    usernamePlaceholder: '请输入账户名 (3-20字符)',
    passwordPlaceholder: '请输入密码 (至少6字符)',
    confirmPlaceholder: '请再次输入密码',
    codePlaceholder: '请输入右侧验证码',
    register: '注册',
    registering: '注册中...',
    backToLogin: '返回登录',
    usernameRequired: '请输入账户名',
    usernameTooShort: '账户名至少3个字符',
    usernameTooLong: '账户名最多20个字符',
    usernameInvalid: '账户名只能包含字母、数字和下划线',
    usernameExists: '账户名已存在',
    checkingUsername: '检查中...',
    usernameAvailable: '账户名可用',
    passwordRequired: '请输入密码',
    passwordTooShort: '密码至少6个字符',
    confirmRequired: '请确认密码',
    passwordMismatch: '两次密码不一致',
    codeRequired: '请输入验证码',
    codeInvalid: '验证码错误',
    registerSuccess: '注册成功，正在登录...',
    registerFailed: '注册失败，请重试',
    refreshCode: '刷新验证码',
  },
  en: {
    title: 'Create Account',
    subtitle: 'Create a new account',
    username: 'Account Name',
    usernameHint: 'Letters, numbers, underscore only. No Chinese characters.',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    verificationCode: 'Verification Code',
    usernamePlaceholder: 'Enter account name (3-20 chars)',
    passwordPlaceholder: 'Enter password (min 6 chars)',
    confirmPlaceholder: 'Re-enter password',
    codePlaceholder: 'Enter verification code',
    register: 'Register',
    registering: 'Registering...',
    backToLogin: 'Back to Login',
    usernameRequired: 'Account name is required',
    usernameTooShort: 'Account name must be at least 3 characters',
    usernameTooLong: 'Account name must be at most 20 characters',
    usernameInvalid: 'Account name can only contain letters, numbers and underscore',
    usernameExists: 'Account name already exists',
    checkingUsername: 'Checking...',
    usernameAvailable: 'Account name available',
    passwordRequired: 'Password is required',
    passwordTooShort: 'Password must be at least 6 characters',
    confirmRequired: 'Please confirm your password',
    passwordMismatch: 'Passwords do not match',
    codeRequired: 'Verification code is required',
    codeInvalid: 'Invalid verification code',
    registerSuccess: 'Registration successful, logging in...',
    registerFailed: 'Registration failed, please try again',
    refreshCode: 'Refresh code',
  },
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Validate account name: only letters, numbers, underscore. No Chinese or special chars.
function isValidAccountName(name: string): boolean {
  return /^[a-zA-Z0-9_]+$/.test(name)
}

export default function RegisterPage() {
  const router = useRouter()
  const [lang, setLang] = useState<Language>('en')
  const [t, setT] = useState(labels.en)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    setT(labels[lang])
    setVerificationCode(generateCode())
  }, [lang])

  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null)
      return
    }
    const timer = setTimeout(async () => {
      setUsernameChecking(true)
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`)
        const data = await res.json()
        setUsernameAvailable(data.available)
      } catch {
        setUsernameAvailable(null)
      } finally {
        setUsernameChecking(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [username])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!username.trim()) {
      toast.error(t.usernameRequired)
      return
    }
    if (username.length < 3) {
      toast.error(t.usernameTooShort)
      return
    }
    if (username.length > 20) {
      toast.error(t.usernameTooLong)
      return
    }
    if (!isValidAccountName(username)) {
      toast.error(t.usernameInvalid)
      return
    }
    if (usernameAvailable === false) {
      toast.error(t.usernameExists)
      return
    }
    if (!password) {
      toast.error(t.passwordRequired)
      return
    }
    if (password.length < 6) {
      toast.error(t.passwordTooShort)
      return
    }
    if (!confirmPassword) {
      toast.error(t.confirmRequired)
      return
    }
    if (password !== confirmPassword) {
      toast.error(t.passwordMismatch)
      return
    }
    if (!code) {
      toast.error(t.codeRequired)
      return
    }
    if (code !== verificationCode) {
      toast.error(t.codeInvalid)
      setVerificationCode(generateCode())
      setCode('')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password, lang }),
      })

      if (res.ok) {
        toast.success(t.registerSuccess)
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 500)
      } else {
        const data = await res.json()
        toast.error(data.error || t.registerFailed)
      }
    } catch {
      toast.error(t.registerFailed)
    } finally {
      setLoading(false)
    }
  }

  function handleRefreshCode() {
    setVerificationCode(generateCode())
    setCode('')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-between lg:p-12 bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-900">
        <div className="flex items-center gap-4">
          <img src="/logo.svg" alt="Logo" className="w-14 h-14 rounded-2xl" />
          <div>
            <h1 className="text-3xl font-bold text-white">PMTool</h1>
            <p className="text-slate-400 text-sm">{lang === 'zh' ? '项目管理工具' : 'Project Management Tool'}</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-5xl font-bold text-white leading-tight">
            PMTool SE1
          </h2>
          <p className="text-indigo-300 text-xl">
            {lang === 'zh' ? '项目管理工具' : 'Project Management Tool'}
          </p>
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Check className="h-4 w-4 text-blue-400" />
              </div>
              <span>{lang === 'zh' ? '支持中英文切换' : 'Chinese & English Support'}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Check className="h-4 w-4 text-green-400" />
              </div>
              <span>{lang === 'zh' ? '项目和计划维护' : 'Project & Plan Maintenance'}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Check className="h-4 w-4 text-green-400" />
              </div>
              <span>{lang === 'zh' ? '看板与甘特图视图' : 'Kanban & Gantt Views'}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Check className="h-4 w-4 text-purple-400" />
              </div>
              <span>{lang === 'zh' ? '任务进度追踪' : 'Task Progress Tracking'}</span>
            </div>
          </div>
        </div>

        <p className="text-slate-500 text-sm">@2026 pmtool_se1</p>
      </div>

      {/* Right side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src="/logo.svg" alt="Logo" className="w-10 h-10 rounded-xl" />
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">PMTool SE1</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'zh' ? '项目管理工具' : 'Project Management Tool'}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <Link
                href="/login"
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </Link>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t.title}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{t.subtitle}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700 dark:text-slate-300 text-sm font-medium">{t.username}</Label>
                <div className="relative">
                  <Input
                    id="username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white pr-16"
                    placeholder={t.usernamePlaceholder}
                    autoComplete="username"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {usernameChecking && <RefreshCw className="h-3.5 w-3.5 text-slate-400 animate-spin" />}
                    {!usernameChecking && username.length >= 3 && (
                      usernameAvailable === true ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : usernameAvailable === false ? (
                        <X className="h-3.5 w-3.5 text-red-500" />
                      ) : null
                    )}
                  </div>
                </div>
                {!usernameChecking && usernameAvailable === true && (
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <Check className="h-3 w-3" /> {t.usernameAvailable}
                  </p>
                )}
                {!usernameChecking && usernameAvailable === false && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <X className="h-3 w-3" /> {t.usernameExists}
                  </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500">{t.usernameHint}</p>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 text-sm font-medium">{t.password}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
                  placeholder={t.passwordPlaceholder}
                  autoComplete="new-password"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300 text-sm font-medium">{t.confirmPassword}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
                  placeholder={t.confirmPlaceholder}
                  autoComplete="new-password"
                />
              </div>

              {/* Verification Code */}
              <div className="space-y-2">
                <Label htmlFor="code" className="text-slate-700 dark:text-slate-300 text-sm font-medium">{t.verificationCode}</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white flex-1 font-mono tracking-widest"
                    placeholder={t.codePlaceholder}
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={handleRefreshCode}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                    title={t.refreshCode}
                  >
                    <RefreshCw className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Code Display */}
              <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
                <p className="text-2xl font-mono font-bold tracking-[0.3em] text-slate-700 dark:text-slate-300 select-none">
                  {verificationCode}
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || usernameChecking || usernameAvailable === false}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    {t.registering}
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    {t.register}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <Link
                  href="/login"
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 text-sm transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t.backToLogin}
                </Link>

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
        </div>
      </div>
    </div>
  )
}
