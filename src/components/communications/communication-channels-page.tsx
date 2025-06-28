'use client'

import { useState } from 'react'
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Settings,
  Check,
  X,
  AlertCircle,
  Key,
  Globe,
  Smartphone,
  Send,
  Users,
  BarChart3,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  TestTube,
  Eye,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCommunicationChannels } from '@/hooks/use-notifications'

interface CommunicationChannelsPageProps {
  tenant?: string
}

export function CommunicationChannelsPage({ tenant = 'test' }: CommunicationChannelsPageProps) {
  const [activeTab, setActiveTab] = useState('channels')
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)

  // Mock data - would come from API in real implementation
  const channelStats = {
    totalSent: 1247,
    delivered: 1198,
    failed: 49,
    deliveryRate: 96.1
  }

  const communicationChannels = [
    {
      id: 'email',
      name: 'Email Service',
      type: 'email',
      provider: 'SMTP',
      icon: Mail,
      enabled: true,
      status: 'connected',
      description: 'Primary email communication channel',
      config: {
        host: 'smtp.gmail.com',
        port: '587',
        username: 'noreply@easy2work.com',
        encryption: 'TLS',
        fromName: 'Easy2Work Team'
      },
      stats: { 
        sent: 650, 
        delivered: 642, 
        failed: 8,
        deliveryRate: 98.8,
        lastSent: new Date(Date.now() - 15 * 60 * 1000)
      },
      features: ['Rich HTML', 'Attachments', 'Templates', 'Tracking'],
      limits: { daily: 1000, monthly: 30000 }
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business API',
      type: 'whatsapp',
      provider: 'Meta Business',
      icon: MessageSquare,
      enabled: true,
      status: 'connected',
      description: 'WhatsApp Business API for instant messaging',
      config: {
        phoneNumber: '+91 98765 43210',
        businessAccountId: 'BA-123456789',
        apiKey: '***hidden***',
        webhookUrl: 'https://api.easy2work.com/webhooks/whatsapp'
      },
      stats: { 
        sent: 432, 
        delivered: 425, 
        failed: 7,
        deliveryRate: 98.4,
        lastSent: new Date(Date.now() - 5 * 60 * 1000)
      },
      features: ['Media Messages', 'Templates', 'Interactive Buttons', 'Quick Replies'],
      limits: { daily: 1000, monthly: 10000 }
    },
    {
      id: 'sms',
      name: 'SMS Gateway',
      type: 'sms',
      provider: 'Twilio',
      icon: Phone,
      enabled: false,
      status: 'disconnected',
      description: 'SMS gateway for text messaging',
      config: {
        accountSid: '',
        authToken: '',
        fromNumber: '',
        serviceSid: ''
      },
      stats: { 
        sent: 165, 
        delivered: 131, 
        failed: 34,
        deliveryRate: 79.4,
        lastSent: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      features: ['Text Messages', 'Delivery Reports', 'Two-way SMS'],
      limits: { daily: 500, monthly: 5000 }
    },
    {
      id: 'push',
      name: 'Push Notifications',
      type: 'push',
      provider: 'Firebase',
      icon: Smartphone,
      enabled: true,
      status: 'connected',
      description: 'Web and mobile push notifications',
      config: {
        fcmKey: '***hidden***',
        vapidKey: '***hidden***',
        projectId: 'easy2work-notifications'
      },
      stats: { 
        sent: 0, 
        delivered: 0, 
        failed: 0,
        deliveryRate: 0,
        lastSent: null
      },
      features: ['Web Push', 'Mobile Push', 'Rich Notifications', 'Action Buttons'],
      limits: { daily: 10000, monthly: 300000 }
    }
  ]

  const messageTemplates = [
    {
      id: '1',
      name: 'Order Confirmation',
      type: 'order',
      channels: ['email', 'whatsapp'],
      language: 'English',
      status: 'active',
      variables: ['customer_name', 'order_number', 'total_amount', 'delivery_date'],
      content: {
        subject: 'Order Confirmation - #{order_number}',
        body: `Dear {customer_name},\n\nYour order #{order_number} has been confirmed.\nTotal Amount: ₹{total_amount}\nExpected Delivery: {delivery_date}\n\nThank you for choosing Easy2Work!`,
        whatsapp: `Hi {customer_name}! 👋\n\nYour order #{order_number} is confirmed ✅\nAmount: ₹{total_amount}\nDelivery: {delivery_date}\n\nTrack your order: [link]`
      },
      usage: 45,
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Payment Reminder',
      type: 'payment',
      channels: ['email', 'whatsapp', 'sms'],
      language: 'English',
      status: 'active',
      variables: ['customer_name', 'invoice_number', 'amount', 'due_date'],
      content: {
        subject: 'Payment Reminder - Invoice #{invoice_number}',
        body: `Dear {customer_name},\n\nThis is a reminder that payment for Invoice #{invoice_number} (₹{amount}) is due on {due_date}.\n\nPlease make the payment to avoid any inconvenience.`,
        whatsapp: `Hi {customer_name}! 💰\n\nReminder: Invoice #{invoice_number}\nAmount: ₹{amount}\nDue: {due_date}\n\nPay now: [link]`,
        sms: `Payment reminder: Invoice #{invoice_number} (₹{amount}) due on {due_date}. Pay now to avoid charges.`
      },
      usage: 128,
      lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      id: '3',
      name: 'Welcome Message',
      type: 'welcome',
      channels: ['email', 'whatsapp'],
      language: 'English',
      status: 'active',
      variables: ['customer_name', 'company_name'],
      content: {
        subject: 'Welcome to {company_name}!',
        body: `Dear {customer_name},\n\nWelcome to {company_name}! We're excited to have you as our valued customer.\n\nOur team is here to help you with all your needs.`,
        whatsapp: `Welcome to {company_name}, {customer_name}! 🎉\n\nWe're here to serve you better. Feel free to reach out anytime!`
      },
      usage: 23,
      lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ]

  const campaignHistory = [
    {
      id: '1',
      name: 'Monthly Newsletter',
      type: 'newsletter',
      channel: 'email',
      status: 'completed',
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      recipients: 456,
      delivered: 441,
      opened: 234,
      clicked: 67,
      bounced: 15
    },
    {
      id: '2',
      name: 'Payment Reminders Batch',
      type: 'reminder',
      channel: 'whatsapp',
      status: 'completed',
      sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      recipients: 89,
      delivered: 87,
      opened: 85,
      clicked: 23,
      bounced: 2
    },
    {
      id: '3',
      name: 'Order Updates',
      type: 'notification',
      channel: 'sms',
      status: 'failed',
      sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      recipients: 25,
      delivered: 18,
      opened: 18,
      clicked: 0,
      bounced: 7
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800'
      case 'disconnected': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail
      case 'whatsapp': return MessageSquare
      case 'sms': return Phone
      case 'push': return Smartphone
      default: return Mail
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communication Channels</h1>
          <p className="text-gray-600">Manage email, WhatsApp, SMS, and push notification channels</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowTemplateDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Template
          </Button>
          <Button className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Send Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold">{channelStats.totalSent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{channelStats.delivered.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{channelStats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Delivery Rate</p>
                <p className="text-2xl font-bold text-purple-600">{channelStats.deliveryRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {communicationChannels.map((channel) => {
              const IconComponent = channel.icon
              return (
                <Card key={channel.id} className="relative">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${channel.enabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <IconComponent className={`h-5 w-5 ${channel.enabled ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{channel.name}</h3>
                          <p className="text-sm text-gray-500">{channel.provider}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(channel.status)}>
                          {channel.status}
                        </Badge>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={channel.enabled} 
                            onChange={() => {}}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{channel.description}</p>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Sent:</span>
                          <span className="font-medium">{channel.stats.sent}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Delivered:</span>
                          <span className="font-medium text-green-600">{channel.stats.delivered}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Failed:</span>
                          <span className="font-medium text-red-600">{channel.stats.failed}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Rate:</span>
                          <span className="font-medium">{channel.stats.deliveryRate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Daily Limit:</span>
                          <span className="font-medium">{channel.limits.daily}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Last Sent:</span>
                          <span className="font-medium text-xs">
                            {channel.stats.lastSent ? channel.stats.lastSent.toLocaleString() : 'Never'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <p className="text-sm font-medium mb-2">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {channel.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedChannel(channel.id)
                          setShowConfigDialog(true)
                        }}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                      <Button variant="outline" size="sm">
                        <TestTube className="h-4 w-4 mr-1" />
                        Test
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Message Templates</h2>
            <Button onClick={() => setShowTemplateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {messageTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-base">{template.name}</span>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline">{template.type}</Badge>
                      <Badge className={getStatusColor(template.status)}>
                        {template.status}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Channels:</p>
                    <div className="flex items-center gap-1">
                      {template.channels.map((channel) => {
                        const Icon = getChannelIcon(channel)
                        return (
                          <div key={channel} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                            <Icon className="h-3 w-3" />
                            {channel}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Variables:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable) => (
                        <code key={variable} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {`{${variable}}`}
                        </code>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Preview:</p>
                    <div className="text-sm bg-gray-50 p-3 rounded text-gray-700 max-h-20 overflow-y-auto">
                      {template.content.body.substring(0, 120)}...
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Usage:</span>
                      <span>{template.usage} times</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Used:</span>
                      <span>{template.lastUsed.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Campaign History</h2>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>

          <div className="space-y-4">
            {campaignHistory.map((campaign) => {
              const Icon = getChannelIcon(campaign.channel)
              return (
                <Card key={campaign.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{campaign.name}</h3>
                          <p className="text-sm text-gray-500">
                            {campaign.type} • {campaign.sentAt.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{campaign.recipients}</p>
                        <p className="text-sm text-gray-500">Recipients</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{campaign.delivered}</p>
                        <p className="text-sm text-gray-500">Delivered</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{campaign.opened}</p>
                        <p className="text-sm text-gray-500">Opened</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{campaign.clicked}</p>
                        <p className="text-sm text-gray-500">Clicked</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{campaign.bounced}</p>
                        <p className="text-sm text-gray-500">Bounced</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Channel Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {communicationChannels.map((channel) => {
                  const IconComponent = channel.icon
                  const deliveryRate = channel.stats.deliveryRate
                  return (
                    <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5" />
                        <div>
                          <h4 className="font-medium">{channel.name}</h4>
                          <p className="text-sm text-gray-500">{channel.stats.sent} sent</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold">{deliveryRate}%</p>
                          <p className="text-sm text-gray-500">Delivery Rate</p>
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${deliveryRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart visualization would go here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {messageTemplates
                    .sort((a, b) => b.usage - a.usage)
                    .slice(0, 5)
                    .map((template) => (
                      <div key={template.id} className="flex items-center justify-between">
                        <span className="font-medium">{template.name}</span>
                        <Badge variant="secondary">{template.usage} uses</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Channel Configuration</DialogTitle>
          </DialogHeader>
          {selectedChannel && (
            <div className="space-y-4">
              {(() => {
                const channel = communicationChannels.find(c => c.id === selectedChannel)
                if (!channel) return null

                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <channel.icon className="h-6 w-6" />
                      <div>
                        <h3 className="font-semibold">{channel.name}</h3>
                        <p className="text-sm text-gray-500">{channel.description}</p>
                      </div>
                    </div>

                    {selectedChannel === 'email' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">SMTP Host</label>
                          <Input defaultValue={channel.config.host} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Port</label>
                          <Input defaultValue={channel.config.port} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Username</label>
                          <Input defaultValue={channel.config.username} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Password</label>
                          <Input type="password" placeholder="••••••••" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Encryption</label>
                          <Select defaultValue={channel.config.encryption}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TLS">TLS</SelectItem>
                              <SelectItem value="SSL">SSL</SelectItem>
                              <SelectItem value="None">None</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">From Name</label>
                          <Input defaultValue={channel.config.fromName} />
                        </div>
                      </div>
                    )}

                    {selectedChannel === 'whatsapp' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Phone Number</label>
                          <Input defaultValue={channel.config.phoneNumber} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Business Account ID</label>
                          <Input defaultValue={channel.config.businessAccountId} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">API Key</label>
                          <Input type="password" placeholder="••••••••" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Webhook URL</label>
                          <Input defaultValue={channel.config.webhookUrl} />
                        </div>
                      </div>
                    )}

                    {selectedChannel === 'sms' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Account SID</label>
                          <Input placeholder="Enter Account SID" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Auth Token</label>
                          <Input type="password" placeholder="Enter Auth Token" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">From Number</label>
                          <Input placeholder="+1234567890" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Service SID</label>
                          <Input placeholder="Enter Service SID" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-4">
                      <Button className="flex-1">
                        Save Configuration
                      </Button>
                      <Button variant="outline">
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Connection
                      </Button>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
