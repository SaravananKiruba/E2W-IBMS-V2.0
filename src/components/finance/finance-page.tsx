'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useFinanceData, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '@/hooks/use-finance'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, Search, Edit, Trash2, Download, Filter, 
  TrendingUp, TrendingDown, DollarSign, CreditCard,
  Receipt, PieChart, BarChart3, Calendar
} from 'lucide-react'
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils'
import type { Transaction, TransactionFormData } from '@/types'
import { TransactionForm } from './transaction-form'
import { FinanceReports } from './finance-reports'
import { PaymentTracker } from './payment-tracker'

export function FinancePage() {
  const params = useParams()
  const tenant = params.tenant as string
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  // Query hooks
  const { 
    data: financeData, 
    isLoading, 
    error,
    stats 
  } = useFinanceData({
    search: searchTerm,
    type: typeFilter === 'all' ? undefined : typeFilter,
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
  })

  const createTransactionMutation = useCreateTransaction()
  const updateTransactionMutation = useUpdateTransaction()
  const deleteTransactionMutation = useDeleteTransaction()

  // Event handlers
  const handleCreateTransaction = async (data: TransactionFormData) => {
    try {
      await createTransactionMutation.mutateAsync(data)
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create transaction:', error)
    }
  }

  const handleUpdateTransaction = async (data: TransactionFormData) => {
    if (!selectedTransaction) return
    try {
      await updateTransactionMutation.mutateAsync({ id: selectedTransaction.id, data })
      setIsEditDialogOpen(false)
      setSelectedTransaction(null)
    } catch (error) {
      console.error('Failed to update transaction:', error)
    }
  }

  const handleDeleteTransaction = async (transaction: Transaction) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransactionMutation.mutateAsync(transaction.id)
      } catch (error) {
        console.error('Failed to delete transaction:', error)
      }
    }
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsEditDialogOpen(true)
  }

  // Table columns configuration
  const transactionColumns = [
    {
      accessorKey: 'billNumber',
      header: 'Bill #',
      cell: ({ row }: any) => {
        const transaction = row.original as Transaction
        return (
          <div className="font-medium">
            <div className="text-sm text-gray-900">{transaction.billNumber}</div>
            <div className="text-xs text-gray-500">{formatDate(transaction.billDate)}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }: any) => {
        const transaction = row.original as Transaction
        return (
          <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
            {transaction.type}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'orderNumber',
      header: 'Order #',
      cell: ({ row }: any) => {
        const transaction = row.original as Transaction
        return transaction.orderNumber ? (
          <div className="text-sm">{transaction.orderNumber}</div>
        ) : (
          <div className="text-sm text-gray-400">-</div>
        )
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: any) => {
        const transaction = row.original as Transaction
        return (
          <div className="text-right">
            <div className={`font-medium ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </div>
            <div className="text-xs text-gray-500">
              GST: {formatCurrency(transaction.gstAmount)}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const transaction = row.original as Transaction
        return (
          <Badge variant={getStatusColor(transaction.status) as any}>
            {transaction.status}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'entryUser',
      header: 'Entry User',
      cell: ({ row }: any) => {
        const transaction = row.original as Transaction
        return (
          <div className="text-sm">
            <div>{transaction.entryUser}</div>
            <div className="text-xs text-gray-500">{formatDate(transaction.entryDate)}</div>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const transaction = row.original as Transaction
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditTransaction(transaction)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteTransaction(transaction)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">Failed to load finance data: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Management</h1>
          <p className="text-gray-600">Track income, expenses, and financial performance</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
              </DialogHeader>
              <TransactionForm
                onSubmit={handleCreateTransaction}
                isLoading={createTransactionMutation.isPending}
                tenant={tenant}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.totalRevenue || 0)}
            </div>
            <div className="text-xs text-gray-500">
              +{stats?.revenueGrowth || 0}% from last month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingDown className="h-4 w-4 mr-2" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats?.totalExpenses || 0)}
            </div>
            <div className="text-xs text-gray-500">
              +{stats?.expenseGrowth || 0}% from last month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency((stats?.totalRevenue || 0) - (stats?.totalExpenses || 0))}
            </div>
            <div className="text-xs text-gray-500">
              {stats?.profitMargin || 0}% profit margin
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(stats?.outstanding || 0)}
            </div>
            <div className="text-xs text-gray-500">
              {stats?.overdueCount || 0} overdue invoices
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions" className="flex items-center">
            <Receipt className="h-4 w-4 mr-2" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transaction History</CardTitle>
                <div className="flex items-center space-x-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  
                  {/* Type Filter */}
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Date Range */}
                  <div className="flex items-center space-x-2">
                    <Input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                      className="w-40"
                    />
                    <span className="text-gray-500">to</span>
                    <Input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                      className="w-40"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-gray-500">Loading transactions...</div>
                </div>
              ) : (
                <DataTable
                  columns={transactionColumns}
                  data={financeData?.data || []}
                  searchKey="billNumber"
                  searchPlaceholder="Search transactions..."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <FinanceReports tenant={tenant} />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentTracker tenant={tenant} />
        </TabsContent>
      </Tabs>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <TransactionForm
              initialData={selectedTransaction}
              onSubmit={handleUpdateTransaction}
              isLoading={updateTransactionMutation.isPending}
              tenant={tenant}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
