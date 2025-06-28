import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

// Types
interface Lead {
  id: string
  leadId: string
  entryDate: string
  prospect: string
  contactPerson: string
  contactNumber: string
  email: string
  address: string
  source: string
  consultant: string
  status: 'new' | 'call_followup' | 'unreachable' | 'unqualified' | 'convert' | 'ready_for_quote'
  priority: 'low' | 'medium' | 'high'
  followupDate?: string
  followupTime?: string
  quoteSent: boolean
  territory: string
  leadScore: number
  lastActivity: string
  notes: string
  conversionProbability: number
}

interface LeadFormData {
  prospect: string
  contactPerson: string
  contactNumber: string
  email?: string
  address: string
  source: string
  consultant: string
  status: string
  priority: string
  territory: string
  followupDate?: string
  followupTime?: string
  notes?: string
  leadScore?: number
  conversionProbability?: number
}

interface QueryFilters {
  search?: string
  status?: string
  source?: string
  consultant?: string
  priority?: string
  territory?: string
  page?: number
  limit?: number
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// API functions
const leadApi = {
  getAll: async (filters: QueryFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })
    
    const response = await apiClient.get(`/leads?${params.toString()}`)
    return response.data as PaginatedResponse<Lead>
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/leads/${id}`)
    return response.data
  },

  create: async (data: LeadFormData) => {
    const response = await apiClient.post('/leads', data)
    return response.data
  },

  update: async (id: string, data: Partial<LeadFormData>) => {
    const response = await apiClient.put(`/leads/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/leads/${id}`)
    return response.data
  },

  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/leads/${id}/status`, { status })
    return response.data
  },

  assignConsultant: async (id: string, consultantId: string) => {
    const response = await apiClient.patch(`/leads/${id}/assign`, { consultantId })
    return response.data
  },

  scheduleFollowup: async (id: string, followupDate: string, followupTime?: string) => {
    const response = await apiClient.patch(`/leads/${id}/followup`, { followupDate, followupTime })
    return response.data
  },

  addActivity: async (id: string, activity: any) => {
    const response = await apiClient.post(`/leads/${id}/activities`, activity)
    return response.data
  },

  getActivities: async (id: string) => {
    const response = await apiClient.get(`/leads/${id}/activities`)
    return response.data
  },

  getStats: async (filters: QueryFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })
    
    const response = await apiClient.get(`/leads/stats?${params.toString()}`)
    return response.data
  }
}

// Query keys
export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (filters: QueryFilters) => [...leadKeys.lists(), { filters }] as const,
  details: () => [...leadKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
  activities: (id: string) => [...leadKeys.detail(id), 'activities'] as const,
  stats: (filters: QueryFilters) => [...leadKeys.all, 'stats', { filters }] as const,
}

// Custom hooks for lead management
export function useLeads(filters: QueryFilters = {}) {
  return useQuery({
    queryKey: leadKeys.list(filters),
    queryFn: () => leadApi.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useLead(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => leadApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useLeadStats(filters: QueryFilters = {}) {
  return useQuery({
    queryKey: leadKeys.stats(filters),
    queryFn: () => leadApi.getStats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useLeadActivities(id: string) {
  return useQuery({
    queryKey: leadKeys.activities(id),
    queryFn: () => leadApi.getActivities(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: leadApi.create,
    onSuccess: (newLead) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
      queryClient.setQueryData(leadKeys.detail(newLead.id), newLead)
      toast.success('Lead created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create lead')
    },
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LeadFormData> }) => {
      return leadApi.update(id, data)
    },
    onSuccess: (updatedLead) => {
      queryClient.setQueryData(leadKeys.detail(updatedLead.id), updatedLead)
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
      toast.success('Lead updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update lead')
    },
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: leadApi.delete,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: leadKeys.detail(deletedId) })
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
      toast.success('Lead deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete lead')
    },
  })
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return leadApi.updateStatus(id, status)
    },
    onSuccess: (updatedLead) => {
      queryClient.setQueryData(leadKeys.detail(updatedLead.id), updatedLead)
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
      toast.success('Lead status updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update lead status')
    },
  })
}

export function useAssignConsultant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, consultantId }: { id: string; consultantId: string }) => {
      return leadApi.assignConsultant(id, consultantId)
    },
    onSuccess: (updatedLead) => {
      queryClient.setQueryData(leadKeys.detail(updatedLead.id), updatedLead)
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
      toast.success('Consultant assigned successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign consultant')
    },
  })
}

export function useScheduleFollowup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, followupDate, followupTime }: { id: string; followupDate: string; followupTime?: string }) => {
      return leadApi.scheduleFollowup(id, followupDate, followupTime)
    },
    onSuccess: (updatedLead) => {
      queryClient.setQueryData(leadKeys.detail(updatedLead.id), updatedLead)
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
      toast.success('Follow-up scheduled successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to schedule follow-up')
    },
  })
}

export function useAddLeadActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, activity }: { id: string; activity: any }) => {
      return leadApi.addActivity(id, activity)
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.activities(id) })
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(id) })
      toast.success('Activity added successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add activity')
    },
  })
}
