'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Palette,
  Shield,
  Globe,
  Bell,
  Zap,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'
import { settingsManager, applyTheme, isFeatureEnabled } from '@/lib/settings-utils'

interface SystemStatusProps {
  tenant?: string
}

export function SystemStatus({ tenant = 'test' }: SystemStatusProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)

  const systemHealth = {
    database: { status: 'healthy', responseTime: '15ms', connections: 12 },
    api: { status: 'healthy', responseTime: '89ms', uptime: '99.9%' },
    cache: { status: 'healthy', hitRate: '94%', size: '128MB' },
    storage: { status: 'warning', usage: '78%', available: '2.1GB' }
  }

  const recentActivities = [
    { id: 1, action: 'User login', user: 'Raj Kumar', timestamp: '2 minutes ago', type: 'info' },
    { id: 2, action: 'Order created', user: 'Priya Singh', timestamp: '5 minutes ago', type: 'success' },
    { id: 3, action: 'Failed login attempt', user: 'Unknown', timestamp: '10 minutes ago', type: 'warning' },
    { id: 4, action: 'Backup completed', user: 'System', timestamp: '1 hour ago', type: 'success' },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
        <p className="text-gray-600">Monitor system health and performance</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(systemHealth.database.status)}
              <div>
                <p className="text-sm text-gray-600">Database</p>
                <p className="text-2xl font-bold">{systemHealth.database.responseTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(systemHealth.api.status)}
              <div>
                <p className="text-sm text-gray-600">API Response</p>
                <p className="text-2xl font-bold">{systemHealth.api.responseTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(systemHealth.cache.status)}
              <div>
                <p className="text-sm text-gray-600">Cache Hit Rate</p>
                <p className="text-2xl font-bold">{systemHealth.cache.hitRate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(systemHealth.storage.status)}
              <div>
                <p className="text-sm text-gray-600">Storage Usage</p>
                <p className="text-2xl font-bold">{systemHealth.storage.usage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Components */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  System Components
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database Server</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemHealth.database.status)}
                    <span className="text-sm font-medium capitalize">{systemHealth.database.status}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Gateway</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemHealth.api.status)}
                    <span className="text-sm font-medium capitalize">{systemHealth.api.status}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cache Layer</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemHealth.cache.status)}
                    <span className="text-sm font-medium capitalize">{systemHealth.cache.status}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">File Storage</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemHealth.storage.status)}
                    <span className="text-sm font-medium capitalize">{systemHealth.storage.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-500">
                        {activity.user} • {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Feature Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Feature Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                  'clients', 'orders', 'finance', 'reports', 'leads', 'queue',
                  'appointments', 'employees', 'consultants', 'notifications',
                  'communications', 'analytics', 'documents', 'security'
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Badge 
                      variant={isFeatureEnabled(feature) ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {feature}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database Queries</span>
                    <span className="text-sm font-medium">{systemHealth.database.responseTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Endpoints</span>
                    <span className="text-sm font-medium">{systemHealth.api.responseTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Page Load Time</span>
                    <span className="text-sm font-medium">1.2s</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm font-medium">2.1GB / 8GB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CPU Usage</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Network I/O</span>
                    <span className="text-sm font-medium">45MB/s</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Failed Login Attempts (24h)</span>
                    <Badge variant="outline">3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Blocked IP Addresses</span>
                    <Badge variant="outline">0</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Security Alerts</span>
                    <Badge variant="outline">0</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Sessions</span>
                    <span className="text-sm font-medium">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Admin Users</span>
                    <span className="text-sm font-medium">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Security Scan</span>
                    <span className="text-sm font-medium">2 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Maintenance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Cache
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  disabled={isLoading}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Optimize Database
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  disabled={isLoading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backup & Restore</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Last Backup: Today at 3:00 AM</p>
                  <p className="text-sm text-gray-600">Next Backup: Tomorrow at 3:00 AM</p>
                </div>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  disabled={isLoading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Backup
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  disabled={isLoading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Restore from Backup
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
