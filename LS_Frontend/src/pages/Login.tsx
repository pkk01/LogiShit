import axios from 'axios'
import { LogIn } from 'lucide-react'
import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await axios.post('/api/login/', { email, password })
      localStorage.setItem('access_token', res.data.tokens.access)
      localStorage.setItem('refresh_token', res.data.tokens.refresh)
      localStorage.setItem('role', res.data.user.role)
      window.location.href = '/'
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-surface rounded-xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-textPrimary">Welcome Back</h1>
          <p className="text-textSecondary mt-2">Sign in to your account to continue</p>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
            {error}
          </div>
        )}
        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-2">Email Address</label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-2">Password</label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-all font-medium shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40">
            Sign In
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-textSecondary">
          Don't have an account?{' '}
          <a href="/register" className="text-primary hover:text-blue-600 font-medium transition-colors">
            Create one
          </a>
        </div>
      </div>
    </div>
  )
}
