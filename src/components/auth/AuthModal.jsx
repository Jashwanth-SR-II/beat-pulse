import { useState } from 'react'
import { X, Mail, Lock, User } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signIn, signUp } = useAuthStore()

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        await signUp(email, password, username)
      }
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card rounded-2xl p-8 border border-white/5 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6">
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <Input icon={User} placeholder="Username" value={username}
              onChange={(e) => setUsername(e.target.value)} required />
          )}
          <Input icon={Mail} type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} required />
          <Input icon={Lock} type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} required minLength={6} />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-accent text-black font-semibold
                       hover:brightness-110 disabled:opacity-50 transition">
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="mt-4 text-sm text-text-secondary hover:text-accent transition">
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}

function Input({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <Icon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
      <input {...props}
        className="w-full bg-surface border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm
                   placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition" />
    </div>
  )
}