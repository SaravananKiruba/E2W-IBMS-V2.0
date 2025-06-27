import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { financeApi } from '@/lib/api'
import type { Transaction, TransactionFormData, QueryFilters } from '@/types'

// Query keys
export const financeKeys = {
  all: ['finance'] as const,
  transactions: () => [...financeKeys.all, 'transactions'] as const,
  transaction: (filters: QueryFilters) => [...financeKeys.transactions(), filters] as const,
  stats: () => [...financeKeys.all, 'stats'] as const,
  reports: () => [...financeKeys.all, 'reports'] as const,
}

// Get finance data with transactions and stats
export function useFinanceData(filters: QueryFilters = {}) {
  const transactionsQuery = useQuery({
    queryKey: financeKeys.transaction(filters),
    queryFn: async () => {
      const response = await financeApi.getTransactions(filters)
      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  const statsQuery = useQuery({
    queryKey: financeKeys.stats(),
    queryFn: async () => {
      const response = await financeApi.getReports('summary')
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    data: transactionsQuery.data,
    stats: statsQuery.data,
    isLoading: transactionsQuery.isLoading || statsQuery.isLoading,
    error: transactionsQuery.error || statsQuery.error,
  }
}

// Get single transaction
export function useTransaction(id: string) {
  return useQuery({
    queryKey: [...financeKeys.transactions(), id],
    queryFn: async () => {
      const response = await financeApi.getTransactions({ id })
      return response.data
    },
    enabled: !!id,
  })
}

// Create transaction mutation
export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TransactionFormData) => {
      const response = await financeApi.createTransaction(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.transactions() })
      queryClient.invalidateQueries({ queryKey: financeKeys.stats() })
      toast.success('Transaction created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create transaction')
    },
  })
}

// Update transaction mutation
export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TransactionFormData }) => {
      const response = await financeApi.createTransaction({ ...data, id })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.transactions() })
      queryClient.invalidateQueries({ queryKey: financeKeys.stats() })
      toast.success('Transaction updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update transaction')
    },
  })
}

// Delete transaction mutation
export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      // Assuming delete endpoint exists
      const response = await financeApi.createTransaction({ id, status: 'inactive' })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.transactions() })
      queryClient.invalidateQueries({ queryKey: financeKeys.stats() })
      toast.success('Transaction deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete transaction')
    },
  })
}

// Get finance reports
export function useFinanceReports(type: string, params?: any) {
  return useQuery({
    queryKey: [...financeKeys.reports(), type, params],
    queryFn: async () => {
      const response = await financeApi.getReports(type, params)
      return response.data
    },
    enabled: !!type,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get invoices
export function useInvoices(filters: QueryFilters = {}) {
  return useQuery({
    queryKey: [...financeKeys.all, 'invoices', filters],
    queryFn: async () => {
      const response = await financeApi.getInvoices(filters)
      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Generate invoice mutation
export function useGenerateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await financeApi.generateInvoice(orderId)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...financeKeys.all, 'invoices'] })
      toast.success('Invoice generated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate invoice')
    },
  })
}
