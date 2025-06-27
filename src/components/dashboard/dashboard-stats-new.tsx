'use client'

import { useDashboardStats } from '@/hooks/use-dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, ShoppingCart, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface DashboardStatsProps {
  tenant: string
}

export function DashboardStatsNew({ tenant }: DashboardStatsProps) {
  const { data: stats, isLoading, error } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-sm text-gray-500">Failed to load stats</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statsData = [
    {
      title: 'Total Clients',
      value: stats.clients.total,
      change: stats.clients.growth,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: `${stats.clients.new} new this period`,
    },
    {
      title: 'Total Orders',
      value: stats.orders.total,
      change: stats.orders.growth,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: `${stats.orders.pending} pending, ${stats.orders.overdue} overdue`,
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.revenue.total),
      change: stats.revenue.growth,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: `${formatCurrency(stats.revenue.paid)} paid, ${formatCurrency(stats.revenue.pending)} pending`,
    },
    {
      title: 'Growth Rate',
      value: `${stats.revenue.growth > 0 ? '+' : ''}${stats.revenue.growth.toFixed(1)}%`,
      change: stats.revenue.growth,
      icon: stats.revenue.growth >= 0 ? TrendingUp : TrendingDown,
      color: stats.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stats.revenue.growth >= 0 ? 'bg-green-50' : 'bg-red-50',
      description: 'Compared to last period',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon
        const isPositive = stat.change >= 0
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                <Icon className={cn('h-4 w-4', stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">
                {typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">
                  {stat.description}
                </p>
                {stat.change !== undefined && stat.title !== 'Growth Rate' && (
                  <Badge 
                    variant={isPositive ? 'success' : 'destructive'}
                    className="text-xs"
                  >
                    {isPositive ? '+' : ''}{stat.change.toFixed(1)}%
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
