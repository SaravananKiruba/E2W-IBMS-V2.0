'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { api } from '@/lib/api'
import { User } from '@/types'

// Extended user interface with additional properties
interface AuthUser extends User {
  name: string; // Display name
  permissions?: string[]; // User permissions
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    notifications?: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  lastLogin?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  tenant?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginDemo: (tenant: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
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
      
      // Transform backend user to AuthUser
      const userData = response.data.user;
      const authUser: AuthUser = {
        ...userData,
        name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.username
      };
      
      setUser(authUser)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching user:', error)
      Cookies.remove('token')
      Cookies.remove('tenant')
      setIsLoading(false)
    }
  }

  const login = async ({ email, password, tenant = 'test' }: LoginCredentials) => {
    try {
      // Save tenant info first
      Cookies.set('tenant', tenant, { expires: 7 })
      
      const response = await api.post('/auth/login', { email, password, tenant })
      const { user: userData, tokens } = response.data
      
      // Store authentication token
      Cookies.set('token', tokens.accessToken, { expires: 7 })
      
      // Transform user data
      const authUser: AuthUser = {
        ...userData,
        name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.username,
        lastLogin: new Date().toISOString()
      };
      
      setUser(authUser)
      
      // Navigate to dashboard
      router.push(`/${tenant}/dashboard`)
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.response?.data?.message || 'Login failed. Please check your credentials.')
    }
  }

  // Demo login function for quick access
  const loginDemo = async (tenant: string) => {
    try {
      // Default demo credentials based on tenant
      const demoUsers: Record<string, { email: string; password: string; role: string }> = {
        'easy2work': { email: 'admin@easy2work.com', password: 'demo123', role: 'admin' },
        'gracescans': { email: 'admin@gracescans.com', password: 'demo123', role: 'admin' },
        'test': { email: 'demo@test.com', password: 'demo123', role: 'admin' },
        'live': { email: 'admin@live.com', password: 'demo123', role: 'admin' }
      };
      
      const demoCredentials = demoUsers[tenant] || demoUsers.test;
      
      // Set up demo user and tenant
      Cookies.set('tenant', tenant, { expires: 1 }) // Short expiry for demo
      
      // Create mock demo user
      const mockUser: AuthUser = {
        id: 'demo-user',
        username: 'demouser',
        email: demoCredentials.email,
        firstName: 'Demo',
        lastName: 'User',
        role: demoCredentials.role as any,
        tenant: tenant,
        name: 'Demo User',
        permissions: ['*'], // All permissions for demo
        lastLogin: new Date().toISOString()
      };
      
      // Set demo token
      Cookies.set('token', 'demo-token-' + Date.now(), { expires: 1 })
      
      setUser(mockUser)
      router.push(`/${tenant}/dashboard`)
    } catch (error) {
      console.error('Demo login error:', error)
      throw new Error('Failed to login with demo account')
    }
  }

  const logout = () => {
    Cookies.remove('token')
    Cookies.remove('tenant')
    setUser(null)
    router.push('/login')
  }    // Helper function to check user permissions
  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    
    // Wildcard permission grants all access
    if (user.permissions.includes('*')) return true;
    
    // Admin role has all permissions
    if (user.role === 'admin') return true;
    
    // Check specific permission
    return user.permissions.includes(permission);
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      loginDemo,
      logout, 
      isLoading,
      hasPermission
    }}>
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
