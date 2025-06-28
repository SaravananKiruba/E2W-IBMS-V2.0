'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Shield, AlertTriangle, Eye, Lock, Key, FileText,
  Download, Search, Filter, RefreshCw, CheckCircle,
  XCircle, Clock, User, Calendar, Activity
} from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'

interface SecurityPageProps {
  tenant?: string
}

interface AuditLog {
  id: number
  userId: number
  userName: string
  action: string
  resource: string
  details: string
  ipAddress: string
  userAgent: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'success' | 'failed' | 'warning'
}

interface SecurityAlert {
  id: number
  type: 'login_failure' | 'data_access' | 'permission_change' | 'system_error'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'resolved'
  timestamp: string
  userId?: number
  userName?: string
}

interface ComplianceReport {
  id: number
  name: string
  type: 'gdpr' | 'data_retention' | 'access_control' | 'audit_trail'
  status: 'compliant' | 'non_compliant' | 'needs_attention'
  lastCheck: string
  score: number
  issues: number
}

export function SecurityPage({ tenant = 'test' }: SecurityPageProps) {
  const [activeTab, setActiveTab] = useState('audit-logs')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [dateRange, setDateRange] = useState('7days')

  // Mock data - would come from API in real implementation
  const securityStats = {
    totalLogs: 1247,
    criticalAlerts: 3,
    activeIncidents: 1,
    complianceScore: 92,
    lastSecurityScan: '2024-01-15T10:30:00Z',
    loginAttempts: 156,
    failedLogins: 12,
    dataAccess: 890
  }

  const auditLogs: AuditLog[] = [
    {
      id: 1,
      userId: 1,
      userName: 'John Doe',
      action: 'LOGIN',
      resource: 'Authentication',
      details: 'User login successful',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2024-01-15T14:30:00Z',
      severity: 'low',
      status: 'success'
    },
    {
      id: 2,
      userId: 2,
      userName: 'Jane Smith',
      action: 'DATA_ACCESS',
      resource: 'Client Records',
      details: 'Accessed client data for ID: 123',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2024-01-15T14:25:00Z',
      severity: 'medium',
      status: 'success'
    },
    {
      id: 3,
      userId: 1,
      userName: 'John Doe',
      action: 'PERMISSION_CHANGE',
      resource: 'User Management',
      details: 'Modified user permissions for user ID: 5',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2024-01-15T14:20:00Z',
      severity: 'high',
      status: 'success'
    },
    {
      id: 4,
      userId: 0,
      userName: 'System',
      action: 'LOGIN_FAILURE',
      resource: 'Authentication',
      details: 'Failed login attempt for user: admin',
      ipAddress: '203.0.113.1',
      userAgent: 'curl/7.68.0',
      timestamp: '2024-01-15T14:15:00Z',
      severity: 'critical',
      status: 'failed'
    },
    {
      id: 5,
      userId: 3,
      userName: 'Bob Johnson',
      action: 'DATA_EXPORT',
      resource: 'Financial Reports',
      details: 'Exported financial data for Q4 2023',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2024-01-15T14:10:00Z',
      severity: 'medium',
      status: 'success'
    }
  ]

  const securityAlerts: SecurityAlert[] = [
    {
      id: 1,
      type: 'login_failure',
      title: 'Multiple Failed Login Attempts',
      description: 'Multiple failed login attempts detected from IP 203.0.113.1',
      severity: 'high',
      status: 'investigating',
      timestamp: '2024-01-15T14:15:00Z',
      userName: 'admin'
    },
    {
      id: 2,
      type: 'data_access',
      title: 'Unusual Data Access Pattern',
      description: 'User accessed large volume of client records outside normal hours',
      severity: 'medium',
      status: 'open',
      timestamp: '2024-01-15T02:30:00Z',
      userId: 4,
      userName: 'Alice Brown'
    },
    {
      id: 3,
      type: 'permission_change',
      title: 'Privilege Escalation Detected',
      description: 'User permissions were elevated to admin level',
      severity: 'critical',
      status: 'resolved',
      timestamp: '2024-01-14T16:45:00Z',
      userId: 1,
      userName: 'John Doe'
    }
  ]

  const complianceReports: ComplianceReport[] = [
    {
      id: 1,
      name: 'GDPR Compliance',
      type: 'gdpr',
      status: 'compliant',
      lastCheck: '2024-01-15T08:00:00Z',
      score: 95,
      issues: 0
    },
    {
      id: 2,
      name: 'Data Retention Policy',
      type: 'data_retention',
      status: 'needs_attention',
      lastCheck: '2024-01-15T08:00:00Z',
      score: 87,
      issues: 2
    },
    {
      id: 3,
      name: 'Access Control Review',
      type: 'access_control',
      status: 'compliant',
      lastCheck: '2024-01-15T08:00:00Z',
      score: 98,
      issues: 0
    },
    {
      id: 4,
      name: 'Audit Trail Integrity',
      type: 'audit_trail',
      status: 'compliant',
      lastCheck: '2024-01-15T08:00:00Z',
      score: 100,
      issues: 0
    }
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': case 'compliant': case 'resolved': return 'bg-green-100 text-green-800'
      case 'failed': case 'non_compliant': case 'open': return 'bg-red-100 text-red-800'
      case 'warning': case 'needs_attention': case 'investigating': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security & Compliance</h1>
          <p className="text-gray-600">Monitor security events and ensure compliance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Security Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Audit Logs</p>
                <p className="text-2xl font-bold text-blue-600">{securityStats.totalLogs.toLocaleString()}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">{securityStats.criticalAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compliance Score</p>
                <p className="text-2xl font-bold text-green-600">{securityStats.complianceScore}%</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed Logins</p>
                <p className="text-2xl font-bold text-orange-600">{securityStats.failedLogins}</p>
              </div>
              <Lock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="security-alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="encryption">Data Protection</TabsTrigger>
        </TabsList>

        {/* Audit Logs Tab */}
        <TabsContent value="audit-logs" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Audit Trail</CardTitle>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search logs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1day">Last 24 hours</SelectItem>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="90days">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{log.userName}</span>
                          </div>
                          <Badge variant="outline">{log.action}</Badge>
                          <Badge className={getSeverityColor(log.severity)}>
                            {log.severity.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(log.status)}>
                            {log.status === 'success' ? <CheckCircle className="h-3 w-3 mr-1" /> : 
                             log.status === 'failed' ? <XCircle className="h-3 w-3 mr-1" /> :
                             <Clock className="h-3 w-3 mr-1" />}
                            {log.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{log.details}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDateTime(log.timestamp)}
                          </span>
                          <span>Resource: {log.resource}</span>
                          <span>IP: {log.ipAddress}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Alerts Tab */}
        <TabsContent value="security-alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{alert.title}</h3>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(alert.status)}>
                            {alert.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{alert.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDateTime(alert.timestamp)}
                          </span>
                          {alert.userName && (
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {alert.userName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Investigate
                        </Button>
                        {alert.status === 'open' && (
                          <Button variant="outline" size="sm">
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {complianceReports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Compliance Score</span>
                      <span className="font-semibold text-lg">{report.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          report.score >= 95 ? 'bg-green-500' : 
                          report.score >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${report.score}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Issues Found</span>
                      <span className={report.issues > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                        {report.issues}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last Check</span>
                      <span>{formatDate(report.lastCheck)}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Data Protection Tab */}
        <TabsContent value="encryption" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Data Encryption
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Database Encryption</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>API Communication</span>
                    <Badge className="bg-green-100 text-green-800">TLS 1.3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>File Storage</span>
                    <Badge className="bg-green-100 text-green-800">AES-256</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Backup Encryption</span>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Access Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Multi-Factor Authentication</span>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Session Timeout</span>
                    <Badge className="bg-blue-100 text-blue-800">30 min</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Password Policy</span>
                    <Badge className="bg-green-100 text-green-800">Strong</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>IP Restrictions</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Data Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Real-time Monitoring</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Anomaly Detection</span>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Data Loss Prevention</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Breach Detection</span>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <p className="font-medium text-yellow-800">Enable IP Restrictions</p>
                    <p className="text-sm text-yellow-700">Restrict access to trusted IP addresses</p>
                  </div>
                  <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <p className="font-medium text-blue-800">Regular Security Audit</p>
                    <p className="text-sm text-blue-700">Schedule monthly security reviews</p>
                  </div>
                  <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                    <p className="font-medium text-green-800">Good Security Posture</p>
                    <p className="text-sm text-green-700">Your security configuration is strong</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
