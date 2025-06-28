import axios, { AxiosError, AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import type { ApiResponse, PaginatedResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'

class ApiClient {
  private client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  constructor() {
    // Request interceptor to add auth token and tenant
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('token')
        const tenant = Cookies.get('tenant') || 'easy2work'
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        
        // Add tenant to headers
        config.headers['X-Tenant'] = tenant
        
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error: AxiosError) => {
        this.handleError(error)
        return Promise.reject(error)
      }
    )
  }

  private handleError(error: AxiosError) {
    if (error.response) {
      const status = error.response.status
      const data = error.response.data as any

      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          Cookies.remove('token')
          Cookies.remove('user')
          toast.error('Session expired. Please login again.')
          if (typeof window !== 'undefined') {
            const tenant = Cookies.get('tenant') || 'easy2work'
            window.location.href = `/${tenant}/login`
          }
          break
        
        case 403:
          toast.error('Access denied. You do not have permission to perform this action.')
          break
        
        case 404:
          toast.error('Resource not found.')
          break
        
        case 422:
          // Validation errors
          if (data.errors) {
            Object.values(data.errors).flat().forEach((message: any) => {
              toast.error(message)
            })
          } else {
            toast.error(data.message || 'Validation failed')
          }
          break
        
        case 429:
          toast.error('Too many requests. Please try again later.')
          break
        
        case 500:
          toast.error('Server error. Please try again later.')
          break
        
        default:
          toast.error(data.message || 'An unexpected error occurred')
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.')
    } else {
      toast.error('An unexpected error occurred')
    }
  }

  // Generic HTTP methods with proper typing
  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, { params })
    return response.data
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data)
    return response.data
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data)
    return response.data
  }

  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.patch(url, data)
    return response.data
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url)
    return response.data
  }

  // Specialized methods for common patterns
  async getPaginated<T = any>(url: string, params?: any): Promise<PaginatedResponse<T>> {
    const response = await this.get<PaginatedResponse<T>>(url, params)
    return response.data!
  }

  async upload(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })

    return response.data
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Convenience methods for different modules
export const authApi = {
  login: (tenant: string, credentials: { username: string; password: string }) =>
    apiClient.post('/auth/login', { ...credentials, tenant }),
  
  logout: () =>
    apiClient.post('/auth/logout'),
  
  refreshToken: () =>
    apiClient.post('/auth/refresh'),
  
  getCurrentUser: () =>
    apiClient.get('/auth/me'),
}

export const clientApi = {
  getAll: (params?: any) =>
    apiClient.getPaginated('/clients', params),
  
  getById: (id: string) =>
    apiClient.get(`/clients/${id}`),
  
  create: (data: any) =>
    apiClient.post('/clients', data),
  
  update: (id: string, data: any) =>
    apiClient.put(`/clients/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete(`/clients/${id}`),
  
  search: (query: string) =>
    apiClient.get('/clients/search', { q: query }),
}

export const orderApi = {
  getAll: (params?: any) =>
    apiClient.getPaginated('/orders', params),
  
  getById: (id: string) =>
    apiClient.get(`/orders/${id}`),
  
  create: (data: any) =>
    apiClient.post('/orders', data),
  
  update: (id: string, data: any) =>
    apiClient.put(`/orders/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete(`/orders/${id}`),
  
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/orders/${id}/status`, { status }),
  
  addPayment: (id: string, amount: number, method: string) =>
    apiClient.post(`/orders/${id}/payments`, { amount, method }),
}

export const rateApi = {
  getAll: (params?: any) =>
    apiClient.getPaginated('/rates', params),
  
  getById: (id: string) =>
    apiClient.get(`/rates/${id}`),
  
  create: (data: any) =>
    apiClient.post('/rates', data),
  
  update: (id: string, data: any) =>
    apiClient.put(`/rates/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete(`/rates/${id}`),
  
  getActiveRates: () =>
    apiClient.get('/rates/active'),
}

export const dashboardApi = {
  getStats: (params?: any) =>
    apiClient.get('/dashboard/stats', params),
  
  getRecentActivity: () =>
    apiClient.get('/dashboard/activity'),
  
  getRevenueChart: (params?: any) =>
    apiClient.get('/dashboard/revenue-chart', params),
  
  getTopClients: (params?: any) =>
    apiClient.get('/dashboard/top-clients', params),
}

export const financeApi = {
  getTransactions: (params?: any) =>
    apiClient.getPaginated('/finance/transactions', params),
  
  createTransaction: (data: any) =>
    apiClient.post('/finance/transactions', data),
  
  getInvoices: (params?: any) =>
    apiClient.getPaginated('/finance/invoices', params),
  
  generateInvoice: (orderId: string) =>
    apiClient.post(`/finance/invoices/generate/${orderId}`),
  
  getReports: (type: string, params?: any) =>
    apiClient.get(`/finance/reports/${type}`, params),
}

// Export the main API client as 'api' for convenience
export const api = apiClient
