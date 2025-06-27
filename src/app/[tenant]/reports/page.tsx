'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ChartBarIcon,
  DocumentChartBarIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  PrinterIcon
} from '@heroicons/react/24/outline'

export default function ReportsPage() {
  const params = useParams()
  const tenant = params.tenant as string

  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const reportCategories = [
    {
      title: 'Financial Reports',
      icon: CurrencyRupeeIcon,
      reports: [
        {
          id: 'profit-loss',
          name: 'Profit & Loss Statement',
          description: 'Income and expense statement for the period',
          href: `/finance/reports/profit-loss`
        },
        {
          id: 'balance-sheet',
          name: 'Balance Sheet',
          description: 'Assets, liabilities and equity overview',
          href: `/finance/reports/balance-sheet`
        },
        {
          id: 'cash-flow',
          name: 'Cash Flow Statement',
          description: 'Cash receipts and payments analysis',
          href: `/finance/reports/cash-flow`
        },
        {
          id: 'gst-report',
          name: 'GST Report',
          description: 'Tax collected and paid summary',
          href: `/finance/reports/gst`
        }
      ]
    },
    {
      title: 'Sales Reports',
      icon: ShoppingCartIcon,
      reports: [
        {
          id: 'sales-summary',
          name: 'Sales Summary',
          description: 'Total sales performance and trends',
          href: `/reports/sales-summary`
        },
        {
          id: 'order-analysis',
          name: 'Order Analysis',
          description: 'Detailed order breakdown and metrics',
          href: `/reports/order-analysis`
        },
        {
          id: 'payment-status',
          name: 'Payment Status Report',
          description: 'Outstanding payments and collections',
          href: `/reports/payment-status`
        },
        {
          id: 'product-performance',
          name: 'Product Performance',
          description: 'Best and worst performing products',
          href: `/reports/product-performance`
        }
      ]
    },
    {
      title: 'Client Reports',
      icon: UserGroupIcon,
      reports: [
        {
          id: 'client-summary',
          name: 'Client Summary',
          description: 'Client acquisition and retention metrics',
          href: `/reports/client-summary`
        },
        {
          id: 'top-clients',
          name: 'Top Clients Report',
          description: 'Highest revenue generating clients',
          href: `/reports/top-clients`
        },
        {
          id: 'client-aging',
          name: 'Client Aging Report',
          description: 'Outstanding dues by client age',
          href: `/reports/client-aging`
        }
      ]
    },
    {
      title: 'Operational Reports',
      icon: ChartBarIcon,
      reports: [
        {
          id: 'daily-summary',
          name: 'Daily Summary',
          description: 'Daily operations and performance overview',
          href: `/reports/daily-summary`
        },
        {
          id: 'monthly-trends',
          name: 'Monthly Trends',
          description: 'Month-over-month performance analysis',
          href: `/reports/monthly-trends`
        },
        {
          id: 'user-activity',
          name: 'User Activity Report',
          description: 'User engagement and activity logs',
          href: `/reports/user-activity`
        }
      ]
    }
  ]

  const generateReport = async (reportId: string) => {
    setLoading(true)
    setSelectedReport(reportId)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock report data
      const mockData = {
        'sales-summary': {
          totalSales: 125000,
          totalOrders: 245,
          avgOrderValue: 510,
          topProducts: ['Digital Ads', 'Print Ads', 'Radio Spots'],
          salesTrend: [
            { month: 'Jan', sales: 45000 },
            { month: 'Feb', sales: 52000 },
            { month: 'Mar', sales: 28000 }
          ]
        },
        'client-summary': {
          totalClients: 150,
          newClients: 25,
          retentionRate: 85,
          topClients: [
            { name: 'ABC Corp', revenue: 25000 },
            { name: 'XYZ Ltd', revenue: 18000 },
            { name: 'DEF Inc', revenue: 15000 }
          ]
        }
      }
      
      setReportData(mockData[reportId as keyof typeof mockData] || {})
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    alert(`Exporting report as ${format.toUpperCase()}...`)
  }

  const printReport = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate comprehensive business reports</p>
        </div>
        
        {/* Date Range Selector */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Categories */}
        <div className="lg:col-span-1 space-y-6">
          {reportCategories.map((category) => {
            const Icon = category.icon
            return (
              <div key={category.title} className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">{category.title}</h3>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {category.reports.map((report) => (
                    <button
                      key={report.id}
                      onClick={() => generateReport(report.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedReport === report.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{report.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{report.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Report Content */}
        <div className="lg:col-span-2">
          {!selectedReport ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <DocumentChartBarIcon className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Select a Report</h3>
              <p className="mt-2 text-gray-500">Choose a report from the categories on the left to get started</p>
            </div>
          ) : loading ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Generating report...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Report Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {reportCategories
                        .flatMap(cat => cat.reports)
                        .find(r => r.id === selectedReport)?.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Period: {dateRange.from} to {dateRange.to}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={printReport}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <PrinterIcon className="h-4 w-4 mr-2" />
                      Print
                    </button>
                    <div className="inline-flex rounded-lg border border-gray-300 bg-white">
                      <button
                        onClick={() => exportReport('pdf')}
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-l-lg"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => exportReport('excel')}
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border-l border-gray-300"
                      >
                        Excel
                      </button>
                      <button
                        onClick={() => exportReport('csv')}
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-r-lg border-l border-gray-300"
                      >
                        CSV
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Content */}
              <div className="p-6">
                {selectedReport === 'sales-summary' && reportData && (
                  <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          ₹{reportData.totalSales?.toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-700">Total Sales</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {reportData.totalOrders}
                        </div>
                        <div className="text-sm text-green-700">Total Orders</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          ₹{reportData.avgOrderValue}
                        </div>
                        <div className="text-sm text-purple-700">Avg Order Value</div>
                      </div>
                    </div>

                    {/* Sales Trend Chart Placeholder */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Sales Trend</h4>
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <ChartBarIcon className="h-12 w-12 mx-auto mb-2" />
                          <p>Chart visualization would appear here</p>
                        </div>
                      </div>
                    </div>

                    {/* Top Products */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Top Products</h4>
                      <div className="space-y-2">
                        {reportData.topProducts?.map((product: string, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                            <span className="font-medium">{product}</span>
                            <span className="text-gray-500">#{index + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedReport === 'client-summary' && reportData && (
                  <div className="space-y-6">
                    {/* Client Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {reportData.totalClients}
                        </div>
                        <div className="text-sm text-blue-700">Total Clients</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {reportData.newClients}
                        </div>
                        <div className="text-sm text-green-700">New Clients</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {reportData.retentionRate}%
                        </div>
                        <div className="text-sm text-orange-700">Retention Rate</div>
                      </div>
                    </div>

                    {/* Top Clients */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Top Clients by Revenue</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Client Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Revenue
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.topClients?.map((client: any, index: number) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {client.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ₹{client.revenue.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Default content for other reports */}
                {!['sales-summary', 'client-summary'].includes(selectedReport) && (
                  <div className="text-center py-12">
                    <DocumentChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Report Preview</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This report would contain detailed analysis and visualizations for {selectedReport}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
