'use client'

import { useState } from 'react'
import { useInvoices, useGenerateInvoice } from '@/hooks/use-finance'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  CreditCard, Clock, CheckCircle, AlertCircle, 
  Plus, Search, Download, Eye, Send
} from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

interface PaymentTrackerProps {
  tenant: string
}

interface PaymentRecord {
  id: string
  invoiceNumber: string
  clientName: string
  orderNumber: string
  amount: number
  paidAmount: number
  dueAmount: number
  dueDate: string
  status: 'paid' | 'partial' | 'overdue' | 'pending'
  paymentMethod?: string
  lastPaymentDate?: string
}

export function PaymentTracker({ tenant }: PaymentTrackerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null)

  const { data: invoicesData, isLoading } = useInvoices({
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  const generateInvoiceMutation = useGenerateInvoice()

  // Mock payment data - replace with actual API call
  const paymentRecords: PaymentRecord[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      clientName: 'ABC Corporation',
      orderNumber: 'ORD-001',
      amount: 50000,
      paidAmount: 50000,
      dueAmount: 0,
      dueDate: '2024-01-15',
      status: 'paid',
      paymentMethod: 'Bank Transfer',
      lastPaymentDate: '2024-01-10'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      clientName: 'XYZ Ltd',
      orderNumber: 'ORD-002',
      amount: 35000,
      paidAmount: 20000,
      dueAmount: 15000,
      dueDate: '2024-02-01',
      status: 'partial',
      paymentMethod: 'Cheque',
      lastPaymentDate: '2024-01-25'
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      clientName: 'PQR Industries',
      orderNumber: 'ORD-003',
      amount: 75000,
      paidAmount: 0,
      dueAmount: 75000,
      dueDate: '2024-01-20',
      status: 'overdue',
    },
    {
      id: '4',
      invoiceNumber: 'INV-2024-004',
      clientName: 'LMN Services',
      orderNumber: 'ORD-004',
      amount: 25000,
      paidAmount: 0,
      dueAmount: 25000,
      dueDate: '2024-02-15',
      status: 'pending',
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />
      case 'partial': return <Clock className="h-4 w-4" />
      case 'overdue': return <AlertCircle className="h-4 w-4" />
      case 'pending': return <CreditCard className="h-4 w-4" />
      default: return <CreditCard className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default'
      case 'partial': return 'secondary'
      case 'overdue': return 'destructive'
      case 'pending': return 'outline'
      default: return 'outline'
    }
  }

  const calculateSummary = () => {
    const totalAmount = paymentRecords.reduce((sum, record) => sum + record.amount, 0)
    const totalPaid = paymentRecords.reduce((sum, record) => sum + record.paidAmount, 0)
    const totalDue = paymentRecords.reduce((sum, record) => sum + record.dueAmount, 0)
    const overdueAmount = paymentRecords
      .filter(record => record.status === 'overdue')
      .reduce((sum, record) => sum + record.dueAmount, 0)

    return { totalAmount, totalPaid, totalDue, overdueAmount }
  }

  const summary = calculateSummary()

  const paymentColumns = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice',
      cell: ({ row }: any) => {
        const record = row.original as PaymentRecord
        return (
          <div className="font-medium">
            <div className="text-sm text-gray-900">{record.invoiceNumber}</div>
            <div className="text-xs text-gray-500">{record.orderNumber}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'clientName',
      header: 'Client',
      cell: ({ row }: any) => {
        const record = row.original as PaymentRecord
        return <div className="font-medium">{record.clientName}</div>
      },
    },
    {
      accessorKey: 'amount',
      header: 'Invoice Amount',
      cell: ({ row }: any) => {
        const record = row.original as PaymentRecord
        return (
          <div className="text-right">
            <div className="font-medium">{formatCurrency(record.amount)}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'paidAmount',
      header: 'Paid Amount',
      cell: ({ row }: any) => {
        const record = row.original as PaymentRecord
        return (
          <div className="text-right">
            <div className="font-medium text-green-600">{formatCurrency(record.paidAmount)}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'dueAmount',
      header: 'Due Amount',
      cell: ({ row }: any) => {
        const record = row.original as PaymentRecord
        return (
          <div className="text-right">
            <div className={`font-medium ${record.dueAmount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
              {formatCurrency(record.dueAmount)}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }: any) => {
        const record = row.original as PaymentRecord
        const isOverdue = new Date(record.dueDate) < new Date() && record.status !== 'paid'
        return (
          <div className={`text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
            {formatDate(record.dueDate)}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const record = row.original as PaymentRecord
        return (
          <Badge variant={getStatusColor(record.status) as any} className="flex items-center w-fit">
            {getStatusIcon(record.status)}
            <span className="ml-1">{record.status}</span>
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const record = row.original as PaymentRecord
        return (
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            {record.status !== 'paid' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedRecord(record)
                  setIsPaymentDialogOpen(true)
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Total Invoiced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalAmount)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Total Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalPaid)}</div>
            <div className="text-xs text-gray-500">
              {((summary.totalPaid / summary.totalAmount) * 100).toFixed(1)}% collected
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Total Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(summary.totalDue)}</div>
            <div className="text-xs text-gray-500">
              {paymentRecords.filter(r => r.status !== 'paid').length} pending invoices
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Overdue Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.overdueAmount)}</div>
            <div className="text-xs text-gray-500">
              {paymentRecords.filter(r => r.status === 'overdue').length} overdue invoices
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Tracking Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment Tracking</CardTitle>
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Loading payment data...</div>
            </div>
          ) : (
            <DataTable
              columns={paymentColumns}
              data={paymentRecords}
              searchKey="invoiceNumber"
              searchPlaceholder="Search invoices..."
            />
          )}
        </CardContent>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Invoice: {selectedRecord.invoiceNumber}</div>
                <div className="text-sm text-gray-600">Client: {selectedRecord.clientName}</div>
                <div className="text-sm text-gray-600">Due Amount: {formatCurrency(selectedRecord.dueAmount)}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Payment Amount</label>
                <Input type="number" step="0.01" placeholder="Enter amount" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="credit-card">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Payment Date</label>
                <Input type="date" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Reference Number</label>
                <Input placeholder="Transaction/Cheque reference" />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button>Record Payment</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
