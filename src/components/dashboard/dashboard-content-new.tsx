'use client'

import { useQuery } from '@tanstack/react-query'
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  ShoppingBagIcon, 
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { api } from '@/lib/api'

interface DashboardContentProps {
  tenant: string
}

export function DashboardContent({ tenant }: DashboardContentProps) {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard-stats', tenant],
    queryFn: () => api.getDashboardStats(),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  })

  const stats = dashboardData?.data

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalClients || 0}</p>
              <div className="flex items-center text-sm">
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">12% from last month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <ShoppingBagIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeOrders || 0}</p>
              <div className="flex items-center text-sm">
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">8% from last week</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats?.monthlyRevenue?.toLocaleString() || '0'}
              </p>
              <div className="flex items-center text-sm">
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">15% from last month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <ChartBarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.conversionRate || 0}%</p>
              <div className="flex items-center text-sm">
                <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-600">2% from last month</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
              Recent Activity
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats?.recentActivity?.map((activity: any, index: number) => (
                <div key={activity.id || index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'client' ? 'bg-blue-100' :
                    activity.type === 'order' ? 'bg-green-100' :
                    activity.type === 'payment' ? 'bg-purple-100' :
                    'bg-gray-100'
                  }`}>
                    {activity.type === 'client' && <UserGroupIcon className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'order' && <ShoppingBagIcon className="h-4 w-4 text-green-600" />}
                    {activity.type === 'payment' && <CurrencyDollarIcon className="h-4 w-4 text-purple-600" />}
                    {activity.type === 'invoice' && <ChartBarIcon className="h-4 w-4 text-gray-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              )) || []}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Financial Overview</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-800">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-900">
                    ${stats?.totalRevenue?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-800">Net Profit</p>
                  <p className="text-2xl font-bold text-blue-900">
                    ${stats?.netProfit?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-yellow-800">Pending Payments</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {stats?.pendingPayments || 0}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
