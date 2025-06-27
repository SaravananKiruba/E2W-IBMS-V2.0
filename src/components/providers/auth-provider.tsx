'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

interface User {
  id: string
  name: string
  email: string
  role: string
  tenantId: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = Cookies.get('token')
    if (token) {
      // Verify token and get user data
      fetchUser(token)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUser = async (token: string) => {
    try {
      // API call to verify token and get user
      // const response = await api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` }})
      // setUser(response.data.user)
      setIsLoading(false)
    } catch (error) {
      Cookies.remove('token')
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      // API call to login
      // const response = await api.post('/auth/login', { email, password })
      // const { token, user } = response.data
      // Cookies.set('token', token, { expires: 7 })
      // setUser(user)
      // router.push(`/${user.tenantId}/dashboard`)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    Cookies.remove('token')
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
