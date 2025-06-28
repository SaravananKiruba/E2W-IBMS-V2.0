import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useTenant } from '@/components/providers/tenant-provider'
import toast from 'react-hot-toast'

export interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  designation: string
  department: string
  joiningDate: string
  status: 'active' | 'inactive' | 'on_leave' | 'terminated'
  role: 'admin' | 'manager' | 'consultant' | 'executive' | 'trainee'
  reportingTo?: string
  salary: number
  address: string
  photo?: string
  skills: string[]
  performance: {
    rating: number
    reviewDate: string
    goals: number
    achievements: number
  }
  attendance: {
    present: number
    absent: number
    late: number
    total: number
  }
  permissions: string[]
  createdAt: string
  lastActive: string
}

export interface EmployeeFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  designation: string
  department: string
  role: string
  reportingTo?: string
  salary: number
  address: string
  joiningDate: string
  skills?: string[]
  permissions?: string[]
}

export interface EmployeeFilters {
  search?: string
  status?: string
  department?: string
  role?: string
  page?: number
  limit?: number
}

// Query Keys
export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (filters: EmployeeFilters) => [...employeeKeys.lists(), { filters }] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
  stats: () => [...employeeKeys.all, 'stats'] as const,
}

// API Functions
const employeeApi = {
  getAll: async (tenant: string, filters: EmployeeFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })
    
    const response = await apiClient.get(`/employees?tenant=${tenant}&${params.toString()}`)
    return response.data
  },

  getById: async (tenant: string, id: string) => {
    const response = await apiClient.get(`/employees/${id}?tenant=${tenant}`)
    return response.data
  },

  create: async (tenant: string, data: EmployeeFormData) => {
    const response = await apiClient.post(`/employees?tenant=${tenant}`, data)
    return response.data
  },

  update: async (tenant: string, id: string, data: Partial<EmployeeFormData>) => {
    const response = await apiClient.put(`/employees/${id}?tenant=${tenant}`, data)
    return response.data
  },

  delete: async (tenant: string, id: string) => {
    const response = await apiClient.delete(`/employees/${id}?tenant=${tenant}`)
    return response.data
  },

  updateStatus: async (tenant: string, id: string, status: string) => {
    const response = await apiClient.patch(`/employees/${id}/status?tenant=${tenant}`, { status })
    return response.data
  },

  updatePerformance: async (tenant: string, id: string, performance: any) => {
    const response = await apiClient.patch(`/employees/${id}/performance?tenant=${tenant}`, performance)
    return response.data
  },

  getStats: async (tenant: string) => {
    const response = await apiClient.get(`/employees/stats?tenant=${tenant}`)
    return response.data
  },

  getDepartments: async (tenant: string) => {
    const response = await apiClient.get(`/employees/departments?tenant=${tenant}`)
    return response.data
  },

  getDesignations: async (tenant: string) => {
    const response = await apiClient.get(`/employees/designations?tenant=${tenant}`)
    return response.data
  }
}

// Custom Hooks
export function useEmployees(filters: EmployeeFilters = {}) {
  const { currentTenant } = useTenant()
  const tenant = currentTenant?.id || 'easy2work'

  return useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: async () => {
      try {
        const response = await employeeApi.getAll(tenant, filters)
        return response
      } catch (error) {
        // Fallback to mock data for development
        return {
          success: true,
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 50
          }
        }
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useEmployee(id: string) {
  const { currentTenant } = useTenant()
  const tenant = currentTenant?.id || 'easy2work'

  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: async () => {
      try {
        const response = await employeeApi.getById(tenant, id)
        return response
      } catch (error) {
        throw new Error('Employee not found')
      }
    },
    enabled: !!id,
  })
}

export function useEmployeeStats() {
  const { currentTenant } = useTenant()
  const tenant = currentTenant?.id || 'easy2work'

  return useQuery({
    queryKey: employeeKeys.stats(),
    queryFn: async () => {
      try {
        const response = await employeeApi.getStats(tenant)
        return response
      } catch (error) {
        // Fallback to mock stats
        return {
          success: true,
          data: {
            total: 0,
            active: 0,
            inactive: 0,
            onLeave: 0,
            avgRating: 0,
            avgAttendance: 0,
            departmentBreakdown: {},
            roleBreakdown: {}
          }
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateEmployee() {
  const { currentTenant } = useTenant()
  const tenant = currentTenant?.id || 'easy2work'
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const response = await employeeApi.create(tenant, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: employeeKeys.stats() })
      toast.success('Employee created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create employee')
    },
  })
}

export function useUpdateEmployee() {
  const { currentTenant } = useTenant()
  const tenant = currentTenant?.id || 'easy2work'
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EmployeeFormData> }) => {
      const response = await employeeApi.update(tenant, id, data)
      return response
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: employeeKeys.stats() })
      toast.success('Employee updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update employee')
    },
  })
}

export function useDeleteEmployee() {
  const { currentTenant } = useTenant()
  const tenant = currentTenant?.id || 'easy2work'
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await employeeApi.delete(tenant, id)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: employeeKeys.stats() })
      toast.success('Employee deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete employee')
    },
  })
}

export function useUpdateEmployeeStatus() {
  const { currentTenant } = useTenant()
  const tenant = currentTenant?.id || 'easy2work'
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await employeeApi.updateStatus(tenant, id, status)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: employeeKeys.stats() })
      toast.success('Employee status updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update employee status')
    },
  })
}

export function useUpdateEmployeePerformance() {
  const { currentTenant } = useTenant()
  const tenant = currentTenant?.id || 'easy2work'
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, performance }: { id: string; performance: any }) => {
      const response = await employeeApi.updatePerformance(tenant, id, performance)
      return response
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() })
      toast.success('Performance updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update performance')
    },
  })
}

export function useDepartments() {
  const { currentTenant } = useTenant()
  const tenant = currentTenant?.id || 'easy2work'

  return useQuery({
    queryKey: [...employeeKeys.all, 'departments'],
    queryFn: async () => {
      try {
        const response = await employeeApi.getDepartments(tenant)
        return response
      } catch (error) {
        // Fallback to default departments
        return {
          success: true,
          data: ['Sales', 'Operations', 'Human Resources', 'Finance', 'Marketing', 'IT']
        }
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useDesignations() {
  const { currentTenant } = useTenant()
  const tenant = currentTenant?.id || 'easy2work'

  return useQuery({
    queryKey: [...employeeKeys.all, 'designations'],
    queryFn: async () => {
      try {
        const response = await employeeApi.getDesignations(tenant)
        return response
      } catch (error) {
        // Fallback to default designations
        return {
          success: true,
          data: ['Manager', 'Senior Consultant', 'Consultant', 'Executive', 'Trainee', 'Assistant']
        }
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}
