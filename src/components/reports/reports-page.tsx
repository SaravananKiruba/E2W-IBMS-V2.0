'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Download, FileText, BarChart3, PieChart, TrendingUp, 
  Users, ShoppingCart, DollarSign, Calendar, Filter,
  Eye, Send, Printer
} from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

export function ReportsPage() {
  const params = useParams()
  const tenant = params.tenant as string
  
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })

  const reportCategories = [
    {
      id: 'financial',
      name: 'Financial Reports',
      icon: DollarSign,
      reports: [
        { id: 'profit-loss', name: 'Profit & Loss Statement', description: 'Revenue and expense summary' },
        { id: 'balance-sheet', name: 'Balance Sheet', description: 'Assets, liabilities and equity' },
        { id: 'cash-flow', name: 'Cash Flow Statement', description: 'Cash receipts and payments' },
        { id: 'gst-report', name: 'GST Report', description: 'Tax collection and payment summary' },
        { id: 'invoice-summary', name: 'Invoice Summary', description: 'Invoice generation and payment status' }
      ]
    },
    {
      id: 'sales',
      name: 'Sales Reports',
      icon: TrendingUp,
      reports: [
        { id: 'sales-summary', name: 'Sales Summary', description: 'Overall sales performance' },
        { id: 'client-wise-sales', name: 'Client-wise Sales', description: 'Sales breakdown by client' },
        { id: 'medium-wise-sales', name: 'Medium-wise Sales', description: 'Sales by advertising medium' },
        { id: 'monthly-sales', name: 'Monthly Sales Trend', description: 'Sales trends over time' },
        { id: 'top-performers', name: 'Top Performers', description: 'Best performing clients and mediums' }
      ]
    },
    {
      id: 'operational',
      name: 'Operational Reports',
      icon: BarChart3,
      reports: [
        { id: 'order-status', name: 'Order Status Report', description: 'Current status of all orders' },
        { id: 'delivery-report', name: 'Delivery Report', description: 'Delivery schedules and completion' },
        { id: 'pending-orders', name: 'Pending Orders', description: 'Orders awaiting processing' },
        { id: 'overdue-orders', name: 'Overdue Orders', description: 'Orders past delivery date' },
        { id: 'productivity', name: 'Productivity Report', description: 'Team and process efficiency' }
      ]
    },
    {
      id: 'client',
      name: 'Client Reports',
      icon: Users,
      reports: [
        { id: 'client-analysis', name: 'Client Analysis', description: 'Client behavior and preferences' },
        { id: 'client-acquisition', name: 'Client Acquisition', description: 'New client growth trends' },
        { id: 'client-retention', name: 'Client Retention', description: 'Client loyalty and repeat business' },
        { id: 'client-profitability', name: 'Client Profitability', description: 'Revenue per client analysis' },
        { id: 'payment-behavior', name: 'Payment Behavior', description: 'Client payment patterns' }
      ]
    }
  ]

  const [selectedCategory, setSelectedCategory] = useState('financial')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  const currentCategory = reportCategories.find(cat => cat.id === selectedCategory)

  const handleGenerateReport = (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Generating ${reportId} as ${format}`)
    // Implementation for report generation
  }

  const handleViewReport = (reportId: string) => {
    setSelectedReport(reportId)
  }

  const renderReportPreview = () => {
    if (!selectedReport) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Report</h3>
            <p className="text-gray-600">Choose a report from the list to preview and generate</p>
          </div>
        </div>
      )
    }

    // Mock report data based on selected report
    const renderMockReportData = () => {
      switch (selectedReport) {
        case 'profit-loss':
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Profit & Loss Statement</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800">Revenue</h4>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Advertising Revenue</span>
                      <span>{formatCurrency(450000)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Service Revenue</span>
                      <span>{formatCurrency(50000)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-green-700 border-t pt-1">
                      <span>Total Revenue</span>
                      <span>{formatCurrency(500000)}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-800">Expenses</h4>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Operational</span>
                      <span>{formatCurrency(150000)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Administrative</span>
                      <span>{formatCurrency(80000)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-red-700 border-t pt-1">
                      <span>Total Expenses</span>
                      <span>{formatCurrency(230000)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-blue-800">Net Profit</span>
                  <span className="text-xl font-bold text-blue-600">{formatCurrency(270000)}</span>
                </div>
                <div className="text-sm text-blue-600 mt-1">Profit Margin: 54%</div>
              </div>
            </div>
          )

        case 'sales-summary':
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sales Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">127</div>
                  <div className="text-sm text-blue-800">Total Orders</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(500000)}</div>
                  <div className="text-sm text-green-800">Total Revenue</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{formatCurrency(3937)}</div>
                  <div className="text-sm text-purple-800">Avg. Order Value</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Top Performing Mediums</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Newspaper</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <span className="text-sm">{formatCurrency(325000)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Digital</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                      <span className="text-sm">{formatCurrency(125000)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Radio</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                      <span className="text-sm">{formatCurrency(50000)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )

        case 'client-analysis':
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Client Analysis</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800">Client Segments</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Enterprise (50K+)</span>
                      <Badge variant="default">12 clients</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">SME (10K-50K)</span>
                      <Badge variant="secondary">28 clients</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Small (Under 10K)</span>
                      <Badge variant="outline">45 clients</Badge>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800">Top Clients</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>ABC Corporation</span>
                      <span>{formatCurrency(75000)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>XYZ Industries</span>
                      <span>{formatCurrency(62000)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>PQR Ltd</span>
                      <span>{formatCurrency(48000)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )

        default:
          return (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Report Preview</h3>
              <p className="text-gray-600">This report is being prepared. Preview will be available soon.</p>
            </div>
          )
      }
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Report Preview</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleGenerateReport(selectedReport, 'pdf')}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleGenerateReport(selectedReport, 'excel')}>
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-6">
          {renderMockReportData()}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate comprehensive business reports and insights</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Reports
          </Button>
          <Button variant="outline">
            <Send className="h-4 w-4 mr-2" />
            Email Reports
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium mb-2">From Date</label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="w-40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">To Date</label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="w-40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Quick Ranges</label>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Categories */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Report Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reportCategories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setSelectedReport(null)
                    }}
                    className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs text-gray-500">{category.reports.length} reports</div>
                    </div>
                  </button>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Report List and Preview */}
        <div className="lg:col-span-3 space-y-6">
          {/* Available Reports */}
          <Card>
            <CardHeader>
              <CardTitle>{currentCategory?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentCategory?.reports.map((report) => (
                  <div
                    key={report.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedReport === report.id 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleViewReport(report.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{report.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                      </div>
                      <div className="flex space-x-1 ml-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewReport(report.id)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleGenerateReport(report.id, 'pdf')
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Report Preview */}
          <Card>
            <CardContent className="pt-6">
              {renderReportPreview()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
