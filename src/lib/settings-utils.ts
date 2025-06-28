// System configuration and settings utilities for IBMS
export interface SystemSettings {
  general: {
    companyName: string
    companyEmail: string
    companyPhone: string
    companyAddress: string
    timezone: string
    currency: string
    dateFormat: string
    fiscalYearStart: string
  }
  branding: {
    primaryColor: string
    secondaryColor: string
    logo: string
    favicon: string
    loginBackground: string
  }
  notifications: {
    emailEnabled: boolean
    smsEnabled: boolean
    pushEnabled: boolean
    digestFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  }
  security: {
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSymbols: boolean
      maxAge: number
    }
    sessionTimeout: number
    maxLoginAttempts: number
    twoFactorRequired: boolean
  }
  integrations: {
    paymentGateways: Array<{
      name: string
      enabled: boolean
      apiKey: string
      secretKey: string
    }>
    emailProviders: Array<{
      name: string
      enabled: boolean
      config: Record<string, string>
    }>
    smsProviders: Array<{
      name: string
      enabled: boolean
      config: Record<string, string>
    }>
  }
  features: {
    modules: Record<string, boolean>
    experiments: Record<string, boolean>
  }
}

export const DEFAULT_SETTINGS: SystemSettings = {
  general: {
    companyName: 'Your Company',
    companyEmail: 'contact@company.com',
    companyPhone: '+91 9999999999',
    companyAddress: 'Your Address',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    fiscalYearStart: '04-01'
  },
  branding: {
    primaryColor: '#0ea5e9',
    secondaryColor: '#64748b',
    logo: '',
    favicon: '',
    loginBackground: ''
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    digestFrequency: 'daily'
  },
  security: {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: false,
      maxAge: 90
    },
    sessionTimeout: 1440, // 24 hours in minutes
    maxLoginAttempts: 5,
    twoFactorRequired: false
  },
  integrations: {
    paymentGateways: [],
    emailProviders: [],
    smsProviders: []
  },
  features: {
    modules: {
      clients: true,
      orders: true,
      finance: true,
      reports: true,
      leads: true,
      queue: true,
      appointments: true,
      employees: true,
      consultants: true,
      notifications: true,
      communications: true,
      analytics: true,
      documents: true,
      security: true
    },
    experiments: {
      newDashboard: false,
      enhancedReports: false,
      aiAssistant: false
    }
  }
}

class SettingsManager {
  private settings: SystemSettings
  private storageKey: string

  constructor(storageKey = 'ibms_settings') {
    this.storageKey = storageKey
    this.settings = this.loadSettings()
  }

  private loadSettings(): SystemSettings {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        return this.mergeSettings(DEFAULT_SETTINGS, parsed)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
    return DEFAULT_SETTINGS
  }

  private mergeSettings(defaultSettings: SystemSettings, userSettings: any): SystemSettings {
    return {
      general: { ...defaultSettings.general, ...userSettings.general },
      branding: { ...defaultSettings.branding, ...userSettings.branding },
      notifications: { ...defaultSettings.notifications, ...userSettings.notifications },
      security: {
        ...defaultSettings.security,
        ...userSettings.security,
        passwordPolicy: {
          ...defaultSettings.security.passwordPolicy,
          ...userSettings.security?.passwordPolicy
        }
      },
      integrations: {
        paymentGateways: userSettings.integrations?.paymentGateways || defaultSettings.integrations.paymentGateways,
        emailProviders: userSettings.integrations?.emailProviders || defaultSettings.integrations.emailProviders,
        smsProviders: userSettings.integrations?.smsProviders || defaultSettings.integrations.smsProviders
      },
      features: {
        modules: { ...defaultSettings.features.modules, ...userSettings.features?.modules },
        experiments: { ...defaultSettings.features.experiments, ...userSettings.features?.experiments }
      }
    }
  }

  public getSettings(): SystemSettings {
    return this.settings
  }

  public getSetting<K extends keyof SystemSettings>(category: K): SystemSettings[K] {
    return this.settings[category]
  }

  public updateSettings(updates: Partial<SystemSettings>): void {
    this.settings = this.mergeSettings(this.settings, updates)
    this.saveSettings()
  }

  public updateSetting<K extends keyof SystemSettings>(
    category: K, 
    updates: Partial<SystemSettings[K]>
  ): void {
    this.settings[category] = { ...this.settings[category], ...updates }
    this.saveSettings()
  }

  public resetSettings(): void {
    this.settings = DEFAULT_SETTINGS
    this.saveSettings()
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  public exportSettings(): string {
    return JSON.stringify(this.settings, null, 2)
  }

  public importSettings(settingsJson: string): boolean {
    try {
      const parsed = JSON.parse(settingsJson)
      this.settings = this.mergeSettings(DEFAULT_SETTINGS, parsed)
      this.saveSettings()
      return true
    } catch (error) {
      console.error('Failed to import settings:', error)
      return false
    }
  }

  public validateSettings(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validate general settings
    if (!this.settings.general.companyName.trim()) {
      errors.push('Company name is required')
    }

    if (!this.settings.general.companyEmail.includes('@')) {
      errors.push('Valid company email is required')
    }

    // Validate security settings
    if (this.settings.security.passwordPolicy.minLength < 6) {
      errors.push('Password minimum length should be at least 6 characters')
    }

    if (this.settings.security.sessionTimeout < 30) {
      errors.push('Session timeout should be at least 30 minutes')
    }

    // Validate branding
    if (this.settings.branding.primaryColor && !this.settings.branding.primaryColor.match(/^#[0-9A-F]{6}$/i)) {
      errors.push('Primary color should be a valid hex color')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Singleton instance
export const settingsManager = new SettingsManager()

// Theme utilities
export function applyTheme(settings: SystemSettings['branding']): void {
  const root = document.documentElement

  // Apply CSS custom properties
  root.style.setProperty('--primary-color', settings.primaryColor)
  root.style.setProperty('--secondary-color', settings.secondaryColor)

  // Update favicon if provided
  if (settings.favicon) {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (favicon) {
      favicon.href = settings.favicon
    }
  }

  // Update document title
  const companyName = settingsManager.getSetting('general').companyName
  if (companyName !== 'Your Company') {
    document.title = `IBMS - ${companyName}`
  }
}

// Feature flag utilities
export function isFeatureEnabled(feature: string): boolean {
  const features = settingsManager.getSetting('features')
  return features.modules[feature] === true
}

export function isExperimentEnabled(experiment: string): boolean {
  const features = settingsManager.getSetting('features')
  return features.experiments[experiment] === true
}

export function enableFeature(feature: string): void {
  const features = settingsManager.getSetting('features')
  settingsManager.updateSetting('features', {
    ...features,
    modules: { ...features.modules, [feature]: true }
  })
}

export function disableFeature(feature: string): void {
  const features = settingsManager.getSetting('features')
  settingsManager.updateSetting('features', {
    ...features,
    modules: { ...features.modules, [feature]: false }
  })
}

// Timezone utilities
export function getTimezoneOffset(timezone: string): number {
  try {
    const now = new Date()
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
    const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }))
    return (targetTime.getTime() - utc.getTime()) / (1000 * 60 * 60)
  } catch {
    return 0
  }
}

export function formatDateWithTimezone(date: Date, timezone: string, format?: string): string {
  const settings = settingsManager.getSetting('general')
  const dateFormat = format || settings.dateFormat
  
  try {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }

    const formatted = new Intl.DateTimeFormat('en-GB', options).format(date)
    
    // Convert to user's preferred format
    if (dateFormat === 'MM/DD/YYYY') {
      const [day, month, year] = formatted.split('/')
      return `${month}/${day}/${year}`
    }
    
    return formatted // DD/MM/YYYY is default
  } catch {
    return date.toLocaleDateString()
  }
}

// Currency utilities
export function formatCurrencyWithSettings(amount: number): string {
  const settings = settingsManager.getSetting('general')
  
  const currencyMap: Record<string, string> = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥'
  }

  const symbol = currencyMap[settings.currency] || settings.currency
  
  if (settings.currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

// Backup and restore utilities
export function createSystemBackup(): {
  settings: SystemSettings
  timestamp: string
  version: string
} {
  return {
    settings: settingsManager.getSettings(),
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  }
}

export function restoreSystemBackup(backup: {
  settings: SystemSettings
  timestamp: string
  version: string
}): boolean {
  try {
    // Validate backup format
    if (!backup.settings || !backup.timestamp || !backup.version) {
      throw new Error('Invalid backup format')
    }

    // Import settings
    settingsManager.updateSettings(backup.settings)
    
    // Apply theme
    applyTheme(backup.settings.branding)
    
    return true
  } catch (error) {
    console.error('Failed to restore backup:', error)
    return false
  }
}
