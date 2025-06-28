// Mock data generators and utilities for testing
export const createMockClient = (overrides: Record<string, any> = {}) => ({
  id: 1,
  clientName: 'Test Client',
  clientContact: '9876543210',
  clientEmail: 'test@example.com',
  clientAddress: '123 Test Street',
  gstNumber: '29ABCDE1234F1Z5',
  panNumber: 'ABCDE1234F',
  status: 'active',
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockOrder = (overrides: Record<string, any> = {}) => ({
  id: 1,
  orderNumber: 'ORD-2024-001',
  clientId: 1,
  clientName: 'Test Client',
  items: [
    {
      id: 1,
      description: 'Test Item',
      quantity: 10,
      rate: 100,
      amount: 1000,
    },
  ],
  subtotal: 1000,
  gstAmount: 180,
  total: 1180,
  status: 'pending',
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockTransaction = (overrides: Record<string, any> = {}) => ({
  id: 1,
  type: 'income',
  amount: 1000,
  description: 'Test Transaction',
  category: 'Sales',
  clientId: 1,
  clientName: 'Test Client',
  date: '2024-01-01',
  status: 'completed',
  ...overrides,
})

export const createMockNotification = (overrides: Record<string, any> = {}) => ({
  id: 1,
  title: 'Test Notification',
  message: 'This is a test notification',
  type: 'info',
  status: 'unread',
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockEmployee = (overrides: Record<string, any> = {}) => ({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  phone: '9876543210',
  department: 'Sales',
  position: 'Sales Executive',
  status: 'active',
  joinDate: '2024-01-01',
  ...overrides,
})

export const createMockConsultant = (overrides: Record<string, any> = {}) => ({
  id: 1,
  name: 'Jane Smith',
  email: 'jane@example.com',
  phone: '9876543211',
  specialization: 'Print Media',
  territory: 'Bangalore Central',
  status: 'active',
  joinDate: '2024-01-01',
  ...overrides,
})

// Mock API responses
export function mockApiResponse<T>(data: T, delay = 0): Promise<T> {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(data), delay)
  })
}

export const mockApiError = (message = 'API Error', status = 500, delay = 0) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject({
        response: {
          status,
          data: { message },
        },
      })
    }, delay)
  })
}

// Test constants
export const TEST_TENANT = 'test'
export const TEST_API_URL = 'http://localhost:8000'

// Helper to wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock localStorage for testing
export const createMockStorage = () => {
  const store: Record<string, string> = {}
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key])
    },
  }
}
