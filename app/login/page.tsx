import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import LoginForm from '@/components/LoginForm'

const subtitles = {
  en: 'Project Management Tool',
  zh: '项目管理工具',
}

export default async function LoginPage() {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get('auth')?.value === 'true'
  const lang = cookieStore.get('lang')?.value || 'en'

  if (isLoggedIn) {
    redirect('/')
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
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium border-2 border-slate-800">A</div>
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium border-2 border-slate-800">B</div>
              <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white text-sm font-medium border-2 border-slate-800">C</div>
            </div>
            <p className="text-slate-400 text-sm">
              {lang === 'zh' ? '500+ 团队正在使用' : '500+ teams using'}
            </p>
          </div>
        </div>

        <p className="text-slate-500 text-sm">@2026 pmtool_se1</p>
      </div>

      {/* Right side - Login Form */}
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

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
