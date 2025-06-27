'use client'

import { useQuery } from '@tanstack/react-query'
import { ClockIcon } from '@heroicons/react/24/outline'

interface RecentActivityProps {
  tenant: string
}

interface Activity {
  id: number
  type: 'order' | 'client' | 'payment'
  message: string
  time: string
  user: string
}

export function RecentActivity({ tenant }: RecentActivityProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['recent-activity', tenant],
    queryFn: async () => {
      // Mock data - replace with actual API call
      const mockActivities: Activity[] = [
        {
          id: 1,
          type: 'order',
          message: 'New order created for John Doe',
          time: '2 hours ago',
          user: 'Admin'
        },
        {
          id: 2,
          type: 'client',
          message: 'New client registered: Jane Smith',
          time: '4 hours ago',
          user: 'Sales Team'
        },
        {
          id: 3,
          type: 'payment',
          message: 'Payment received: ₹25,000',
          time: '6 hours ago',
          user: 'Finance'
        },
        {
          id: 4,
          type: 'order',
          message: 'Order #1234 completed',
          time: '8 hours ago',
          user: 'Operations'
        },
        {
          id: 5,
          type: 'client',
          message: 'Client profile updated',
          time: '1 day ago',
          user: 'Admin'
        }
      ]
      return mockActivities
    }
  })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100 text-blue-600'
      case 'client':
        return 'bg-green-100 text-green-600'
      case 'payment':
        return 'bg-yellow-100 text-yellow-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Recent Activity
        </h3>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start space-x-3">
                <div className="rounded-full bg-gray-200 h-8 w-8"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {activities?.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== activities.length - 1 ? (
                      <span
                        className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getActivityIcon(activity.type)}`}>
                          <ClockIcon className="h-4 w-4" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-sm text-gray-900">
                            {activity.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            by {activity.user}
                          </p>
                        </div>
                        <div className="whitespace-nowrap text-right text-sm text-gray-500">
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
