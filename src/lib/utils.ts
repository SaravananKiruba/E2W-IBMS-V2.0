import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = '₹'): string {
  return `${currency}${amount.toLocaleString('en-IN')}`
}

export function formatDate(date: string | Date, format = 'DD/MM/YYYY'): string {
  const d = new Date(date)
  
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  
  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    default:
      return d.toLocaleDateString()
  }
}

// Enhanced date utilities
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num)
}

export function getRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return formatDate(date)
}

export function formatTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `ORD-${timestamp}-${random}`.toUpperCase()
}

export function calculateGST(amount: number, gstPercentage: number): number {
  return (amount * gstPercentage) / 100
}

export function calculateTotal(amount: number, gstPercentage: number): number {
  return amount + calculateGST(amount, gstPercentage)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone)
}

export function validateGST(gst: string): boolean {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  return gstRegex.test(gst)
}

export function validatePAN(pan: string): boolean {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  return panRegex.test(pan)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'completed':
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'pending':
    case 'processing':
      return 'bg-yellow-100 text-yellow-800'
    case 'inactive':
    case 'cancelled':
    case 'unpaid':
      return 'bg-red-100 text-red-800'
    case 'partial':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getRandomColor(): string {
  const colors = [
    '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B',
    '#EF4444', '#6366F1', '#14B8A6', '#F97316'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function downloadFile(data: any, filename: string, type = 'application/json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Local storage utilities
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unexpected error occurred'
}

// Advanced Indian Business Utilities
export function calculateAdvancedGST(amount: number, gstRate: number, includesCess = false, cessRate = 0): {
  baseAmount: number
  cgst: number
  sgst: number
  igst: number
  cess: number
  totalGst: number
  totalAmount: number
} {
  const baseAmount = amount / (1 + (gstRate / 100) + (includesCess ? cessRate / 100 : 0))
  const gstAmount = baseAmount * (gstRate / 100)
  const cessAmount = includesCess ? baseAmount * (cessRate / 100) : 0
  
  // For intra-state transactions
  const cgst = gstAmount / 2
  const sgst = gstAmount / 2
  // For inter-state transactions (use IGST instead of CGST+SGST)
  const igst = gstAmount

  return {
    baseAmount: Math.round(baseAmount * 100) / 100,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
    igst: Math.round(igst * 100) / 100,
    cess: Math.round(cessAmount * 100) / 100,
    totalGst: Math.round(gstAmount * 100) / 100,
    totalAmount: Math.round((baseAmount + gstAmount + cessAmount) * 100) / 100
  }
}

export function validateIndianPincode(pincode: string): boolean {
  const pincodeRegex = /^[1-9][0-9]{5}$/
  return pincodeRegex.test(pincode)
}

export function validateIFSC(ifsc: string): boolean {
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
  return ifscRegex.test(ifsc)
}

export function validateUPI(upi: string): boolean {
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/
  return upiRegex.test(upi)
}

export function validateTAN(tan: string): boolean {
  const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/
  return tanRegex.test(tan)
}

export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function getGSTStateCode(stateName: string): string {
  const stateCodes: { [key: string]: string } = {
    'andhra pradesh': '37',
    'arunachal pradesh': '12',
    'assam': '18',
    'bihar': '10',
    'chhattisgarh': '22',
    'goa': '30',
    'gujarat': '24',
    'haryana': '06',
    'himachal pradesh': '02',
    'jharkhand': '20',
    'karnataka': '29',
    'kerala': '32',
    'madhya pradesh': '23',
    'maharashtra': '27',
    'manipur': '14',
    'meghalaya': '17',
    'mizoram': '15',
    'nagaland': '13',
    'odisha': '21',
    'punjab': '03',
    'rajasthan': '08',
    'sikkim': '11',
    'tamil nadu': '33',
    'telangana': '36',
    'tripura': '16',
    'uttar pradesh': '09',
    'uttarakhand': '05',
    'west bengal': '19',
    'andaman and nicobar islands': '35',
    'chandigarh': '04',
    'dadra and nagar haveli and daman and diu': '26',
    'delhi': '07',
    'jammu and kashmir': '01',
    'ladakh': '38',
    'lakshadweep': '31',
    'puducherry': '34'
  }
  return stateCodes[stateName.toLowerCase()] || ''
}

// Performance and Analytics Utilities
export function measurePerformance<T>(
  fn: () => T,
  label?: string
): { result: T; duration: number } {
  const start = performance.now()
  const result = fn()
  const duration = performance.now() - start
  
  if (label) {
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`)
  }
  
  return { result, duration }
}

export async function measureAsyncPerformance<T>(
  fn: () => Promise<T>,
  label?: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start
  
  if (label) {
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`)
  }
  
  return { result, duration }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map()
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

// Advanced Date Utilities
export function getFinancialYear(date = new Date()): { start: Date; end: Date; label: string } {
  const year = date.getFullYear()
  const month = date.getMonth()
  
  let fyStart: Date
  let fyEnd: Date
  
  if (month >= 3) { // April to March
    fyStart = new Date(year, 3, 1) // April 1st
    fyEnd = new Date(year + 1, 2, 31) // March 31st next year
  } else {
    fyStart = new Date(year - 1, 3, 1) // April 1st previous year
    fyEnd = new Date(year, 2, 31) // March 31st current year
  }
  
  return {
    start: fyStart,
    end: fyEnd,
    label: `FY ${fyStart.getFullYear()}-${fyEnd.getFullYear().toString().slice(-2)}`
  }
}

export function getQuarter(date = new Date()): { quarter: number; label: string; start: Date; end: Date } {
  const month = date.getMonth()
  const year = date.getFullYear()
  
  let quarter: number
  let start: Date
  let end: Date
  
  if (month >= 3 && month <= 5) { // Apr-Jun
    quarter = 1
    start = new Date(year, 3, 1)
    end = new Date(year, 5, 30)
  } else if (month >= 6 && month <= 8) { // Jul-Sep
    quarter = 2
    start = new Date(year, 6, 1)
    end = new Date(year, 8, 30)
  } else if (month >= 9 && month <= 11) { // Oct-Dec
    quarter = 3
    start = new Date(year, 9, 1)
    end = new Date(year, 11, 31)
  } else { // Jan-Mar
    quarter = 4
    start = new Date(month <= 2 ? year - 1 : year, 0, 1)
    end = new Date(month <= 2 ? year : year + 1, 2, 31)
  }
  
  return {
    quarter,
    label: `Q${quarter}`,
    start,
    end
  }
}

export function isWorkingDay(date: Date, holidays: Date[] = []): boolean {
  const day = date.getDay()
  // Monday = 1, Sunday = 0
  if (day === 0 || day === 6) return false // Weekend
  
  // Check against provided holidays
  return !holidays.some(holiday => 
    holiday.getDate() === date.getDate() &&
    holiday.getMonth() === date.getMonth() &&
    holiday.getFullYear() === date.getFullYear()
  )
}

export function addWorkingDays(startDate: Date, days: number, holidays: Date[] = []): Date {
  let currentDate = new Date(startDate)
  let addedDays = 0
  
  while (addedDays < days) {
    currentDate.setDate(currentDate.getDate() + 1)
    if (isWorkingDay(currentDate, holidays)) {
      addedDays++
    }
  }
  
  return currentDate
}

// Business Logic Utilities
export function calculateServiceCharges(amount: number, percentage: number, min = 0, max = Infinity): number {
  const charges = (amount * percentage) / 100
  return Math.min(Math.max(charges, min), max)
}

export function calculateCompoundInterest(
  principal: number,
  rate: number,
  time: number,
  compoundFrequency = 1
): { amount: number; interest: number } {
  const amount = principal * Math.pow(1 + (rate / 100) / compoundFrequency, compoundFrequency * time)
  const interest = amount - principal
  
  return {
    amount: Math.round(amount * 100) / 100,
    interest: Math.round(interest * 100) / 100
  }
}

export function calculateEMI(principal: number, rate: number, months: number): {
  emi: number
  totalAmount: number
  totalInterest: number
} {
  const monthlyRate = rate / 100 / 12
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
               (Math.pow(1 + monthlyRate, months) - 1)
  const totalAmount = emi * months
  const totalInterest = totalAmount - principal
  
  return {
    emi: Math.round(emi * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100
  }
}

// Data Processing Utilities
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

export function filterBy<T>(array: T[], filters: Partial<Record<keyof T, any>>): T[] {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === '') return true
      const itemValue = item[key as keyof T]
      
      if (typeof value === 'string' && typeof itemValue === 'string') {
        return itemValue.toLowerCase().includes(value.toLowerCase())
      }
      
      return itemValue === value
    })
  })
}

export function paginate<T>(array: T[], page: number, pageSize: number): {
  data: T[]
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
} {
  const total = array.length
  const pages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const data = array.slice(start, end)
  
  return {
    data,
    total,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1
  }
}

// Chart and Analytics Utilities
export function generateChartColors(count: number): string[] {
  const baseColors = [
    '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ]
  
  if (count <= baseColors.length) {
    return baseColors.slice(0, count)
  }
  
  // Generate additional colors using HSL
  const colors = [...baseColors]
  for (let i = baseColors.length; i < count; i++) {
    const hue = (i * 360 / count) % 360
    colors.push(`hsl(${hue}, 70%, 50%)`)
  }
  
  return colors
}

export function generateTrendData(data: number[]): {
  trend: 'up' | 'down' | 'stable'
  percentage: number
  direction: number
} {
  if (data.length < 2) {
    return { trend: 'stable', percentage: 0, direction: 0 }
  }
  
  const first = data[0]
  const last = data[data.length - 1]
  const percentage = ((last - first) / first) * 100
  
  let trend: 'up' | 'down' | 'stable'
  if (Math.abs(percentage) < 1) {
    trend = 'stable'
  } else if (percentage > 0) {
    trend = 'up'
  } else {
    trend = 'down'
  }
  
  return {
    trend,
    percentage: Math.abs(Math.round(percentage * 100) / 100),
    direction: percentage
  }
}

// Export and Import Utilities
export function exportToCSV<T>(data: T[], filename: string, headers?: string[]): void {
  if (!data.length) return
  
  const csvHeaders = headers || Object.keys(data[0] as any)
  const csvContent = [
    csvHeaders.join(','),
    ...data.map(row => 
      csvHeaders.map(header => {
        const value = (row as any)[header]
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      }).join(',')
    )
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
}

export function exportToJSON<T>(data: T, filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.json`
  link.click()
}

export function parseCSV(csvContent: string): string[][] {
  const lines = csvContent.split('\n')
  const result: string[][] = []
  
  for (const line of lines) {
    if (line.trim()) {
      const fields = line.split(',').map(field => 
        field.trim().replace(/^"(.*)"$/, '$1').replace(/""/g, '"')
      )
      result.push(fields)
    }
  }
  
  return result
}

// Notification and Communication Utilities
export function formatNotificationText(template: string, data: Record<string, any>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match
  })
}

export function generateQRCodeUrl(text: string, size = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false)
  }
  
  // Fallback for older browsers
  const textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.select()
  
  try {
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    return Promise.resolve(successful)
  } catch (err) {
    document.body.removeChild(textArea)
    return Promise.resolve(false)
  }
}
