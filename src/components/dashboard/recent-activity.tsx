'use client'

import { useQuery } from '@tanstack/react-query'
import { 
  ClockIcon, 
  UserIcon, 
  ShoppingCartIcon, 
  CurrencyDollarIcon,
  UserPlusIcon,
  DocumentIcon,
  CheckCircleIcon,
  PhoneIcon,
  InboxIcon
} from '@heroicons/react/24/outline'
import { api } from '@/lib/api'
import Link from 'next/link'

interface RecentActivityProps {
  tenant: string
}

interface Activity {
  id: string
  type: 'order' | 'client' | 'payment' | 'lead' | 'invoice' | 'document' | 'notification' | 'communication'
  title: string
  message: string
  time: string
  user: string
  status?: string
  link?: string
  amount?: number
}

export function RecentActivity({ tenant }: RecentActivityProps) {
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ['recent-activity', tenant],
    queryFn: async (): Promise<Activity[]> => {
      try {
        const response = await api.get<Activity[]>('/dashboard/activity', { tenant })
        return response.success && response.data ? response.data : []
      } catch (error) {
        console.error('Failed to fetch activity:', error)
        // Mock data as fallback
        const mockActivities: Activity[] = [
          {
            id: '1',
            type: 'order',
            title: 'New Order',
            message: 'New order #ORD-2025 created for Acme Corporation',
            time: '30 minutes ago',
            user: 'Maria Wilson',
            status: 'pending',
            link: `/${tenant}/orders/ORD-2025`
          },
          {
            id: '2',
            type: 'payment',
            title: 'Payment Received',
            message: 'Payment of ₹42,500 received for order #ORD-2010',
            time: '2 hours ago',
            user: 'Finance System',
            amount: 42500,
            link: `/${tenant}/finance/transactions/TXN-8752`
          },
          {
            id: '3',
            type: 'lead',
            title: 'New Lead',
            message: 'New lead registered: Global Solutions Ltd',
            time: '3 hours ago',
            user: 'Website Form',
            link: `/${tenant}/leads/LD-4231`
          },
          {
            id: '4',
            type: 'client',
            title: 'Client Update',
            message: 'TechStart Inc updated their profile information',
            time: '5 hours ago',
            user: 'Client Portal',
            link: `/${tenant}/clients/CL-1089`
          },
          {
            id: '5',
            type: 'order',
            title: 'Order Completed',
            message: 'Order #ORD-1982 has been marked as completed',
            time: 'Yesterday',
            user: 'John Smith',
            status: 'completed',
            link: `/${tenant}/orders/ORD-1982`
          },
          {
            id: '6',
            type: 'document',
            title: 'Document Uploaded',
            message: 'Invoice INV-2245.pdf uploaded to client files',
            time: 'Yesterday',
            user: 'Finance Department',
            link: `/${tenant}/documents/DOC-5521`
          },
          {
            id: '7',
            type: 'communication',
            title: 'Email Sent',
            message: 'Proposal sent to Digital Agency Pro via email',
            time: '2 days ago',
            user: 'Email System',
            link: `/${tenant}/communications/history/CM-9982`
          },
          {
            id: '8',
            type: 'invoice',
            title: 'Invoice Generated',
            message: 'Invoice #INV-2245 generated for ₹68,200',
            time: '2 days ago',
            user: 'System',
            amount: 68200,
            link: `/${tenant}/finance/invoices/INV-2245`
          }
        ]
        return mockActivities
      }
    }
  })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCartIcon className="h-4 w-4" aria-hidden="true" />
      case 'client':
        return <UserIcon className="h-4 w-4" aria-hidden="true" />
      case 'payment':
        return <CurrencyDollarIcon className="h-4 w-4" aria-hidden="true" />
      case 'lead':
        return <UserPlusIcon className="h-4 w-4" aria-hidden="true" />
      case 'invoice':
        return <DocumentIcon className="h-4 w-4" aria-hidden="true" />
      case 'document':
        return <DocumentIcon className="h-4 w-4" aria-hidden="true" />
      case 'notification':
        return <InboxIcon className="h-4 w-4" aria-hidden="true" />
      case 'communication':
        return <PhoneIcon className="h-4 w-4" aria-hidden="true" />
      default:
        return <ClockIcon className="h-4 w-4" aria-hidden="true" />
    }
  }
  
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100 text-blue-600'
      case 'client':
        return 'bg-green-100 text-green-600'
      case 'payment':
        return 'bg-purple-100 text-purple-600'
      case 'lead':
        return 'bg-yellow-100 text-yellow-600'
      case 'invoice':
        return 'bg-indigo-100 text-indigo-600'
      case 'document':
        return 'bg-sky-100 text-sky-600'
      case 'notification':
        return 'bg-red-100 text-red-600'
      case 'communication':
        return 'bg-orange-100 text-orange-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  // Ensure activities is always an array
  const safeActivities: Activity[] = Array.isArray(activities) ? activities : []

  return (
    <div className="bg-white shadow-sm rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Recent Activity
        </h3>
        <Link 
          href={`/${tenant}/notifications`} 
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          View all
        </Link>
      </div>
      
      <div className="px-5 py-3">
        {isLoading ? (
          <div className="space-y-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start space-x-3">
                <div className="rounded-full bg-gray-200 h-9 w-9"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {safeActivities.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== (safeActivities.length - 1) ? (
                      <span
                        className="absolute left-4 top-5 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center ring-4 ring-white ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="flex justify-between items-center mb-0.5">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-500 whitespace-nowrap">
                              {activity.time}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mb-0.5 leading-tight">
                            {activity.message}
                          </p>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-500 flex items-center">
                              <UserIcon className="h-3 w-3 mr-1" />
                              {activity.user}
                            </p>
                            
                            {activity.status && (
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                                activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {activity.status}
                              </span>
                            )}
                            
                            {activity.amount && (
                              <span className="text-xs font-medium text-gray-900">
                                ₹{activity.amount.toLocaleString()}
                              </span>
                            )}
                            
                            {activity.link && (
                              <Link 
                                href={activity.link}
                                className="text-xs font-medium text-blue-600 hover:text-blue-500"
                              >
                                Details
                              </Link>
                            )}
                          </div>
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
