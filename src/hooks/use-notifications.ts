import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export interface Notification {
  id: string
  type: 'order' | 'payment' | 'client' | 'system' | 'reminder'
  title: string
  message: string
  status: 'read' | 'unread'
  priority: 'low' | 'medium' | 'high'
  channel: 'email' | 'whatsapp' | 'sms' | 'in-app'
  timestamp: Date
  client?: string
  actions: string[]
  metadata?: Record<string, any>
}

export interface NotificationTemplate {
  id: string
  name: string
  type: string
  channels: string[]
  variables: string[]
  content: string
  isActive: boolean
}

export interface CommunicationChannel {
  id: string
  name: string
  type: 'email' | 'whatsapp' | 'sms'
  enabled: boolean
  status: 'connected' | 'disconnected' | 'pending'
  config: Record<string, any>
  stats: {
    sent: number
    delivered: number
    failed: number
  }
}

export interface NotificationSettings {
  emailNotifications: boolean
  whatsappNotifications: boolean
  smsNotifications: boolean
  inAppNotifications: boolean
  dailyDigest: boolean
  instantNotifications: 'all' | 'important' | 'none'
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
  channels: {
    email: boolean
    whatsapp: boolean
    sms: boolean
  }
}

export interface SendNotificationRequest {
  type: string
  channel: string | string[]
  recipients: string | string[]
  subject: string
  message: string
  templateId?: string
  variables?: Record<string, any>
  scheduledFor?: Date
  priority?: 'low' | 'medium' | 'high'
}

// Mock API functions - replace with actual API calls
const notificationApi = {
  getNotifications: async (filters?: any): Promise<Notification[]> => {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000))
    return [
      {
        id: '1',
        type: 'order',
        title: 'New Order Received',
        message: 'Order #ORD-2024-001 from ABC Corporation requires attention',
        status: 'unread',
        priority: 'high',
        channel: 'email',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        client: 'ABC Corporation',
        actions: ['View Order', 'Mark as Read']
      },
      {
        id: '2',
        type: 'payment',
        title: 'Payment Reminder',
        message: 'Invoice INV-2024-005 is due tomorrow (₹45,000)',
        status: 'read',
        priority: 'medium',
        channel: 'whatsapp',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        client: 'XYZ Services',
        actions: ['Send Reminder', 'View Invoice']
      }
    ]
  },

  getNotificationStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      total: 156,
      unread: 23,
      sent: 89,
      pending: 12,
      failed: 2
    }
  },

  markAsRead: async (ids: string[]): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500))
  },

  deleteNotifications: async (ids: string[]): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500))
  },

  sendNotification: async (data: SendNotificationRequest): Promise<{ id: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { id: `notif-${Date.now()}` }
  },

  getTemplates: async (): Promise<NotificationTemplate[]> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return [
      {
        id: '1',
        name: 'Order Confirmation',
        type: 'order',
        channels: ['email', 'whatsapp'],
        variables: ['order_number', 'client_name', 'total_amount', 'delivery_date'],
        content: 'Dear {client_name}, your order {order_number} has been confirmed...',
        isActive: true
      },
      {
        id: '2',
        name: 'Payment Reminder',
        type: 'payment',
        channels: ['email', 'sms', 'whatsapp'],
        variables: ['client_name', 'invoice_number', 'amount', 'due_date'],
        content: 'Hi {client_name}, this is a reminder that invoice {invoice_number}...',
        isActive: true
      }
    ]
  },

  createTemplate: async (template: Omit<NotificationTemplate, 'id'>): Promise<NotificationTemplate> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { ...template, id: `template-${Date.now()}` }
  },

  updateTemplate: async (id: string, template: Partial<NotificationTemplate>): Promise<NotificationTemplate> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { id, ...template } as NotificationTemplate
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500))
  },

  getChannels: async (): Promise<CommunicationChannel[]> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return [
      {
        id: 'email',
        name: 'Email',
        type: 'email',
        enabled: true,
        status: 'connected',
        config: { smtp_host: 'smtp.gmail.com', smtp_port: 587 },
        stats: { sent: 450, delivered: 442, failed: 8 }
      },
      {
        id: 'whatsapp',
        name: 'WhatsApp Business',
        type: 'whatsapp',
        enabled: true,
        status: 'connected',
        config: { api_key: '***', phone_number: '+1234567890' },
        stats: { sent: 234, delivered: 230, failed: 4 }
      },
      {
        id: 'sms',
        name: 'SMS Gateway',
        type: 'sms',
        enabled: false,
        status: 'disconnected',
        config: {},
        stats: { sent: 0, delivered: 0, failed: 0 }
      }
    ]
  },

  updateChannelConfig: async (id: string, config: Record<string, any>): Promise<CommunicationChannel> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {} as CommunicationChannel
  },

  testChannel: async (id: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    return { success: true, message: 'Test message sent successfully' }
  },

  getSettings: async (): Promise<NotificationSettings> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      emailNotifications: true,
      whatsappNotifications: true,
      smsNotifications: false,
      inAppNotifications: true,
      dailyDigest: true,
      instantNotifications: 'important',
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      },
      channels: {
        email: true,
        whatsapp: true,
        sms: false
      }
    }
  },

  updateSettings: async (settings: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {} as NotificationSettings
  }
}

// Query keys
const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: any) => [...notificationKeys.lists(), { filters }] as const,
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
  stats: () => [...notificationKeys.all, 'stats'] as const,
  templates: () => [...notificationKeys.all, 'templates'] as const,
  channels: () => [...notificationKeys.all, 'channels'] as const,
  settings: () => [...notificationKeys.all, 'settings'] as const,
}

// Hooks
export function useNotifications(filters?: any) {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => notificationApi.getNotifications(filters),
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useNotificationStats() {
  return useQuery({
    queryKey: notificationKeys.stats(),
    queryFn: notificationApi.getNotificationStats,
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useMarkNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() })
      toast.success('Notifications marked as read')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark notifications as read')
    },
  })
}

export function useDeleteNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationApi.deleteNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() })
      toast.success('Notifications deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete notifications')
    },
  })
}

export function useSendNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationApi.sendNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() })
      toast.success('Notification sent successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send notification')
    },
  })
}

export function useNotificationTemplates() {
  return useQuery({
    queryKey: notificationKeys.templates(),
    queryFn: notificationApi.getTemplates,
  })
}

export function useCreateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationApi.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates() })
      toast.success('Template created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create template')
    },
  })
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<NotificationTemplate>) =>
      notificationApi.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates() })
      toast.success('Template updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update template')
    },
  })
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationApi.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates() })
      toast.success('Template deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete template')
    },
  })
}

export function useCommunicationChannels() {
  return useQuery({
    queryKey: notificationKeys.channels(),
    queryFn: notificationApi.getChannels,
  })
}

export function useUpdateChannelConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, config }: { id: string; config: Record<string, any> }) =>
      notificationApi.updateChannelConfig(id, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.channels() })
      toast.success('Channel configuration updated')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update channel configuration')
    },
  })
}

export function useTestChannel() {
  return useMutation({
    mutationFn: notificationApi.testChannel,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to test channel')
    },
  })
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: notificationKeys.settings(),
    queryFn: notificationApi.getSettings,
  })
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.settings() })
      toast.success('Settings updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update settings')
    },
  })
}
