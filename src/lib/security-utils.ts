// Security and validation utilities
export function hashPassword(password: string): string {
  // In a real implementation, this would use bcrypt or similar
  // This is just a mock implementation
  return `hashed_${password}`
}

export function validatePasswordStrength(password: string): {
  isValid: boolean
  strength: 'weak' | 'medium' | 'strong'
  errors: string[]
} {
  const errors: string[] = []
  let score = 0

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  } else {
    score += 1
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else {
    score += 1
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  } else {
    score += 1
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  } else {
    score += 1
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  } else {
    score += 1
  }

  let strength: 'weak' | 'medium' | 'strong'
  if (score < 3) {
    strength = 'weak'
  } else if (score < 5) {
    strength = 'medium'
  } else {
    strength = 'strong'
  }

  return {
    isValid: errors.length === 0,
    strength,
    errors
  }
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes to prevent SQL injection
    .trim()
}

export function validateCSRFToken(token: string): boolean {
  // Mock implementation - would validate against server-side token
  return token.length > 0
}

export function generateSecureToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function encryptData(data: string, key: string): string {
  // Mock implementation - would use real encryption in production
  return btoa(data + key)
}

export function decryptData(encryptedData: string, key: string): string {
  // Mock implementation - would use real decryption in production
  try {
    const decoded = atob(encryptedData)
    return decoded.replace(key, '')
  } catch {
    throw new Error('Failed to decrypt data')
  }
}

export function detectSuspiciousActivity(activities: Array<{
  action: string
  timestamp: string
  ipAddress: string
  userAgent: string
}>): {
  isSuspicious: boolean
  reasons: string[]
  riskLevel: 'low' | 'medium' | 'high'
} {
  const reasons: string[] = []
  let riskScore = 0

  // Check for rapid successive actions
  const timestamps = activities.map(a => new Date(a.timestamp).getTime())
  const timeDiffs = timestamps.slice(1).map((t, i) => t - timestamps[i])
  const rapidActions = timeDiffs.filter(diff => diff < 1000).length // < 1 second apart

  if (rapidActions > 3) {
    reasons.push('Rapid successive actions detected')
    riskScore += 2
  }

  // Check for multiple IP addresses
  const uniqueIPs = new Set(activities.map(a => a.ipAddress))
  if (uniqueIPs.size > 3) {
    reasons.push('Multiple IP addresses used')
    riskScore += 3
  }

  // Check for suspicious user agents
  const suspiciousAgents = activities.filter(a => 
    a.userAgent.includes('bot') || 
    a.userAgent.includes('crawler') ||
    a.userAgent.includes('curl') ||
    a.userAgent.includes('wget')
  )

  if (suspiciousAgents.length > 0) {
    reasons.push('Suspicious user agent detected')
    riskScore += 2
  }

  // Check for unusual hours (outside 6 AM - 10 PM)
  const unusualHours = activities.filter(a => {
    const hour = new Date(a.timestamp).getHours()
    return hour < 6 || hour > 22
  })

  if (unusualHours.length > activities.length * 0.5) {
    reasons.push('Unusual access hours')
    riskScore += 1
  }

  let riskLevel: 'low' | 'medium' | 'high'
  if (riskScore >= 5) {
    riskLevel = 'high'
  } else if (riskScore >= 3) {
    riskLevel = 'medium'
  } else {
    riskLevel = 'low'
  }

  return {
    isSuspicious: riskScore > 2,
    reasons,
    riskLevel
  }
}

export function logSecurityEvent(event: {
  action: string
  resource: string
  details: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId?: number
  ipAddress?: string
}): void {
  // In a real implementation, this would send the event to the security service
  console.log('[SECURITY EVENT]', {
    ...event,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  })
}

export function checkDataCompliance(data: Record<string, any>): {
  isCompliant: boolean
  violations: string[]
  recommendations: string[]
} {
  const violations: string[] = []
  const recommendations: string[] = []

  // Check for sensitive data patterns
  const sensitivePatterns = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g
  }

  const dataString = JSON.stringify(data)

  if (sensitivePatterns.email.test(dataString)) {
    violations.push('Email addresses detected in data')
    recommendations.push('Ensure email addresses are properly encrypted')
  }

  if (sensitivePatterns.phone.test(dataString)) {
    violations.push('Phone numbers detected in data')
    recommendations.push('Consider masking or encrypting phone numbers')
  }

  if (sensitivePatterns.ssn.test(dataString)) {
    violations.push('SSN patterns detected in data')
    recommendations.push('SSNs must be encrypted and access logged')
  }

  if (sensitivePatterns.creditCard.test(dataString)) {
    violations.push('Credit card patterns detected in data')
    recommendations.push('Credit card data requires PCI DSS compliance')
  }

  return {
    isCompliant: violations.length === 0,
    violations,
    recommendations
  }
}

export function generateComplianceReport(tenant: string): {
  tenant: string
  generatedAt: string
  overallScore: number
  sections: Array<{
    name: string
    score: number
    status: 'compliant' | 'needs_attention' | 'non_compliant'
    issues: string[]
    recommendations: string[]
  }>
} {
  // Mock compliance report generation
  return {
    tenant,
    generatedAt: new Date().toISOString(),
    overallScore: Math.floor(Math.random() * 20) + 80, // 80-100
    sections: [
      {
        name: 'Data Protection',
        score: 95,
        status: 'compliant',
        issues: [],
        recommendations: ['Consider implementing field-level encryption']
      },
      {
        name: 'Access Control',
        score: 87,
        status: 'needs_attention',
        issues: ['Some users have excessive permissions'],
        recommendations: ['Review user permissions quarterly', 'Implement role-based access control']
      },
      {
        name: 'Audit Trail',
        score: 100,
        status: 'compliant',
        issues: [],
        recommendations: ['Maintain current audit logging practices']
      },
      {
        name: 'Data Retention',
        score: 78,
        status: 'needs_attention',
        issues: ['Some old data not properly archived'],
        recommendations: ['Implement automated data archival', 'Review retention policies']
      }
    ]
  }
}

// Security monitoring utilities
export function startSecurityMonitoring(): void {
  // Mock security monitoring initialization
  console.log('[SECURITY] Monitoring started')
}

export function stopSecurityMonitoring(): void {
  // Mock security monitoring cleanup
  console.log('[SECURITY] Monitoring stopped')
}

export function isSecureConnection(): boolean {
  return window.location.protocol === 'https:'
}

export function checkBrowserSecurity(): {
  isSecure: boolean
  warnings: string[]
} {
  const warnings: string[] = []

  if (!isSecureConnection()) {
    warnings.push('Connection is not secure (HTTP instead of HTTPS)')
  }

  if (!window.crypto || !window.crypto.subtle) {
    warnings.push('Browser does not support Web Cryptography API')
  }

  if (document.cookie.includes('Secure=false')) {
    warnings.push('Insecure cookies detected')
  }

  return {
    isSecure: warnings.length === 0,
    warnings
  }
}
