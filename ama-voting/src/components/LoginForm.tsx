import { useState } from 'react'

interface LoginFormProps {
  onLogin: (credentials: { name: string; password?: string }) => Promise<void>
}

function LoginForm({ onLogin }: LoginFormProps) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      await onLogin({ 
        name, 
        ...(isAdmin && { password })
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setIsAdmin(value === import.meta.env.VITE_ADMIN_USER)
    setName(value)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome to AMA</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="name">
            Your Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={handleNameChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {isAdmin && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Admin Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        )}

        {error && (
          <p className="text-red-500 mb-4">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Enter
        </button>
      </form>
    </div>
  )
}

export default LoginForm