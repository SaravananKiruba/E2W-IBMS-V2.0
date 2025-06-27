'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useOrders, useCreateOrder, useUpdateOrder, useDeleteOrder } from '@/hooks/use-orders'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Search, Edit, Trash2, Eye, FileText, Download, Filter } from 'lucide-react'
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils'
import type { Order, OrderFormData } from '@/types'
import { OrderForm } from './order-form'
import { OrderDetails } from './order-details'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function OrdersPage() {
  const params = useParams()
  const tenant = params.tenant as string
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Query hooks
  const { data: ordersData, isLoading, error } = useOrders({
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  const createOrderMutation = useCreateOrder()
  const updateOrderMutation = useUpdateOrder()
  const deleteOrderMutation = useDeleteOrder()

  // Event handlers
  const handleCreateOrder = async (data: OrderFormData) => {
    try {
      await createOrderMutation.mutateAsync(data)
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create order:', error)
    }
  }

  const handleUpdateOrder = async (data: OrderFormData) => {
    if (!selectedOrder) return
    try {
      await updateOrderMutation.mutateAsync({ id: selectedOrder.orderNumber, data })
      setIsEditDialogOpen(false)
      setSelectedOrder(null)
    } catch (error) {
      console.error('Failed to update order:', error)
    }
  }

  const handleDeleteOrder = async (order: Order) => {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrderMutation.mutateAsync(order.orderNumber)
      } catch (error) {
        console.error('Failed to delete order:', error)
      }
    }
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailsDialogOpen(true)
  }

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsEditDialogOpen(true)
  }

  // Table columns configuration
  const columns = [
    {
      accessorKey: 'orderNumber',
      header: 'Order #',
      cell: ({ row }: any) => {
        const order = row.original as Order
        return (
          <div className="font-medium">
            <div className="text-sm text-gray-900">{order.orderNumber}</div>
            <div className="text-xs text-gray-500">{formatDate(order.entryDate)}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'client',
      header: 'Client',
      cell: ({ row }: any) => {
        const order = row.original as Order
        return (
          <div>
            <div className="font-medium text-gray-900">{order.clientName}</div>
            <div className="text-sm text-gray-500">{order.clientContact}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const order = row.original as Order
        return (
          <Badge variant={getStatusColor(order.status) as any}>
            {order.status}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Payment',
      cell: ({ row }: any) => {
        const order = row.original as Order
        const getPaymentColor = (status: string) => {
          switch (status) {
            case 'paid': return 'default'
            case 'partial': return 'secondary'
            case 'unpaid': return 'destructive'
            default: return 'outline'
          }
        }
        return (
          <Badge variant={getPaymentColor(order.paymentStatus) as any}>
            {order.paymentStatus}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: any) => {
        const order = row.original as Order
        return (
          <div className="text-right">
            <div className="font-medium">{formatCurrency(order.netAmount)}</div>
            <div className="text-xs text-gray-500">
              Paid: {formatCurrency(order.paidAmount)}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'deliveryDate',
      header: 'Delivery',
      cell: ({ row }: any) => {
        const order = row.original as Order
        return order.deliveryDate ? (
          <div className="text-sm">
            {formatDate(order.deliveryDate)}
          </div>
        ) : (
          <div className="text-sm text-gray-400">Not set</div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const order = row.original as Order
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewOrder(order)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditOrder(order)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteOrder(order)}
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
        <div className="text-red-600">Failed to load orders: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600">Manage orders and track their progress</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
              </DialogHeader>
              <OrderForm
                onSubmit={handleCreateOrder}
                isLoading={createOrderMutation.isPending}
                tenant={tenant}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordersData?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {ordersData?.data?.filter(o => o.status === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {ordersData?.data?.filter(o => o.status === 'completed').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(ordersData?.data?.reduce((sum, o) => sum + o.netAmount, 0) || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Orders</CardTitle>
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Loading orders...</div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={ordersData?.data || []}
              searchKey="orderNumber"
              searchPlaceholder="Search orders..."
            />
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <OrderDetails
              order={selectedOrder}
              onClose={() => setIsDetailsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <OrderForm
              initialData={selectedOrder}
              onSubmit={handleUpdateOrder}
              isLoading={updateOrderMutation.isPending}
              tenant={tenant}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
