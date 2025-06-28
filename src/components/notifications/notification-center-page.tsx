'use client'

import { useState } from 'react'
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Phone, 
  Settings,
  Check,
  Clock,
  AlertCircle,
  Filter,
  Search,
  Send,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Trash2,
  MoreHorizontal,
  RotateCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useNotifications } from '@/hooks/use-notifications'

interface NotificationCenterPageProps {
  tenant?: string
}

export function NotificationCenterPage({ tenant = 'test' }: NotificationCenterPageProps) {
  const [activeTab, setActiveTab] = useState('notifications')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showComposeDialog, setShowComposeDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])

  // Mock data - would come from API in real implementation
  const notificationStats = {
    total: 156,
    unread: 23,
    sent: 89,
    pending: 12,
    failed: 2
  }

  const notifications = [
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
    },
    {
      id: '3',
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM',
      status: 'read',
      priority: 'low',
      channel: 'in-app',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      client: 'System',
      actions: ['Acknowledge']
    },
    {
      id: '4',
      type: 'client',
      title: 'New Client Registration',
      message: 'New client "LMN Industries" has registered and requires verification',
      status: 'unread',
      priority: 'medium',
      channel: 'email',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      client: 'LMN Industries',
      actions: ['Verify Client', 'View Profile']
    }
  ]

  const communicationChannels = [
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      enabled: true,
      status: 'connected',
      description: 'SMTP configured',
      stats: { sent: 450, delivered: 442, failed: 8 }
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      icon: MessageSquare,
      enabled: true,
      status: 'connected',
      description: 'API key configured',
      stats: { sent: 234, delivered: 230, failed: 4 }
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: Phone,
      enabled: false,
      status: 'disconnected',
      description: 'No provider configured',
      stats: { sent: 0, delivered: 0, failed: 0 }
    }
  ]

  const notificationTemplates = [
    {
      id: '1',
      name: 'Order Confirmation',
      type: 'order',
      channels: ['email', 'whatsapp'],
      variables: ['order_number', 'client_name', 'total_amount', 'delivery_date'],
      content: 'Dear {client_name}, your order {order_number} has been confirmed...'
    },
    {
      id: '2',
      name: 'Payment Reminder',
      type: 'payment',
      channels: ['email', 'sms', 'whatsapp'],
      variables: ['client_name', 'invoice_number', 'amount', 'due_date'],
      content: 'Hi {client_name}, this is a reminder that invoice {invoice_number}...'
    },
    {
      id: '3',
      name: 'Welcome Message',
      type: 'client',
      channels: ['email'],
      variables: ['client_name', 'company_name'],
      content: 'Welcome to {company_name}, {client_name}! We\'re excited to work with you...'
    }
  ]

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return <FileText className="h-4 w-4" />
      case 'payment': return <DollarSign className="h-4 w-4" />
      case 'client': return <Users className="h-4 w-4" />
      case 'system': return <Settings className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />
      case 'sms': return <Phone className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800'
      case 'disconnected': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notification Center</h1>
          <p className="text-gray-600">Manage all communications and notifications</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowComposeDialog(true)}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Send Notification
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowTemplateDialog(true)}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Templates
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{notificationStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-red-600">{notificationStats.unread}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Sent</p>
                <p className="text-2xl font-bold text-green-600">{notificationStats.sent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{notificationStats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{notificationStats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="unread">Unread Only</SelectItem>
                <SelectItem value="order">Order Notifications</SelectItem>
                <SelectItem value="payment">Payment Notifications</SelectItem>
                <SelectItem value="client">Client Notifications</SelectItem>
                <SelectItem value="system">System Notifications</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card key={notification.id} className={notification.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${notification.status === 'unread' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{notification.title}</h3>
                          <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            {getChannelIcon(notification.channel)}
                            <span>{notification.channel}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{notification.client}</span>
                          <span>•</span>
                          <span>{notification.timestamp.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {notification.status === 'unread' && (
                        <Button variant="ghost" size="sm">
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {notification.actions.map((action, index) => (
                      <Button key={index} variant="outline" size="sm">
                        {action}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communicationChannels.map((channel) => {
              const IconComponent = channel.icon
              return (
                <Card key={channel.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5" />
                        {channel.name}
                      </div>
                      <Badge className={getStatusColor(channel.status)}>
                        {channel.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{channel.description}</p>
                    
                    <div className="space-y-2">
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

                    <div className="flex items-center gap-2">
                      <Button
                        variant={channel.enabled ? "destructive" : "default"}
                        size="sm"
                        className="flex-1"
                      >
                        {channel.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
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
            <h2 className="text-lg font-semibold">Notification Templates</h2>
            <Button onClick={() => setShowTemplateDialog(true)}>
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notificationTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{template.name}</span>
                    <Badge variant="outline">{template.type}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Channels:</p>
                    <div className="flex items-center gap-1">
                      {template.channels.map((channel) => (
                        <Badge key={channel} variant="secondary" className="text-xs">
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Variables:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable) => (
                        <code key={variable} className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                          {`{${variable}}`}
                        </code>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Preview:</p>
                    <p className="text-sm bg-gray-50 p-2 rounded text-gray-700 line-clamp-3">
                      {template.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive email notifications for important events</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">WhatsApp Notifications</h4>
                  <p className="text-sm text-gray-500">Send important updates via WhatsApp</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">SMS Notifications</h4>
                  <p className="text-sm text-gray-500">Send urgent notifications via SMS</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Frequency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Daily Digest</label>
                <Select defaultValue="enabled">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Instant Notifications</label>
                <Select defaultValue="important">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Notifications</SelectItem>
                    <SelectItem value="important">Important Only</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Quiet Hours</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="time" defaultValue="22:00" />
                  <Input type="time" defaultValue="08:00" />
                </div>
                <p className="text-xs text-gray-500 mt-1">No notifications will be sent during these hours</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compose Dialog */}
      <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order">Order Update</SelectItem>
                    <SelectItem value="payment">Payment Reminder</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Channel</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="all">All Channels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Recipients</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-clients">All Clients</SelectItem>
                  <SelectItem value="active-clients">Active Clients</SelectItem>
                  <SelectItem value="specific">Specific Clients</SelectItem>
                  <SelectItem value="custom">Custom List</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <Input placeholder="Enter notification subject" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <Textarea 
                placeholder="Enter your message here..."
                rows={6}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Send Now
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
