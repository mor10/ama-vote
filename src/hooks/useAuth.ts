import { useState, useEffect } from 'react'
import type { User } from '../assets/types'

function useAuth() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('ama_user')
    if (storedUser) setUser(JSON.parse(storedUser))
  }, [])

  const login = async ({ name, password }: { name: string, password?: string }) => {
    if (name === import.meta.env.VITE_ADMIN_USER) {
      if (password !== import.meta.env.VITE_ADMIN_PWD) {
        throw new Error('Invalid admin password')
      }
      const adminUser = { name, isAdmin: true }
      localStorage.setItem('ama_user', JSON.stringify(adminUser))
      setUser(adminUser)
      return
    }

    const regularUser = { name, isAdmin: false }
    localStorage.setItem('ama_user', JSON.stringify(regularUser))
    setUser(regularUser)
  }

  const logout = () => {
    localStorage.removeItem('ama_user')
    setUser(null)
  }

  const deleteAllUsers = async () => {
    localStorage.clear() // Clear local storage
    setUser(null)
  }

  return { user, login, logout, deleteAllUsers }
}

export default useAuth 