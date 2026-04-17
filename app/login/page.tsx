import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import LoginForm from '@/components/LoginForm'

export default async function LoginPage() {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get('auth')?.value === 'true'

  if (isLoggedIn) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="Logo" className="w-16 h-16 rounded-2xl mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>StoryEAST</h1>
          <p className="text-gray-400">Project Management System</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
