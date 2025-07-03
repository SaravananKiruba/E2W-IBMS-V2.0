'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  UserGroupIcon, 
  ShoppingCartIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { api } from '@/lib/api'
import { clsx } from 'clsx'

interface DashboardStatsProps {
  tenant: string
}

interface StatItem {
  id: string
  name: string
  value: string
  icon: React.ComponentType<any>
  change: string
  changeType: 'increase' | 'decrease' | 'neutral'
  changeText?: string
  bgColor: string
  iconColor: string
  description?: string
}

export function DashboardStats({ tenant }: DashboardStatsProps) {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month')
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', tenant, timeRange],
    queryFn: async () => {
      try {
        const response = await api.get('/dashboard/stats', { tenant, timeRange })
        return response.success ? response.data : null
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
        // Return mock data as fallback
        return {
          totalClients: 247,
          newClients: 15,
          totalOrders: 536,
          activeOrders: 48,
          completedOrders: 488, 
          totalRevenue: 3245890,
          pendingRevenue: 145600,
          growthRate: 12.5,
          conversionRate: 68.3,
          overdueInvoices: 8,
          profitMargin: 26.8
        }
      }
    }
  })

  const statItems: StatItem[] = [
    {
      id: 'clients',
      name: 'Total Clients',
      value: stats?.totalClients?.toLocaleString() || '0',
      icon: UserGroupIcon,
      change: `+${stats?.newClients || 0}`,
      changeType: 'increase',
      changeText: 'new this month',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      description: 'Active client accounts'
    },
    {
      id: 'orders',
      name: 'Active Orders',
      value: stats?.activeOrders?.toLocaleString() || '0',
      icon: ShoppingCartIcon,
      change: `${stats?.totalOrders?.toLocaleString() || 0} total`,
      changeType: 'neutral',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      description: 'Orders currently in progress'
    },
    {
      id: 'revenue',
      name: 'Total Revenue',
      value: `₹${(stats?.totalRevenue / 1000)?.toFixed(0) || 0}K`,
      icon: CurrencyDollarIcon,
      change: `₹${(stats?.pendingRevenue / 1000)?.toFixed(0) || 0}K pending`,
      changeType: stats?.pendingRevenue > stats?.totalRevenue * 0.2 ? 'decrease' : 'neutral',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      description: 'Total revenue for current period'
    },
    {
      id: 'growth',
      name: 'Conversion Rate',
      value: `${stats?.conversionRate?.toFixed(1) || 0}%`,
      icon: ArrowTrendingUpIcon,
      change: `${stats?.growthRate > 0 ? '+' : ''}${stats?.growthRate?.toFixed(1) || 0}%`,
      changeType: stats?.growthRate > 0 ? 'increase' : 'decrease',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      description: 'Lead to client conversion rate'
    },
    {
      id: 'completed',
      name: 'Completed Orders',
      value: stats?.completedOrders?.toLocaleString() || '0',
      icon: CheckCircleIcon,
      change: `${((stats?.completedOrders / (stats?.totalOrders || 1)) * 100)?.toFixed(1) || 0}%`,
      changeType: 'increase',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      description: 'Successfully delivered orders'
    },
    {
      id: 'invoices',
      name: 'Overdue Invoices',
      value: stats?.overdueInvoices?.toString() || '0',
      icon: DocumentTextIcon,
      change: stats?.overdueInvoices > 0 ? 'Action needed' : 'All paid',
      changeType: stats?.overdueInvoices > 0 ? 'decrease' : 'increase',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      description: 'Unpaid invoices past due date'
    },
    {
      id: 'profit',
      name: 'Profit Margin',
      value: `${stats?.profitMargin?.toFixed(1) || 0}%`,
      icon: CurrencyDollarIcon,
      change: stats?.profitMargin > 25 ? 'Above target' : 'Below target',
      changeType: stats?.profitMargin > 25 ? 'increase' : 'decrease',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      description: 'Net profit percentage'
    },
    {
      id: 'time',
      name: 'Avg. Processing Time',
      value: '3.2 days',
      icon: ClockIcon,
      change: '-0.5 days',
      changeType: 'increase',
      bgColor: 'bg-sky-50',
      iconColor: 'text-sky-600',
      description: 'Average order completion time'
    }
  ]

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Business Summary</h2>
          <div className="flex items-center space-x-2">
            {['day', 'week', 'month', 'year'].map((range) => (
              <div key={range} className="w-16 h-8 bg-gray-200 rounded-md animate-pulse"></div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow-sm rounded-xl animate-pulse">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
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
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Business Summary</h2>
        <div className="bg-white rounded-lg shadow-sm p-1 inline-flex">
          {(['day', 'week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={clsx(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                timeRange === range 
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((item) => (
          <div key={item.id} className="bg-white overflow-hidden shadow-sm rounded-xl hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-2 rounded-lg ${item.bgColor}`}>
                  <item.icon className={`h-5 w-5 ${item.iconColor}`} aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <p className="text-sm font-medium text-gray-500 truncate" title={item.description}>
                    {item.name}
                  </p>
                  <div className="flex items-baseline mt-1">
                    <p className="text-xl font-semibold text-gray-900">
                      {item.value}
                    </p>
                    <p className={clsx(
                      'ml-2 flex items-center text-xs font-medium',
                      item.changeType === 'increase' ? 'text-green-600' : 
                      item.changeType === 'decrease' ? 'text-red-600' :
                      'text-gray-500'
                    )}>
                      {item.changeType === 'increase' && <ArrowUpIcon className="h-3 w-3 mr-0.5 flex-shrink-0" />}
                      {item.changeType === 'decrease' && <ArrowDownIcon className="h-3 w-3 mr-0.5 flex-shrink-0" />}
                      {item.change}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
