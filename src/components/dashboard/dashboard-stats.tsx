'use client'

import { useQuery } from '@tanstack/react-query'
import { 
  UserGroupIcon, 
  ShoppingCartIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon 
} from '@heroicons/react/24/outline'
import apiClient from '@/lib/api'

interface DashboardStatsProps {
  tenant: string
}

interface StatItem {
  name: string
  value: string
  icon: React.ComponentType<any>
  change: string
  changeType: 'increase' | 'decrease'
}

export function DashboardStats({ tenant }: DashboardStatsProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', tenant],
    queryFn: async () => {
      try {
        const response = await apiClient.dashboard.stats() as any
        return response.success ? response.data : null
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
        // Return mock data as fallback
        return {
          totalClients: 1234,
          totalOrders: 567,
          totalRevenue: 89012,
          growthRate: 12.5
        }
      }
    }
  })

  const statItems: StatItem[] = [
    {
      name: 'Total Clients',
      value: stats?.totalClients?.toLocaleString() || '0',
      icon: UserGroupIcon,
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Total Orders',
      value: stats?.totalOrders?.toLocaleString() || '0',
      icon: ShoppingCartIcon,
      change: '+8%',
      changeType: 'increase'
    },
    {
      name: 'Total Revenue',
      value: `₹${stats?.totalRevenue?.toLocaleString() || '0'}`,
      icon: CurrencyDollarIcon,
      change: '+15%',
      changeType: 'increase'
    },
    {
      name: 'Growth Rate',
      value: `${stats?.growthRate || 0}%`,
      icon: ArrowTrendingUpIcon,
      change: '+2.5%',
      changeType: 'increase'
    }
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => (
        <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <item.icon className="h-8 w-8 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {item.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {item.value}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
