import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderApi } from '@/lib/api'
import toast from 'react-hot-toast'
import type { Order, OrderFormData, PaginatedResponse, QueryFilters } from '@/types'

// Query keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: QueryFilters) => [...orderKeys.lists(), { filters }] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
}

// Custom hooks for order management
export function useOrders(filters: QueryFilters = {}) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: async () => {
      const response = await orderApi.getAll(filters)
      return response as PaginatedResponse<Order>
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const response = await orderApi.getById(id)
      return response.data as Order
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: OrderFormData) => {
      const response = await orderApi.create(data)
      return response.data as Order
    },
    onSuccess: (newOrder) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.setQueryData(orderKeys.detail(newOrder.orderNumber), newOrder)
      toast.success('Order created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create order')
    },
  })
}

export function useUpdateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<OrderFormData> }) => {
      const response = await orderApi.update(id, data)
      return response.data as Order
    },
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(orderKeys.detail(updatedOrder.orderNumber), updatedOrder)
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      toast.success('Order updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update order')
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await orderApi.updateStatus(id, status)
      return response.data as Order
    },
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(orderKeys.detail(updatedOrder.orderNumber), updatedOrder)
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      toast.success('Order status updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update order status')
    },
  })
}

export function useAddPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ orderId, amount, method }: { orderId: string; amount: number; method: string }) => {
      const response = await orderApi.addPayment(orderId, amount, method)
      return response.data as Order
    },
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(orderKeys.detail(updatedOrder.orderNumber), updatedOrder)
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      toast.success('Payment added successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add payment')
    },
  })
}

export function useDeleteOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await orderApi.delete(id)
      return id
    },
    onSuccess: (deletedId) => {
      queryClient.removeQueries({ queryKey: orderKeys.detail(deletedId) })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      toast.success('Order deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete order')
    },
  })
}

// Utility hooks
export function useOrdersStats() {
  const { data: orders } = useOrders()

  const stats = {
    total: orders?.total || 0,
    pending: orders?.data?.filter(order => order.status === 'pending').length || 0,
    processing: orders?.data?.filter(order => order.status === 'processing').length || 0,
    completed: orders?.data?.filter(order => order.status === 'completed').length || 0,
    cancelled: orders?.data?.filter(order => order.status === 'cancelled').length || 0,
    totalRevenue: orders?.data?.reduce((sum, order) => sum + order.totalAmount, 0) || 0,
    paidAmount: orders?.data?.reduce((sum, order) => sum + order.paidAmount, 0) || 0,
    balanceAmount: orders?.data?.reduce((sum, order) => sum + order.balanceAmount, 0) || 0,
  }

  return stats
}
