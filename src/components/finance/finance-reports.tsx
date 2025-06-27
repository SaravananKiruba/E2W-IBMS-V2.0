'use client'

import { useState } from 'react'
import { useFinanceReports } from '@/hooks/use-finance'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { 
  Download, FileText, BarChart3, PieChart, 
  TrendingUp, Calendar, Filter
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface FinanceReportsProps {
  tenant: string
}

export function FinanceReports({ tenant }: FinanceReportsProps) {
  const [reportType, setReportType] = useState('profit-loss')
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })

  const { data: reportData, isLoading } = useFinanceReports(reportType, {
    dateFrom: dateRange.from,
    dateTo: dateRange.to
  })

  const reportTypes = [
    { value: 'profit-loss', label: 'Profit & Loss Statement', icon: TrendingUp },
    { value: 'balance-sheet', label: 'Balance Sheet', icon: BarChart3 },
    { value: 'cash-flow', label: 'Cash Flow Statement', icon: PieChart },
    { value: 'gst-report', label: 'GST Report', icon: FileText },
    { value: 'expense-analysis', label: 'Expense Analysis', icon: PieChart },
    { value: 'revenue-analysis', label: 'Revenue Analysis', icon: TrendingUp }
  ]

  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    // Implementation for export functionality
    console.log(`Exporting ${reportType} as ${format}`)
  }

  const renderProfitLossReport = () => {
    if (!reportData) return null

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profit & Loss Statement</CardTitle>
            <p className="text-sm text-gray-600">
              For the period: {formatDate(dateRange.from)} to {formatDate(dateRange.to)}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Revenue Section */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-3">Revenue</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Advertising Revenue</span>
                    <span className="font-medium">{formatCurrency(reportData.advertising_revenue || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Revenue</span>
                    <span className="font-medium">{formatCurrency(reportData.service_revenue || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold text-green-700">
                    <span>Total Revenue</span>
                    <span>{formatCurrency(reportData.total_revenue || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Expenses Section */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-3">Expenses</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Operational Expenses</span>
                    <span className="font-medium">{formatCurrency(reportData.operational_expenses || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marketing Expenses</span>
                    <span className="font-medium">{formatCurrency(reportData.marketing_expenses || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Administrative Expenses</span>
                    <span className="font-medium">{formatCurrency(reportData.admin_expenses || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold text-red-700">
                    <span>Total Expenses</span>
                    <span>{formatCurrency(reportData.total_expenses || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Net Profit/Loss */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-blue-800">Net Profit/Loss</span>
                  <span className={`font-bold text-lg ${
                    (reportData.total_revenue || 0) - (reportData.total_expenses || 0) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {formatCurrency((reportData.total_revenue || 0) - (reportData.total_expenses || 0))}
                  </span>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>Profit Margin</span>
                  <span>
                    {reportData.total_revenue ? 
                      (((reportData.total_revenue - reportData.total_expenses) / reportData.total_revenue) * 100).toFixed(2) 
                      : 0
                    }%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderGSTReport = () => {
    if (!reportData) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle>GST Report</CardTitle>
          <p className="text-sm text-gray-600">
            GST Summary for: {formatDate(dateRange.from)} to {formatDate(dateRange.to)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">GST Collected</h3>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(reportData.gst_collected || 0)}
              </p>
              <p className="text-sm text-gray-600">On sales</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-800">GST Paid</h3>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(reportData.gst_paid || 0)}
              </p>
              <p className="text-sm text-gray-600">On purchases</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Net GST</h3>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency((reportData.gst_collected || 0) - (reportData.gst_paid || 0))}
              </p>
              <p className="text-sm text-gray-600">Payable/Refundable</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderGenericReport = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {reportTypes.find(r => r.value === reportType)?.label}
          </CardTitle>
          <p className="text-sm text-gray-600">
            Report for: {formatDate(dateRange.from)} to {formatDate(dateRange.to)}
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Loading report data...</div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Report Data Not Available
              </h3>
              <p className="text-gray-600">
                This report type is being prepared. Please check back later.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderReportContent = () => {
    switch (reportType) {
      case 'profit-loss':
        return renderProfitLossReport()
      case 'gst-report':
        return renderGSTReport()
      default:
        return renderGenericReport()
    }
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Financial Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            {/* Report Type Selection */}
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        <type.icon className="h-4 w-4 mr-2" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="flex items-center space-x-2">
              <div>
                <label className="block text-sm font-medium mb-2">From</label>
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="w-40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">To</label>
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="w-40"
                />
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex items-end space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExportReport('pdf')}
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExportReport('excel')}
              >
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExportReport('csv')}
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {renderReportContent()}
    </div>
  )
}
