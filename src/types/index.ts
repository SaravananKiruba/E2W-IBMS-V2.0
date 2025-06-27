// User and Authentication types
export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'manager' | 'user'
  tenant: string
}

export interface AuthResponse {
  user: User
  tokens: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
}

// Tenant types
export interface Tenant {
  id: string
  name: string
  database: string
  subdomain: string
  settings: {
    logo?: string
    primaryColor: string
    secondaryColor: string
    companyName: string
    contactInfo?: {
      email: string
      phone: string
      address: string
    }
  }
}

// Client types - with aliases for frontend compatibility
export interface Client {
  id: string
  entryDate: string
  entryUser: string
  clientName: string
  clientContact: string
  clientEmail: string
  address: string
  gst: string
  pan: string
  source: string
  consultantId: number
  status: 'active' | 'inactive'
  gender: string
  age: number
  ageFormat: string
  dob?: string
  title?: string
  contactPerson?: string
  attended: boolean
  attendedDateTime?: string
  
  // Computed properties for frontend compatibility
  name: string // alias for clientName
  phone: string // alias for clientContact
  email: string // alias for clientEmail
  createdAt: string // alias for entryDate
}

// Order types
export interface Order {
  orderNumber: string
  entryDate: string
  entryUser: string
  clientId: string
  clientName: string
  clientContact: string
  clientEmail: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  totalAmount: number
  gstAmount: number
  netAmount: number
  paidAmount: number
  balanceAmount: number
  discount: number
  paymentStatus: 'unpaid' | 'partial' | 'paid'
  orderType: string
  deliveryDate?: string
  remarks?: string
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  adMedium: string
  adType: string
  adCategory: string
  quantity: number
  width: number
  units: string
  ratePerUnit: number
  amountWithoutGst: number
  amount: number
  gstAmount: number
  gstPercentage: string
  discountAmount: number
  remarks?: string
  dateOfRelease?: string
}

// Transaction types
export interface Transaction {
  id: string
  entryDate: string
  entryUser: string
  billNumber: string
  billDate: string
  type: 'income' | 'expense'
  amount: number
  amountExcludingGST: number
  gstAmount: number
  orderNumber: string
  status: 'active' | 'inactive'
}

export interface TransactionFormData {
  billNumber: string
  billDate: string
  type: 'income' | 'expense'
  amount: number
  amountExcludingGST: number
  gstAmount: number
  orderNumber?: string
  status: 'active' | 'inactive'
  description?: string
  category?: string
}

// Rate types
export interface Rate {
  id: string
  entryDate: string
  entryUser: string
  adMedium: string
  adType: string
  adCategory: string
  rate: number
  unit: string
  gst: number
  validFrom: string
  validTill?: string
  status: 'active' | 'inactive'
  scheme: string
  minQuantity: number
  maxQuantity: number
  discountPercentage: number
}

// Dashboard types
export interface DashboardStats {
  period: {
    from: string
    to: string
  }
  clients: {
    total: number
    new: number
    growth: number
  }
  orders: {
    total: number
    new: number
    pending: number
    overdue: number
    growth: number
  }
  revenue: {
    total: number
    paid: number
    pending: number
    growth: number
  }
}

export interface Activity {
  id: string
  type: 'order' | 'client' | 'payment' | 'system'
  message: string
  timestamp: string
  userId: string
  userName: string
}

export interface RecentActivity {
  type: 'order' | 'client' | 'payment'
  id: string
  title: string
  description: string
  date: string
  user: string
  status: string
  amount?: number
}

export interface RevenueChartData {
  period: string
  revenue: number
  paid: number
  pending: number
  orders: number
}

export interface TopClient {
  id: string
  name: string
  contact: string
  email: string
  totalOrders: number
  totalRevenue: number
  paidAmount: number
  pendingAmount: number
  lastOrderDate?: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface QueryFilters {
  search?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  category?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Utility types
export interface SelectOption {
  value: string
  label: string
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

// Form types
export interface ClientFormData {
  clientName: string
  clientContact: string
  clientEmail: string
  address: string
  gst?: string
  pan?: string
  source?: string
  consultantId?: number
  status: 'active' | 'inactive'
  gender?: string
  age?: number
  ageFormat?: string
  dob?: string
  title?: string
  contactPerson?: string
}

export interface OrderFormData {
  clientId: string
  status: string
  orderType: string
  deliveryDate?: string
  remarks?: string
  discount?: number
  items: OrderItemFormData[]
}

export interface OrderItemFormData {
  adMedium: string
  adType: string
  adCategory: string
  quantity: number
  width?: number
  units: string
  ratePerUnit: number
  gstPercentage: number
  discountAmount?: number
  remarks?: string
  dateOfRelease?: string
}

export interface RateFormData {
  adMedium: string
  adType: string
  adCategory: string
  rate: number
  unit: string
  gst: number
  validFrom: string
  validTill?: string
  status: 'active' | 'inactive'
  scheme: string
  minQuantity: number
  maxQuantity: number
  discountPercentage: number
}
