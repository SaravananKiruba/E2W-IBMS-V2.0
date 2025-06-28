'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { api } from '@/lib/api'

interface User {
  id: string
  name: string
  email: string
  role: string
  tenant: string
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
      fetchUser(token)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUser = async (token: string) => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data.user)
      setIsLoading(false)
    } catch (error) {
      Cookies.remove('token')
      Cookies.remove('tenant')
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      let tenant = Cookies.get('tenant')
      if (!tenant) {
        tenant = 'test' // Default tenant
        Cookies.set('tenant', tenant, { expires: 7 })
      }
      
      const response = await api.post('/auth/login', { email, password })
      const { user, tokens } = response.data
      
      Cookies.set('token', tokens.accessToken, { expires: 7 })
      setUser(user)
      
      router.push(`/${tenant}/dashboard`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  const logout = () => {
    Cookies.remove('token')
    Cookies.remove('tenant')
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
