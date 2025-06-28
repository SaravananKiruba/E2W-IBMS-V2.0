'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign, 
  FileText,
  Calendar,
  Target,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Eye,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Zap,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AnalyticsPageProps {
  tenant?: string
}

export function AnalyticsPage({ tenant = 'test' }: AnalyticsPageProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  // Mock data - would come from API in real implementation
  const overviewMetrics = {
    totalRevenue: 2456789,
    revenueGrowth: 12.5,
    totalOrders: 1247,
    ordersGrowth: 8.3,
    totalClients: 456,
    clientsGrowth: 15.2,
    avgOrderValue: 1970,
    avgOrderValueGrowth: -2.1,
    conversionRate: 3.2,
    conversionRateGrowth: 0.8,
    customerSatisfaction: 4.6,
    satisfactionGrowth: 5.2
  }

  const revenueData = [
    { month: 'Jan', revenue: 185000, orders: 124, clients: 89 },
    { month: 'Feb', revenue: 195000, orders: 132, clients: 94 },
    { month: 'Mar', revenue: 203000, orders: 128, clients: 98 },
    { month: 'Apr', revenue: 218000, orders: 145, clients: 102 },
    { month: 'May', revenue: 225000, orders: 151, clients: 108 },
    { month: 'Jun', revenue: 242000, orders: 156, clients: 115 }
  ]

  const topPerformingServices = [
    { name: 'Digital Marketing', revenue: 485000, orders: 89, growth: 15.2 },
    { name: 'Web Development', revenue: 425000, orders: 65, growth: 12.8 },
    { name: 'SEO Services', revenue: 385000, orders: 156, growth: 18.5 },
    { name: 'Content Creation', revenue: 325000, orders: 198, growth: 8.9 },
    { name: 'Social Media Management', revenue: 285000, orders: 245, growth: 22.1 }
  ]

  const clientAnalytics = [
    { segment: 'Enterprise', count: 25, revenue: 1250000, avgOrder: 50000, retention: 95 },
    { segment: 'Mid-Market', count: 85, revenue: 850000, avgOrder: 10000, retention: 88 },
    { segment: 'Small Business', count: 245, revenue: 356789, avgOrder: 1456, retention: 72 },
    { segment: 'Startup', count: 101, revenue: 125000, avgOrder: 1238, retention: 65 }
  ]

  const performanceIndicators = [
    { metric: 'Order Fulfillment Rate', value: 96.5, target: 95, status: 'good', trend: 'up' },
    { metric: 'Customer Acquisition Cost', value: 245, target: 300, status: 'excellent', trend: 'down' },
    { metric: 'Average Response Time', value: 2.3, target: 4, status: 'excellent', trend: 'down' },
    { metric: 'Client Retention Rate', value: 84.2, target: 85, status: 'warning', trend: 'down' },
    { metric: 'Project Success Rate', value: 92.8, target: 90, status: 'good', trend: 'up' },
    { metric: 'Revenue per Client', value: 5389, target: 5000, status: 'good', trend: 'up' }
  ]

  const recentInsights = [
    {
      id: '1',
      type: 'opportunity',
      title: 'Digital Marketing Revenue Surge',
      description: 'Digital marketing services showing 15.2% growth - consider expanding team',
      impact: 'high',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      actions: ['Hire specialists', 'Increase capacity']
    },
    {
      id: '2',
      type: 'warning',
      title: 'Client Retention Dip',
      description: 'Small business segment retention dropped to 72% - review service quality',
      impact: 'medium',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      actions: ['Improve support', 'Conduct surveys']
    },
    {
      id: '3',
      type: 'success',
      title: 'Acquisition Cost Optimization',
      description: 'Customer acquisition cost reduced by 18% through improved targeting',
      impact: 'high',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      actions: ['Scale strategy', 'Increase budget']
    }
  ]

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'revenue': return DollarSign
      case 'orders': return FileText
      case 'clients': return Users
      case 'performance': return Target
      default: return BarChart3
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return Zap
      case 'warning': return AlertCircle
      case 'success': return CheckCircle
      default: return Activity
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'text-blue-600 bg-blue-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'success': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatGrowth = (growth: number) => {
    const isPositive = growth > 0
    return (
      <span className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
        {Math.abs(growth)}%
      </span>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-gray-600">Comprehensive business intelligence and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(overviewMetrics.totalRevenue)}</p>
                <div className="flex items-center gap-2 mt-1">
                  {formatGrowth(overviewMetrics.revenueGrowth)}
                  <span className="text-xs text-gray-500">vs last period</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{overviewMetrics.totalOrders.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-1">
                  {formatGrowth(overviewMetrics.ordersGrowth)}
                  <span className="text-xs text-gray-500">vs last period</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold">{overviewMetrics.totalClients}</p>
                <div className="flex items-center gap-2 mt-1">
                  {formatGrowth(overviewMetrics.clientsGrowth)}
                  <span className="text-xs text-gray-500">vs last period</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold">{formatCurrency(overviewMetrics.avgOrderValue)}</p>
                <div className="flex items-center gap-2 mt-1">
                  {formatGrowth(overviewMetrics.avgOrderValueGrowth)}
                  <span className="text-xs text-gray-500">vs last period</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  Revenue trend chart would be rendered here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Service Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  Service distribution pie chart would be rendered here
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformingServices.map((service, index) => (
                  <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{service.name}</h4>
                        <p className="text-sm text-gray-500">{service.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(service.revenue)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {formatGrowth(service.growth)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Monthly Recurring Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(385000)}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-green-600" />
                  <span className="text-sm text-green-600">8.5%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold">{overviewMetrics.conversionRate}%</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-green-600" />
                  <span className="text-sm text-green-600">{overviewMetrics.conversionRateGrowth}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Customer Satisfaction</p>
                <p className="text-2xl font-bold">{overviewMetrics.customerSatisfaction}/5</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-green-600" />
                  <span className="text-sm text-green-600">{overviewMetrics.satisfactionGrowth}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                Detailed revenue analytics chart would be rendered here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Segmentation Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientAnalytics.map((segment) => (
                  <div key={segment.segment} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">{segment.segment}</h4>
                      <Badge variant="outline">{segment.count} clients</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-xl font-bold">{formatCurrency(segment.revenue)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Avg Order Value</p>
                        <p className="text-xl font-bold">{formatCurrency(segment.avgOrder)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Retention Rate</p>
                        <p className="text-xl font-bold">{segment.retention}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Acquisition Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  Client acquisition chart would be rendered here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Lifetime Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  CLV analysis chart would be rendered here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {performanceIndicators.map((kpi) => (
                  <div key={kpi.metric} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{kpi.metric}</h4>
                      <div className={`p-1 rounded-full ${getStatusColor(kpi.status)}`}>
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{kpi.value}{kpi.metric.includes('Rate') ? '%' : kpi.metric.includes('Cost') || kpi.metric.includes('Revenue') ? '' : 'h'}</p>
                        <p className="text-sm text-gray-500">Target: {kpi.target}{kpi.metric.includes('Rate') ? '%' : kpi.metric.includes('Cost') || kpi.metric.includes('Revenue') ? '' : 'h'}</p>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center gap-1 ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {kpi.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          <span className="text-sm font-medium">{kpi.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  Performance trends chart would be rendered here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Goal Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Monthly Revenue Target</span>
                      <span className="text-sm text-gray-500">85% complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">New Client Acquisition</span>
                      <span className="text-sm text-gray-500">92% complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Project Completion Rate</span>
                      <span className="text-sm text-gray-500">78% complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                AI-Powered Business Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInsights.map((insight) => {
                  const IconComponent = getInsightIcon(insight.type)
                  return (
                    <div key={insight.id} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{insight.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant={insight.impact === 'high' ? 'default' : insight.impact === 'medium' ? 'secondary' : 'outline'}>
                                {insight.impact} impact
                              </Badge>
                              <span className="text-sm text-gray-500">{insight.date.toLocaleDateString()}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-3">{insight.description}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Suggested Actions:</span>
                            {insight.actions.map((action, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {action}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Predictive Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900">Revenue Forecast</h4>
                    <p className="text-sm text-blue-700 mt-1">Next month projected revenue: ₹2.8M (+14%)</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900">Growth Opportunity</h4>
                    <p className="text-sm text-green-700 mt-1">SEO services showing highest potential for expansion</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-900">Risk Alert</h4>
                    <p className="text-sm text-yellow-700 mt-1">3 clients at risk of churn based on engagement patterns</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Competitive Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">Market Position</span>
                    <Badge className="bg-green-100 text-green-800">#2 in Region</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">Price Competitiveness</span>
                    <Badge className="bg-blue-100 text-blue-800">Competitive</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">Service Quality Score</span>
                    <Badge className="bg-green-100 text-green-800">Above Average</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">Innovation Index</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Growing</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
