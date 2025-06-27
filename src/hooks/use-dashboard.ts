import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api'
import type { DashboardStats, RecentActivity, RevenueChartData, TopClient } from '@/types'

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: (filters?: any) => [...dashboardKeys.all, 'stats', filters] as const,
  activity: () => [...dashboardKeys.all, 'activity'] as const,
  revenueChart: (filters?: any) => [...dashboardKeys.all, 'revenue-chart', filters] as const,
  topClients: (filters?: any) => [...dashboardKeys.all, 'top-clients', filters] as const,
}

// Custom hooks for dashboard data
export function useDashboardStats(filters?: any) {
  return useQuery({
    queryKey: dashboardKeys.stats(filters),
    queryFn: async () => {
      const response = await dashboardApi.getStats(filters)
      return response.data as DashboardStats
    },
    staleTime: 1 * 60 * 1000, // 1 minute - dashboard data should be fresh
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  })
}

export function useRecentActivity() {
  return useQuery({
    queryKey: dashboardKeys.activity(),
    queryFn: async () => {
      const response = await dashboardApi.getRecentActivity()
      return response.data as RecentActivity[]
    },
    staleTime: 30 * 1000, // 30 seconds - activity should be very fresh
    refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes
  })
}

export function useRevenueChart(filters?: any) {
  return useQuery({
    queryKey: dashboardKeys.revenueChart(filters),
    queryFn: async () => {
      const response = await dashboardApi.getRevenueChart(filters)
      return response.data as RevenueChartData[]
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useTopClients(filters?: any) {
  return useQuery({
    queryKey: dashboardKeys.topClients(filters),
    queryFn: async () => {
      const response = await dashboardApi.getTopClients(filters)
      return response.data as TopClient[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Combined dashboard data hook
export function useDashboardData(filters?: any) {
  const stats = useDashboardStats(filters)
  const activity = useRecentActivity()
  const revenueChart = useRevenueChart(filters)
  const topClients = useTopClients(filters)

  return {
    stats: stats.data,
    activity: activity.data,
    revenueChart: revenueChart.data,
    topClients: topClients.data,
    isLoading: stats.isLoading || activity.isLoading || revenueChart.isLoading || topClients.isLoading,
    isError: stats.isError || activity.isError || revenueChart.isError || topClients.isError,
    error: stats.error || activity.error || revenueChart.error || topClients.error,
  }
}
