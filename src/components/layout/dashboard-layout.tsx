'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { useTenant } from '@/components/providers/tenant-provider'

interface DashboardLayoutProps {
  children: React.ReactNode
  tenant: string
}

export function DashboardLayout({ children, tenant }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { currentTenant } = useTenant()

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen}
        tenant={tenant}
      />
      
      <div className="lg:pl-64 transition-all duration-200">
        <Header 
          setSidebarOpen={setSidebarOpen}
          tenant={tenant}
        />
        
        <main className="py-4 sm:py-6 lg:py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="animate-in fade-in duration-300">
              {children}
            </div>
          </div>
        </main>

        {/* Footer with branding */}
        <footer className="border-t border-gray-200 bg-white py-4 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-sm text-gray-500">
              © 2025 IBMS - Intelligent Business Management Software
            </p>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-400">Powered by</span>
              <span className="text-xs font-medium bg-gradient-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent">
                Easy2Work
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
