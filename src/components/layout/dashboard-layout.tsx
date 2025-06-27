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
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen}
        tenant={tenant}
      />
      
      <div className="lg:pl-64">
        <Header 
          setSidebarOpen={setSidebarOpen}
          tenant={tenant}
        />
        
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
