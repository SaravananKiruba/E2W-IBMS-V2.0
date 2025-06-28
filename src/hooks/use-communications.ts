import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface CommunicationChannel {
  id: number;
  type: 'email' | 'sms' | 'whatsapp' | 'push';
  name: string;
  config: Record<string, any>;
  is_active: boolean;
  is_configured: boolean;
  last_test?: {
    success: boolean;
    message: string;
    tested_at: string;
  };
  created_at: string;
  updated_at?: string;
}

export interface CommunicationMessage {
  id: number;
  channel: string;
  recipient: string;
  subject?: string;
  message: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  status_message?: string;
  template_id?: number;
  created_at: string;
  updated_at?: string;
}

export interface CommunicationTemplate {
  id: number;
  name: string;
  channel: string;
  type: string;
  subject?: string;
  content: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface MessageFilters {
  channel?: string;
  recipient?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ChannelStats {
  by_channel: Array<{
    channel: string;
    total: number;
    sent: number;
    failed: number;
  }>;
  daily_volume: Array<{
    date: string;
    channel: string;
    count: number;
  }>;
  success_metrics: {
    total_messages: number;
    successful: number;
    success_rate: number;
  };
}

export interface SendMessageRequest {
  channel: string;
  recipient: string;
  message: string;
  subject?: string;
  template_id?: number;
  variables?: Record<string, any>;
}

export interface TestChannelRequest {
  recipient?: string;
  phone?: string;
  token?: string;
}

// Mock API functions (replace with actual API calls)
const communicationApi = {
  getChannels: async (): Promise<CommunicationChannel[]> => {
    // Mock data - replace with actual API call
    return [
      {
        id: 1,
        type: 'email',
        name: 'Email Service',
        config: { smtp_server: 'smtp.gmail.com' },
        is_active: true,
        is_configured: true,
        last_test: {
          success: true,
          message: 'Email channel test successful',
          tested_at: '2024-01-15 10:30:00'
        },
        created_at: '2024-01-01 00:00:00'
      },
      {
        id: 2,
        type: 'sms',
        name: 'SMS Service',
        config: { provider: 'Twilio' },
        is_active: true,
        is_configured: true,
        created_at: '2024-01-01 00:00:00'
      },
      {
        id: 3,
        type: 'whatsapp',
        name: 'WhatsApp Business',
        config: { business_id: '123456' },
        is_active: false,
        is_configured: false,
        created_at: '2024-01-01 00:00:00'
      },
      {
        id: 4,
        type: 'push',
        name: 'Push Notifications',
        config: { service: 'FCM' },
        is_active: true,
        is_configured: true,
        created_at: '2024-01-01 00:00:00'
      }
    ];
  },

  updateChannelConfig: async (channel: string, config: Record<string, any>) => {
    // Mock implementation
    return { success: true, channel, config };
  },

  testChannel: async (channel: string, testData: TestChannelRequest) => {
    // Mock implementation
    return {
      success: true,
      message: `${channel} channel test successful`,
      details: testData
    };
  },

  sendMessage: async (messageData: SendMessageRequest) => {
    // Mock implementation
    return {
      message_id: Math.random().toString(36).substr(2, 9),
      success: true,
      message: 'Message sent successfully'
    };
  },

  getMessageHistory: async (filters: MessageFilters = {}) => {
    // Mock data
    const messages: CommunicationMessage[] = [
      {
        id: 1,
        channel: 'email',
        recipient: 'client@example.com',
        subject: 'Order Confirmation',
        message: 'Your order has been confirmed.',
        status: 'sent',
        created_at: '2024-01-15 10:00:00'
      },
      {
        id: 2,
        channel: 'sms',
        recipient: '+1234567890',
        message: 'Your appointment is confirmed for tomorrow.',
        status: 'delivered',
        created_at: '2024-01-15 09:30:00'
      },
      {
        id: 3,
        channel: 'whatsapp',
        recipient: '+1234567890',
        message: 'Thank you for your business!',
        status: 'sent',
        created_at: '2024-01-15 09:00:00'
      }
    ];

    return {
      messages,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 10,
        total: messages.length,
        pages: 1
      }
    };
  },

  getChannelStats: async (startDate?: string, endDate?: string): Promise<ChannelStats> => {
    // Mock data
    return {
      by_channel: [
        { channel: 'email', total: 150, sent: 145, failed: 5 },
        { channel: 'sms', total: 89, sent: 87, failed: 2 },
        { channel: 'whatsapp', total: 45, sent: 44, failed: 1 },
        { channel: 'push', total: 234, sent: 230, failed: 4 }
      ],
      daily_volume: [
        { date: '2024-01-15', channel: 'email', count: 25 },
        { date: '2024-01-15', channel: 'sms', count: 15 },
        { date: '2024-01-14', channel: 'email', count: 30 },
        { date: '2024-01-14', channel: 'sms', count: 12 }
      ],
      success_metrics: {
        total_messages: 518,
        successful: 506,
        success_rate: 97.68
      }
    };
  },

  getTemplates: async (channel?: string, type?: string): Promise<CommunicationTemplate[]> => {
    // Mock data
    return [
      {
        id: 1,
        name: 'Order Confirmation',
        channel: 'email',
        type: 'transactional',
        subject: 'Order Confirmation - {{order_number}}',
        content: 'Dear {{customer_name}}, your order {{order_number}} has been confirmed.',
        variables: ['customer_name', 'order_number'],
        is_active: true,
        created_at: '2024-01-01 00:00:00'
      },
      {
        id: 2,
        name: 'Appointment Reminder',
        channel: 'sms',
        type: 'reminder',
        content: 'Hi {{customer_name}}, reminder: your appointment is on {{appointment_date}}.',
        variables: ['customer_name', 'appointment_date'],
        is_active: true,
        created_at: '2024-01-01 00:00:00'
      },
      {
        id: 3,
        name: 'Welcome Message',
        channel: 'whatsapp',
        type: 'onboarding',
        content: 'Welcome to our service, {{customer_name}}! We\'re excited to work with you.',
        variables: ['customer_name'],
        is_active: true,
        created_at: '2024-01-01 00:00:00'
      }
    ];
  },

  createTemplate: async (templateData: Partial<CommunicationTemplate>) => {
    // Mock implementation
    return {
      id: Math.floor(Math.random() * 1000) + 1,
      ...templateData,
      created_at: new Date().toISOString()
    };
  },

  updateTemplate: async (id: number, templateData: Partial<CommunicationTemplate>) => {
    // Mock implementation
    return {
      id,
      ...templateData,
      updated_at: new Date().toISOString()
    };
  },

  deleteTemplate: async (id: number) => {
    // Mock implementation
    return { success: true };
  },
};

// Hooks
export const useCommunicationChannels = () => {
  return useQuery({
    queryKey: ['communicationChannels'],
    queryFn: communicationApi.getChannels,
  });
};

export const useMessageHistory = (filters: MessageFilters = {}) => {
  return useQuery({
    queryKey: ['messageHistory', filters],
    queryFn: () => communicationApi.getMessageHistory(filters),
  });
};

export const useChannelStats = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['channelStats', startDate, endDate],
    queryFn: () => communicationApi.getChannelStats(startDate, endDate),
  });
};

export const useCommunicationTemplates = (channel?: string, type?: string) => {
  return useQuery({
    queryKey: ['communicationTemplates', channel, type],
    queryFn: () => communicationApi.getTemplates(channel, type),
  });
};

export const useUpdateChannelConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ channel, config }: { channel: string; config: Record<string, any> }) =>
      communicationApi.updateChannelConfig(channel, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communicationChannels'] });
    },
  });
};

export const useTestChannel = () => {
  return useMutation({
    mutationFn: ({ channel, testData }: { channel: string; testData: TestChannelRequest }) =>
      communicationApi.testChannel(channel, testData),
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: communicationApi.sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messageHistory'] });
      queryClient.invalidateQueries({ queryKey: ['channelStats'] });
    },
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: communicationApi.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communicationTemplates'] });
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CommunicationTemplate> }) =>
      communicationApi.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communicationTemplates'] });
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: communicationApi.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communicationTemplates'] });
    },
  });
};
