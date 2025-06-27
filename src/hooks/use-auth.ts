import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useTenant } from '@/components/providers/tenant-provider'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import type { User, AuthResponse } from '@/types'

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
}

// Custom hooks for authentication
export function useAuth() {
  const { currentTenant } = useTenant()
  const router = useRouter()
  const queryClient = useQueryClient()
  const tenant = currentTenant?.id || 'easy2work'

  const { data: user, isLoading } = useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const response = await authApi.getCurrentUser()
      return response.data as User
    },
    enabled: !!Cookies.get('token'),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await authApi.login(tenant, credentials)
      return response.data as AuthResponse
    },
    onSuccess: (data) => {
      // Store auth data
      Cookies.set('token', data.tokens.accessToken, { expires: 7 })
      Cookies.set('refreshToken', data.tokens.refreshToken, { expires: 30 })
      Cookies.set('user', JSON.stringify(data.user), { expires: 7 })
      
      // Update query cache
      queryClient.setQueryData(authKeys.user(), data.user)
      
      toast.success('Welcome back!')
      router.push(`/${tenant}/dashboard`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed')
    },
  })

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear auth data
      Cookies.remove('token')
      Cookies.remove('refreshToken')
      Cookies.remove('user')
      
      // Clear query cache
      queryClient.clear()
      
      toast.success('Logged out successfully')
      router.push(`/${tenant}/login`)
    },
    onError: () => {
      // Even if logout fails on server, clear local data
      Cookies.remove('token')
      Cookies.remove('refreshToken')
      Cookies.remove('user')
      queryClient.clear()
      router.push(`/${tenant}/login`)
    },
  })

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  }
}
