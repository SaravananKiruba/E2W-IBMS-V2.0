'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface Tenant {
  id: string
  name: string
  database: string
  subdomain: string
  settings: {
    logo?: string
    primaryColor: string
    secondaryColor: string
    companyName: string
  }
}

interface TenantContextType {
  currentTenant: Tenant | null
  switchTenant: (tenantId: string) => void
  tenants: Tenant[]
  isLoading: boolean
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

// Predefined tenants based on your databases
const AVAILABLE_TENANTS: Tenant[] = [
  {
    id: 'easy2work',
    name: 'Easy2Work',
    database: 'baleeed5_easy2work',
    subdomain: 'easy2work',
    settings: {
      primaryColor: '#0ea5e9',
      secondaryColor: '#0284c7',
      companyName: 'Easy2Work Solutions'
    }
  },
  {
    id: 'gracescans',
    name: 'Grace Scans',
    database: 'baleeed5_gracescans',
    subdomain: 'gracescans',
    settings: {
      primaryColor: '#059669',
      secondaryColor: '#047857',
      companyName: 'Grace Scans Ltd'
    }
  },
  {
    id: 'live',
    name: 'Live Production',
    database: 'baleeed5_live',
    subdomain: 'live',
    settings: {
      primaryColor: '#dc2626',
      secondaryColor: '#b91c1c',
      companyName: 'Live Environment'
    }
  },
  {
    id: 'test',
    name: 'Test Environment',
    database: 'baleeed5_test_e2w',
    subdomain: 'test',
    settings: {
      primaryColor: '#7c3aed',
      secondaryColor: '#6d28d9',
      companyName: 'Test Environment'
    }
  }
]

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Extract tenant from URL path
    const pathSegments = pathname.split('/')
    const tenantSlug = pathSegments[1]
    
    if (tenantSlug) {
      const tenant = AVAILABLE_TENANTS.find(t => t.id === tenantSlug)
      if (tenant) {
        setCurrentTenant(tenant)
      }
    }
    
    setIsLoading(false)
  }, [pathname])

  const switchTenant = (tenantId: string) => {
    const tenant = AVAILABLE_TENANTS.find(t => t.id === tenantId)
    if (tenant) {
      setCurrentTenant(tenant)
      const currentPath = pathname.split('/').slice(2).join('/')
      router.push(`/${tenantId}/${currentPath || 'dashboard'}`)
    }
  }

  return (
    <TenantContext.Provider 
      value={{ 
        currentTenant, 
        switchTenant, 
        tenants: AVAILABLE_TENANTS, 
        isLoading 
      }}
    >
      {children}
    </TenantContext.Provider>
  )
}

export const useTenant = () => {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}
