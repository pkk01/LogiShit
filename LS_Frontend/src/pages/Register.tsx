import axios from 'axios'
import { UserPlus } from 'lucide-react'
import { useState } from 'react'

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      await axios.post('/api/register/', form)
      setSuccess('Registration successful. Please login.')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-surface rounded-xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-textPrimary">Create Account</h1>
          <p className="text-textSecondary mt-2">Join us to start managing your deliveries</p>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg text-success text-sm">
            {success}
          </div>
        )}
        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-2">Full Name</label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-2">Email Address</label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-2">Password</label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-all font-medium shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40">
            Create Account
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-textSecondary">
          Already have an account?{' '}
          <a href="/login" className="text-primary hover:text-blue-600 font-medium transition-colors">
            Sign in
          </a>
        </div>
      </div>
    </div>
  )
}
