'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './auth-provider'
import { TenantProvider } from './tenant-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes for demo mode
            gcTime: 10 * 60 * 1000, // 10 minutes cache (previously cacheTime)
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: (failureCount, error: any) => {
              // In demo mode, don't retry as much
              if (process.env.NODE_ENV === 'development') {
                return failureCount < 1
              }
              if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false
              }
              return failureCount < 3
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TenantProvider>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#fff',
                fontSize: '14px',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)',
              },
              success: {
                duration: 2500,
                style: {
                  background: 'rgba(34, 197, 94, 0.9)',
                },
                iconTheme: {
                  primary: '#ffffff',
                  secondary: '#22c55e',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: 'rgba(239, 68, 68, 0.9)',
                },
                iconTheme: {
                  primary: '#ffffff',
                  secondary: '#ef4444',
                },
              },
              loading: {
                duration: Infinity,
                style: {
                  background: 'rgba(59, 130, 246, 0.9)',
                },
              },
            }}
          />
        </AuthProvider>
      </TenantProvider>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
