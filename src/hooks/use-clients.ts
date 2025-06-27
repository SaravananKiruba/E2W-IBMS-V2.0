import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientApi } from '@/lib/api'
import toast from 'react-hot-toast'
import type { Client, ClientFormData, PaginatedResponse, QueryFilters } from '@/types'

// Query keys
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters: QueryFilters) => [...clientKeys.lists(), { filters }] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
  search: (query: string) => [...clientKeys.all, 'search', query] as const,
}

// Custom hooks for client management
export function useClients(filters: QueryFilters = {}) {
  return useQuery({
    queryKey: clientKeys.list(filters),
    queryFn: async () => {
      const response = await clientApi.getAll(filters)
      return response as PaginatedResponse<Client>
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: async () => {
      const response = await clientApi.getById(id)
      return response.data as Client
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useClientSearch(query: string) {
  return useQuery({
    queryKey: clientKeys.search(query),
    queryFn: async () => {
      const response = await clientApi.search(query)
      return response.data as Client[]
    },
    enabled: query.length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ClientFormData) => {
      const response = await clientApi.create(data)
      return response.data as Client
    },
    onSuccess: (newClient) => {
      // Invalidate and refetch clients list
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
      
      // Add the new client to the cache
      queryClient.setQueryData(clientKeys.detail(newClient.id), newClient)
      
      toast.success('Client created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create client')
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ClientFormData> }) => {
      const response = await clientApi.update(id, data)
      return response.data as Client
    },
    onSuccess: (updatedClient) => {
      // Update the client in the cache
      queryClient.setQueryData(clientKeys.detail(updatedClient.id), updatedClient)
      
      // Invalidate clients list to ensure consistency
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
      
      toast.success('Client updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update client')
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await clientApi.delete(id)
      return id
    },
    onSuccess: (deletedId) => {
      // Remove the client from the cache
      queryClient.removeQueries({ queryKey: clientKeys.detail(deletedId) })
      
      // Invalidate clients list
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
      
      toast.success('Client deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete client')
    },
  })
}

// Utility hooks
export function useClientsStats() {
  const { data: clients } = useClients()

  const stats = {
    total: clients?.total || 0,
    active: clients?.data?.filter(client => client.status === 'active').length || 0,
    inactive: clients?.data?.filter(client => client.status === 'inactive').length || 0,
  }

  return stats
}
