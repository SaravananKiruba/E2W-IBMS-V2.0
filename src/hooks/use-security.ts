import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

// Types
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

interface SecurityStats {
  totalLogs: number
  criticalAlerts: number
  activeIncidents: number
  complianceScore: number
  lastSecurityScan: string
  loginAttempts: number
  failedLogins: number
  dataAccess: number
}

interface EncryptionStatus {
  database_encryption: {
    enabled: boolean
    algorithm: string
    status: string
  }
  api_communication: {
    enabled: boolean
    protocol: string
    status: string
  }
  file_storage: {
    enabled: boolean
    algorithm: string
    status: string
  }
  backup_encryption: {
    enabled: boolean
    algorithm: string
    status: string
  }
  access_control: {
    mfa_enabled: boolean
    session_timeout: number
    password_policy: string
    ip_restrictions: string
  }
}

// API functions
const securityApi = {
  getAuditLogs: async (filters: {
    severity?: string
    dateRange?: string
    search?: string
    limit?: number
    offset?: number
  } = {}): Promise<AuditLog[]> => {
    // Mock implementation
    return [
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
      }
    ]
  },

  createAuditLog: async (logData: Partial<AuditLog>) => {
    // Mock implementation
    return {
      id: Math.floor(Math.random() * 1000) + 1,
      ...logData,
      timestamp: new Date().toISOString()
    }
  },

  getSecurityAlerts: async (filters: {
    status?: string
    severity?: string
    type?: string
    limit?: number
  } = {}): Promise<SecurityAlert[]> => {
    // Mock implementation
    return [
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
  },

  updateAlertStatus: async (alertId: number, status: string, notes?: string) => {
    // Mock implementation
    return { success: true, message: 'Alert status updated successfully' }
  },

  getComplianceReports: async (): Promise<ComplianceReport[]> => {
    // Mock implementation
    return [
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
  },

  runComplianceCheck: async (type?: string) => {
    // Mock implementation
    return {
      checkId: Math.random().toString(36).substr(2, 9),
      type: type || 'all',
      status: 'completed',
      score: Math.floor(Math.random() * 15) + 85,
      issuesFound: Math.floor(Math.random() * 4),
      recommendations: [
        'Enable two-factor authentication for all users',
        'Review and update password policies',
        'Conduct security awareness training'
      ],
      completedAt: new Date().toISOString()
    }
  },

  getSecurityStats: async (): Promise<SecurityStats> => {
    // Mock implementation
    return {
      totalLogs: 1247,
      criticalAlerts: 3,
      activeIncidents: 1,
      complianceScore: 92,
      lastSecurityScan: '2024-01-15T10:30:00Z',
      loginAttempts: 156,
      failedLogins: 12,
      dataAccess: 890
    }
  },

  getEncryptionStatus: async (): Promise<EncryptionStatus> => {
    // Mock implementation
    return {
      database_encryption: {
        enabled: true,
        algorithm: 'AES-256',
        status: 'active'
      },
      api_communication: {
        enabled: true,
        protocol: 'TLS 1.3',
        status: 'active'
      },
      file_storage: {
        enabled: true,
        algorithm: 'AES-256',
        status: 'active'
      },
      backup_encryption: {
        enabled: true,
        algorithm: 'AES-256',
        status: 'active'
      },
      access_control: {
        mfa_enabled: true,
        session_timeout: 30,
        password_policy: 'strong',
        ip_restrictions: 'partial'
      }
    }
  },

  exportSecurityReport: async (options: {
    type: string
    format: string
    dateRange: string
  }) => {
    // Mock implementation
    return new Blob(['Mock security report content'], { type: 'application/pdf' })
  }
}

// Query keys
const securityKeys = {
  all: ['security'] as const,
  auditLogs: (filters?: any) => [...securityKeys.all, 'audit-logs', filters] as const,
  securityAlerts: (filters?: any) => [...securityKeys.all, 'security-alerts', filters] as const,
  complianceReports: () => [...securityKeys.all, 'compliance-reports'] as const,
  securityStats: () => [...securityKeys.all, 'security-stats'] as const,
  encryptionStatus: () => [...securityKeys.all, 'encryption-status'] as const,
}

// Hook functions
export function useAuditLogs(filters: {
  severity?: string
  dateRange?: string
  search?: string
  limit?: number
  offset?: number
} = {}) {
  return useQuery({
    queryKey: securityKeys.auditLogs(filters),
    queryFn: () => securityApi.getAuditLogs(filters),
  })
}

export function useCreateAuditLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: securityApi.createAuditLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.auditLogs() })
      toast.success('Audit log created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create audit log')
    },
  })
}

export function useSecurityAlerts(filters: {
  status?: string
  severity?: string
  type?: string
  limit?: number
} = {}) {
  return useQuery({
    queryKey: securityKeys.securityAlerts(filters),
    queryFn: () => securityApi.getSecurityAlerts(filters),
  })
}

export function useUpdateAlertStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ alertId, status, notes }: { alertId: number; status: string; notes?: string }) =>
      securityApi.updateAlertStatus(alertId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.securityAlerts() })
      toast.success('Alert status updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update alert status')
    },
  })
}

export function useComplianceReports() {
  return useQuery({
    queryKey: securityKeys.complianceReports(),
    queryFn: securityApi.getComplianceReports,
  })
}

export function useRunComplianceCheck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: securityApi.runComplianceCheck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.complianceReports() })
      toast.success('Compliance check completed successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to run compliance check')
    },
  })
}

export function useSecurityStats() {
  return useQuery({
    queryKey: securityKeys.securityStats(),
    queryFn: securityApi.getSecurityStats,
  })
}

export function useEncryptionStatus() {
  return useQuery({
    queryKey: securityKeys.encryptionStatus(),
    queryFn: securityApi.getEncryptionStatus,
  })
}

export function useExportSecurityReport() {
  return useMutation({
    mutationFn: securityApi.exportSecurityReport,
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `security_report_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Security report exported successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to export security report')
    },
  })
}
