import type { ApiResponse, PaginatedResponse } from '@/types'

// Mock data for demo purposes
const DEMO_MODE = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL

// Mock delay function for realistic demo experience
const mockDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms))

// Mock data generators
const generateMockData = {
  clients: () => [
    { id: 1, name: 'Acme Corporation', email: 'contact@acme.com', phone: '+1 (555) 123-4567', status: 'active', createdAt: '2024-01-15' },
    { id: 2, name: 'TechStart Inc', email: 'hello@techstart.com', phone: '+1 (555) 987-6543', status: 'active', createdAt: '2024-02-20' },
    { id: 3, name: 'Global Solutions Ltd', email: 'info@globalsolutions.com', phone: '+1 (555) 456-7890', status: 'pending', createdAt: '2024-03-10' },
    { id: 4, name: 'Digital Agency Pro', email: 'team@digitalagency.com', phone: '+1 (555) 321-0987', status: 'active', createdAt: '2024-04-05' },
    { id: 5, name: 'Innovation Labs', email: 'contact@innovationlabs.com', phone: '+1 (555) 654-3210', status: 'inactive', createdAt: '2024-05-12' },
  ],
  orders: () => [
    { id: 1, clientId: 1, title: 'Website Development', amount: 15000, status: 'in-progress', dueDate: '2024-12-31', priority: 'high' },
    { id: 2, clientId: 2, title: 'Mobile App Design', amount: 8500, status: 'completed', dueDate: '2024-11-15', priority: 'medium' },
    { id: 3, clientId: 1, title: 'SEO Optimization', amount: 3200, status: 'pending', dueDate: '2025-01-20', priority: 'low' },
    { id: 4, clientId: 3, title: 'Brand Identity Package', amount: 5800, status: 'in-progress', dueDate: '2024-12-20', priority: 'high' },
    { id: 5, clientId: 4, title: 'E-commerce Platform', amount: 22000, status: 'pending', dueDate: '2025-02-15', priority: 'high' },
  ],
  finances: () => ({
    totalRevenue: 156780,
    monthlyRevenue: 23450,
    totalExpenses: 89320,
    monthlyExpenses: 12670,
    netProfit: 67460,
    monthlyProfit: 10780,
    outstandingInvoices: 45200,
    paidInvoices: 111580,
  }),
  analytics: () => ({
    totalClients: 247,
    activeOrders: 45,
    completedOrders: 123,
    pendingPayments: 8,
    monthlyGrowth: 12.5,
    conversionRate: 68.3,
    clientSatisfaction: 94.2,
    avgOrderValue: 8750,
  }),
  employees: () => [
    { id: 1, name: 'John Smith', email: 'john@company.com', role: 'Project Manager', department: 'Operations', status: 'active' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@company.com', role: 'Developer', department: 'Engineering', status: 'active' },
    { id: 3, name: 'Mike Davis', email: 'mike@company.com', role: 'Designer', department: 'Creative', status: 'active' },
  ],
  notifications: () => [
    { id: 1, title: 'New Order Received', message: 'Order #1005 from Acme Corporation', type: 'info', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, title: 'Payment Received', message: 'Payment of $8,500 processed successfully', type: 'success', read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 3, title: 'Deadline Reminder', message: 'Project deadline approaching in 3 days', type: 'warning', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  ]
}

class ApiClient {
  private mockMode = DEMO_MODE

  constructor() {
    console.log(this.mockMode ? '🎭 Running in DEMO mode with mock data' : '🔗 Connected to backend API')
  }

  // Mock API methods for demo
  private async mockResponse<T>(data: T, delay: number = 800): Promise<ApiResponse<T>> {
    await mockDelay(delay)
    return {
      success: true,
      data,
      message: 'Success'
    }
  }

  private async mockPaginatedResponse<T>(data: T[], page: number = 1, limit: number = 10): Promise<PaginatedResponse<T>> {
    await mockDelay()
    const total = data.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = data.slice(startIndex, endIndex)
    
    return {
      data: paginatedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  // Auth methods
  async login(credentials: { email: string; password: string; tenant?: string }) {
    if (this.mockMode) {
      await mockDelay(1000)
      return this.mockResponse({
        user: {
          id: 1,
          name: 'Demo User',
          email: credentials.email,
          role: 'admin',
          tenant: credentials.tenant || 'demo'
        },
        token: 'demo-jwt-token-' + Date.now(),
        expiresIn: 86400
      })
    }
    throw new Error('Backend API not configured')
  }

  async logout() {
    if (this.mockMode) {
      await mockDelay(500)
      return this.mockResponse({ message: 'Logged out successfully' })
    }
    throw new Error('Backend API not configured')
  }

  // Client methods
  async getClients(params?: { page?: number; limit?: number; search?: string }) {
    if (this.mockMode) {
      let clients = generateMockData.clients()
      if (params?.search) {
        clients = clients.filter(client => 
          client.name.toLowerCase().includes(params.search!.toLowerCase()) ||
          client.email.toLowerCase().includes(params.search!.toLowerCase())
        )
      }
      return this.mockPaginatedResponse(clients, params?.page, params?.limit)
    }
    throw new Error('Backend API not configured')
  }

  async getClient(id: number) {
    if (this.mockMode) {
      const clients = generateMockData.clients()
      const client = clients.find(c => c.id === id)
      if (!client) throw new Error('Client not found')
      return this.mockResponse(client)
    }
    throw new Error('Backend API not configured')
  }

  async createClient(data: any) {
    if (this.mockMode) {
      await mockDelay(1200)
      const newClient = { ...data, id: Date.now(), createdAt: new Date().toISOString() }
      return this.mockResponse(newClient)
    }
    throw new Error('Backend API not configured')
  }

  async updateClient(id: number, data: any) {
    if (this.mockMode) {
      await mockDelay(1000)
      const updatedClient = { ...data, id, updatedAt: new Date().toISOString() }
      return this.mockResponse(updatedClient)
    }
    throw new Error('Backend API not configured')
  }

  async deleteClient(id: number) {
    if (this.mockMode) {
      await mockDelay(800)
      return this.mockResponse({ message: 'Client deleted successfully' })
    }
    throw new Error('Backend API not configured')
  }

  // Order methods
  async getOrders(params?: { page?: number; limit?: number; status?: string }) {
    if (this.mockMode) {
      let orders = generateMockData.orders()
      if (params?.status) {
        orders = orders.filter(order => order.status === params.status)
      }
      return this.mockPaginatedResponse(orders, params?.page, params?.limit)
    }
    throw new Error('Backend API not configured')
  }

  async getOrder(id: number) {
    if (this.mockMode) {
      const orders = generateMockData.orders()
      const order = orders.find(o => o.id === id)
      if (!order) throw new Error('Order not found')
      return this.mockResponse(order)
    }
    throw new Error('Backend API not configured')
  }

  async createOrder(data: any) {
    if (this.mockMode) {
      await mockDelay(1200)
      const newOrder = { ...data, id: Date.now(), createdAt: new Date().toISOString() }
      return this.mockResponse(newOrder)
    }
    throw new Error('Backend API not configured')
  }

  async updateOrder(id: number, data: any) {
    if (this.mockMode) {
      await mockDelay(1000)
      const updatedOrder = { ...data, id, updatedAt: new Date().toISOString() }
      return this.mockResponse(updatedOrder)
    }
    throw new Error('Backend API not configured')
  }

  async deleteOrder(id: number) {
    if (this.mockMode) {
      await mockDelay(800)
      return this.mockResponse({ message: 'Order deleted successfully' })
    }
    throw new Error('Backend API not configured')
  }

  // Finance methods
  async getFinanceOverview() {
    if (this.mockMode) {
      return this.mockResponse(generateMockData.finances())
    }
    throw new Error('Backend API not configured')
  }

  async getInvoices(params?: { page?: number; limit?: number; status?: string }) {
    if (this.mockMode) {
      const invoices = [
        { id: 1, clientId: 1, amount: 15000, status: 'paid', dueDate: '2024-11-30', createdAt: '2024-11-01' },
        { id: 2, clientId: 2, amount: 8500, status: 'pending', dueDate: '2024-12-15', createdAt: '2024-11-15' },
        { id: 3, clientId: 3, amount: 5800, status: 'overdue', dueDate: '2024-11-20', createdAt: '2024-10-20' },
      ]
      return this.mockPaginatedResponse(invoices, params?.page, params?.limit)
    }
    throw new Error('Backend API not configured')
  }

  // Analytics methods
  async getAnalytics() {
    if (this.mockMode) {
      return this.mockResponse(generateMockData.analytics())
    }
    throw new Error('Backend API not configured')
  }

  // Dashboard methods
  async getDashboardStats() {
    if (this.mockMode) {
      const stats = {
        ...generateMockData.analytics(),
        ...generateMockData.finances(),
        recentActivity: [
          { id: 1, type: 'client', message: 'New client Acme Corporation added', timestamp: new Date(Date.now() - 3600000).toISOString() },
          { id: 2, type: 'order', message: 'Order #1002 completed', timestamp: new Date(Date.now() - 7200000).toISOString() },
          { id: 3, type: 'payment', message: 'Payment of $5,000 received', timestamp: new Date(Date.now() - 10800000).toISOString() },
          { id: 4, type: 'invoice', message: 'Invoice #INV-2024-001 sent', timestamp: new Date(Date.now() - 14400000).toISOString() },
        ]
      }
      return this.mockResponse(stats)
    }
    throw new Error('Backend API not configured')
  }

  // Employee methods
  async getEmployees(params?: { page?: number; limit?: number; search?: string }) {
    if (this.mockMode) {
      const employees = generateMockData.employees()
      return this.mockPaginatedResponse(employees, params?.page, params?.limit)
    }
    throw new Error('Backend API not configured')
  }

  // Notification methods
  async getNotifications(params?: { page?: number; limit?: number }) {
    if (this.mockMode) {
      const notifications = generateMockData.notifications()
      return this.mockPaginatedResponse(notifications, params?.page, params?.limit)
    }
    throw new Error('Backend API not configured')
  }

  async markNotificationAsRead(id: number) {
    if (this.mockMode) {
      await mockDelay(300)
      return this.mockResponse({ message: 'Notification marked as read' })
    }
    throw new Error('Backend API not configured')
  }

  // Generic request method for future extensions
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    if (this.mockMode) {
      console.warn('Mock mode: Request to', endpoint, 'intercepted')
      throw new Error('Mock mode: Use specific API methods')
    }
    throw new Error('Backend API not configured')
  }
}

export const api = new ApiClient()
export default api
