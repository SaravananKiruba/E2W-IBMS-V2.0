'use client'

import { useQuery } from '@tanstack/react-query'
import { ChartBarIcon } from '@heroicons/react/24/outline'

interface DashboardContentProps {
  tenant: string
}

export function DashboardContent({ tenant }: DashboardContentProps) {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['dashboard-content', tenant],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return {
        recentOrders: [
          { id: 1, client: 'John Doe', amount: 5000, status: 'completed' },
          { id: 2, client: 'Jane Smith', amount: 3500, status: 'pending' },
          { id: 3, client: 'Mike Johnson', amount: 7200, status: 'processing' },
        ],
        monthlyRevenue: [
          { month: 'Jan', revenue: 45000 },
          { month: 'Feb', revenue: 52000 },
          { month: 'Mar', revenue: 48000 },
          { month: 'Apr', revenue: 61000 },
          { month: 'May', revenue: 55000 },
          { month: 'Jun', revenue: 67000 },
        ]
      }
    }
  })

  return (
    <div className="space-y-6">
      {/* Recent Orders */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Orders
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {chartData?.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{order.client}</p>
                    <p className="text-sm text-gray-500">₹{order.amount.toLocaleString()}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Monthly Revenue
          </h3>
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
            <div className="text-center">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Revenue Chart</h3>
              <p className="mt-1 text-sm text-gray-500">Chart component will be implemented here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
