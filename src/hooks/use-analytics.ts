import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface DashboardMetrics {
  revenue: {
    total_revenue: number;
    total_orders: number;
    avg_order_value: number;
  };
  clients: {
    total_clients: number;
    new_clients: number;
    active_clients: number;
  };
  order_status: Array<{
    status: string;
    count: number;
  }>;
  growth: {
    revenue_growth: number;
  };
}

export interface RevenueAnalytics {
  time_series: Array<{
    period: string;
    revenue: number;
    orders: number;
    avg_order_value: number;
  }>;
  by_service: Array<{
    service_type: string;
    revenue: number;
    orders: number;
    avg_value: number;
  }>;
  top_clients: Array<{
    id: number;
    name: string;
    total_revenue: number;
    total_orders: number;
  }>;
  summary: {
    total_revenue: number;
    total_orders: number;
    avg_daily_revenue: number;
  };
}

export interface ClientAnalytics {
  acquisition?: Array<{
    date: string;
    new_clients: number;
  }>;
  retention?: {
    total_clients: number;
    retained_clients: number;
    retention_rate: number;
  };
  lifetime_value?: Array<{
    id: number;
    name: string;
    total_orders: number;
    lifetime_value: number;
    avg_order_value: number;
    customer_lifespan_days: number;
  }>;
  segmentation?: any;
}

export interface OrderAnalytics {
  distribution: Array<{
    [key: string]: string | number;
    count: number;
    revenue: number;
  }>;
  completion_stats: {
    total_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    avg_completion_days: number;
  };
  trends: Array<{
    date: string;
    orders: number;
    revenue: number;
    completed: number;
  }>;
}

export interface PerformanceMetrics {
  efficiency?: any;
  productivity?: any;
  quality?: any;
}

export interface PredictiveAnalytics {
  revenue_forecast?: {
    historical: Array<{
      date: string;
      revenue: number;
    }>;
    forecast: Array<{
      date: string;
      predicted_revenue: number;
    }>;
    confidence_interval: number;
  };
  client_churn?: any;
  demand_forecast?: any;
}

export interface CohortAnalysis {
  cohorts: Array<{
    cohort_month: string;
    cohort_size: number;
    retained_clients: number;
  }>;
  metric: string;
  period: string;
}

export interface FunnelAnalysis {
  sales?: any;
  onboarding?: any;
}

export interface SegmentAnalysis {
  segments: Array<{
    segment: string;
    client_count: number;
    total_revenue: number;
    avg_revenue: number;
  }>;
  segment_by: string;
  metric: string;
}

export interface CustomReportConfig {
  period?: string;
  metrics: Array<{
    name: string;
    type: 'revenue' | 'clients' | 'orders';
    group_by?: string;
    metric?: string;
  }>;
}

export interface CustomReport {
  report_id: string;
  generated_at: string;
  config: CustomReportConfig;
  data: Record<string, any>;
}

// Mock API functions (replace with actual API calls)
const analyticsApi = {
  getDashboardMetrics: async (period = '30d', startDate?: string, endDate?: string): Promise<DashboardMetrics> => {
    // Mock data
    return {
      revenue: {
        total_revenue: 127500,
        total_orders: 89,
        avg_order_value: 1432.58
      },
      clients: {
        total_clients: 156,
        new_clients: 12,
        active_clients: 134
      },
      order_status: [
        { status: 'completed', count: 65 },
        { status: 'in_progress', count: 18 },
        { status: 'pending', count: 6 }
      ],
      growth: {
        revenue_growth: 12.5
      }
    };
  },

  getRevenueAnalytics: async (period = '30d', groupBy = 'day', startDate?: string, endDate?: string): Promise<RevenueAnalytics> => {
    // Mock data
    const mockTimeSeries = Array.from({ length: 30 }, (_, i) => ({
      period: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 5000) + 1000,
      orders: Math.floor(Math.random() * 10) + 1,
      avg_order_value: Math.floor(Math.random() * 2000) + 500
    }));

    return {
      time_series: mockTimeSeries,
      by_service: [
        { service_type: 'Web Development', revenue: 45000, orders: 15, avg_value: 3000 },
        { service_type: 'Consulting', revenue: 32000, orders: 25, avg_value: 1280 },
        { service_type: 'Design', revenue: 28000, orders: 20, avg_value: 1400 },
        { service_type: 'Marketing', revenue: 22500, orders: 29, avg_value: 776 }
      ],
      top_clients: [
        { id: 1, name: 'ABC Corporation', total_revenue: 15000, total_orders: 5 },
        { id: 2, name: 'XYZ Inc', total_revenue: 12500, total_orders: 8 },
        { id: 3, name: 'Tech Solutions Ltd', total_revenue: 9800, total_orders: 4 },
        { id: 4, name: 'Digital Ventures', total_revenue: 8200, total_orders: 6 }
      ],
      summary: {
        total_revenue: mockTimeSeries.reduce((sum, item) => sum + item.revenue, 0),
        total_orders: mockTimeSeries.reduce((sum, item) => sum + item.orders, 0),
        avg_daily_revenue: mockTimeSeries.reduce((sum, item) => sum + item.revenue, 0) / mockTimeSeries.length
      }
    };
  },

  getClientAnalytics: async (period = '30d', metric = 'acquisition'): Promise<ClientAnalytics> => {
    switch (metric) {
      case 'acquisition':
        return {
          acquisition: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            new_clients: Math.floor(Math.random() * 5)
          }))
        };
      case 'retention':
        return {
          retention: {
            total_clients: 156,
            retained_clients: 134,
            retention_rate: 85.9
          }
        };
      case 'lifetime_value':
        return {
          lifetime_value: [
            { id: 1, name: 'ABC Corporation', total_orders: 12, lifetime_value: 25000, avg_order_value: 2083, customer_lifespan_days: 365 },
            { id: 2, name: 'XYZ Inc', total_orders: 8, lifetime_value: 18000, avg_order_value: 2250, customer_lifespan_days: 280 },
            { id: 3, name: 'Tech Solutions', total_orders: 15, lifetime_value: 22500, avg_order_value: 1500, customer_lifespan_days: 420 }
          ]
        };
      default:
        return { acquisition: [] };
    }
  },

  getOrderAnalytics: async (period = '30d', groupBy = 'status'): Promise<OrderAnalytics> => {
    return {
      distribution: [
        { status: 'completed', count: 65, revenue: 85000 },
        { status: 'in_progress', count: 18, revenue: 28000 },
        { status: 'pending', count: 6, revenue: 14500 }
      ],
      completion_stats: {
        total_orders: 89,
        completed_orders: 65,
        cancelled_orders: 3,
        avg_completion_days: 14.5
      },
      trends: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        orders: Math.floor(Math.random() * 8) + 1,
        revenue: Math.floor(Math.random() * 4000) + 1000,
        completed: Math.floor(Math.random() * 6) + 1
      }))
    };
  },

  getPerformanceMetrics: async (period = '30d', metric = 'efficiency'): Promise<PerformanceMetrics> => {
    // Mock data based on metric type
    return {};
  },

  getPredictiveAnalytics: async (type = 'revenue_forecast', period = '90d'): Promise<PredictiveAnalytics> => {
    if (type === 'revenue_forecast') {
      const historical = Array.from({ length: 90 }, (_, i) => ({
        date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 3000) + 1000
      }));

      const forecast = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        predicted_revenue: Math.floor(Math.random() * 3500) + 1200
      }));

      return {
        revenue_forecast: {
          historical,
          forecast,
          confidence_interval: 0.8
        }
      };
    }
    return {};
  },

  generateCustomReport: async (config: CustomReportConfig): Promise<CustomReport> => {
    // Mock implementation
    const reportData: Record<string, any> = {};
    
    for (const metric of config.metrics) {
      switch (metric.type) {
        case 'revenue':
          reportData[metric.name] = await analyticsApi.getRevenueAnalytics(config.period, metric.group_by);
          break;
        case 'clients':
          reportData[metric.name] = await analyticsApi.getClientAnalytics(config.period, metric.metric);
          break;
        case 'orders':
          reportData[metric.name] = await analyticsApi.getOrderAnalytics(config.period, metric.group_by);
          break;
      }
    }

    return {
      report_id: `report_${Date.now()}`,
      generated_at: new Date().toISOString(),
      config,
      data: reportData
    };
  },

  getCohortAnalysis: async (metric = 'retention', period = 'monthly', startDate?: string, endDate?: string): Promise<CohortAnalysis> => {
    return {
      cohorts: [
        { cohort_month: '2023-10', cohort_size: 25, retained_clients: 20 },
        { cohort_month: '2023-11', cohort_size: 30, retained_clients: 22 },
        { cohort_month: '2023-12', cohort_size: 28, retained_clients: 24 },
        { cohort_month: '2024-01', cohort_size: 32, retained_clients: 28 }
      ],
      metric,
      period
    };
  },

  getFunnelAnalysis: async (funnelType = 'sales', period = '30d'): Promise<FunnelAnalysis> => {
    // Mock data
    return {};
  },

  getSegmentAnalysis: async (segmentBy = 'value', metric = 'revenue', period = '30d'): Promise<SegmentAnalysis> => {
    return {
      segments: [
        { segment: 'High Value', client_count: 15, total_revenue: 75000, avg_revenue: 5000 },
        { segment: 'Medium Value', client_count: 35, total_revenue: 87500, avg_revenue: 2500 },
        { segment: 'Low Value', client_count: 68, total_revenue: 68000, avg_revenue: 1000 },
        { segment: 'Minimal Value', client_count: 38, total_revenue: 19000, avg_revenue: 500 }
      ],
      segment_by: segmentBy,
      metric
    };
  },

  exportReport: async (reportType: string, format: string, period: string) => {
    // Mock implementation - would return file blob
    const data = await analyticsApi.getDashboardMetrics(period);
    const csv = 'metric,value\ntotal_revenue,' + data.revenue.total_revenue + '\ntotal_orders,' + data.revenue.total_orders;
    
    return new Blob([csv], { type: 'text/csv' });
  },
};

// Hooks
export const useDashboardMetrics = (period = '30d', startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['dashboardMetrics', period, startDate, endDate],
    queryFn: () => analyticsApi.getDashboardMetrics(period, startDate, endDate),
  });
};

export const useRevenueAnalytics = (period = '30d', groupBy = 'day', startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['revenueAnalytics', period, groupBy, startDate, endDate],
    queryFn: () => analyticsApi.getRevenueAnalytics(period, groupBy, startDate, endDate),
  });
};

export const useClientAnalytics = (period = '30d', metric = 'acquisition') => {
  return useQuery({
    queryKey: ['clientAnalytics', period, metric],
    queryFn: () => analyticsApi.getClientAnalytics(period, metric),
  });
};

export const useOrderAnalytics = (period = '30d', groupBy = 'status') => {
  return useQuery({
    queryKey: ['orderAnalytics', period, groupBy],
    queryFn: () => analyticsApi.getOrderAnalytics(period, groupBy),
  });
};

export const usePerformanceMetrics = (period = '30d', metric = 'efficiency') => {
  return useQuery({
    queryKey: ['performanceMetrics', period, metric],
    queryFn: () => analyticsApi.getPerformanceMetrics(period, metric),
  });
};

export const usePredictiveAnalytics = (type = 'revenue_forecast', period = '90d') => {
  return useQuery({
    queryKey: ['predictiveAnalytics', type, period],
    queryFn: () => analyticsApi.getPredictiveAnalytics(type, period),
  });
};

export const useCohortAnalysis = (metric = 'retention', period = 'monthly', startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['cohortAnalysis', metric, period, startDate, endDate],
    queryFn: () => analyticsApi.getCohortAnalysis(metric, period, startDate, endDate),
  });
};

export const useFunnelAnalysis = (funnelType = 'sales', period = '30d') => {
  return useQuery({
    queryKey: ['funnelAnalysis', funnelType, period],
    queryFn: () => analyticsApi.getFunnelAnalysis(funnelType, period),
  });
};

export const useSegmentAnalysis = (segmentBy = 'value', metric = 'revenue', period = '30d') => {
  return useQuery({
    queryKey: ['segmentAnalysis', segmentBy, metric, period],
    queryFn: () => analyticsApi.getSegmentAnalysis(segmentBy, metric, period),
  });
};

export const useGenerateCustomReport = () => {
  return useMutation({
    mutationFn: analyticsApi.generateCustomReport,
  });
};

export const useExportReport = () => {
  return useMutation({
    mutationFn: ({ reportType, format, period }: { reportType: string; format: string; period: string }) =>
      analyticsApi.exportReport(reportType, format, period),
  });
};
