import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

// Test utilities for mocking React Query
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

// Wrapper component for tests that need React Query
export const TestQueryProvider = ({ children }: { children: ReactNode }) => {
  const testQueryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  )
}

// Custom render function with providers
export const renderWithProviders = (ui: ReactNode, options = {}) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <TestQueryProvider>{children}</TestQueryProvider>
  )

  return render(ui, { wrapper: Wrapper, ...options })
}

// Mock API responses
export const mockApiResponse = function<T>(data: T, delay = 0): Promise<T> {
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

// Mock data generators
export const createMockClient = (overrides = {}) => ({
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

export const createMockOrder = (overrides = {}) => ({
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

export const createMockTransaction = (overrides = {}) => ({
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

// Test data for notifications
export const createMockNotification = (overrides = {}) => ({
  id: 1,
  title: 'Test Notification',
  message: 'This is a test notification',
  type: 'info',
  status: 'unread',
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

// Test data for employees
export const createMockEmployee = (overrides = {}) => ({
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

// Form testing utilities
export const fillForm = async (formData: Record<string, string>) => {
  const user = userEvent.setup()
  
  for (const [fieldName, value] of Object.entries(formData)) {
    const field = screen.getByLabelText(new RegExp(fieldName, 'i')) || 
                 screen.getByPlaceholderText(new RegExp(fieldName, 'i'))
    
    if (field) {
      await user.clear(field)
      await user.type(field, value)
    }
  }
}

export const submitForm = async () => {
  const user = userEvent.setup()
  const submitButton = screen.getByRole('button', { name: /submit|save|create/i })
  await user.click(submitButton)
}

// Wait for loading states
export const waitForLoadingToFinish = async () => {
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })
}

// Export everything from testing-library for convenience
export * from '@testing-library/react'
export { userEvent }
