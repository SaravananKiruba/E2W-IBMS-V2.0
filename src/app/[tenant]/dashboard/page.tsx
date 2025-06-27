import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { RecentActivity } from '@/components/dashboard/recent-activity'

interface DashboardPageProps {
  params: { tenant: string }
}

export default function DashboardPage({ params }: DashboardPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your business management dashboard</p>
      </div>
      
      <DashboardStats tenant={params.tenant} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardContent tenant={params.tenant} />
        </div>
        <div>
          <RecentActivity tenant={params.tenant} />
        </div>
      </div>
    </div>
  )
}
