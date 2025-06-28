// PWA utilities for IBMS
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export interface PWAInstallProps {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  installApp: () => Promise<void>
  showInstallPrompt: boolean
  dismissInstallPrompt: () => void
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null
  private installCallbacks: Array<() => void> = []
  private onlineCallbacks: Array<(isOnline: boolean) => void> = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeEventListeners()
    }
  }

  private initializeEventListeners() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e as BeforeInstallPromptEvent
      this.notifyInstallCallbacks()
    })

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App was installed')
      this.deferredPrompt = null
      this.notifyInstallCallbacks()
    })

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.notifyOnlineCallbacks(true)
    })

    window.addEventListener('offline', () => {
      this.notifyOnlineCallbacks(false)
    })
  }

  private notifyInstallCallbacks() {
    this.installCallbacks.forEach(callback => callback())
  }

  private notifyOnlineCallbacks(isOnline: boolean) {
    this.onlineCallbacks.forEach(callback => callback(isOnline))
  }

  public isInstallable(): boolean {
    return this.deferredPrompt !== null
  }

  public isInstalled(): boolean {
    return window.matchMedia && window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any)?.standalone === true
  }

  public isOnline(): boolean {
    return navigator.onLine
  }

  public async installApp(): Promise<void> {
    if (!this.deferredPrompt) {
      throw new Error('Install prompt is not available')
    }

    this.deferredPrompt.prompt()
    const { outcome } = await this.deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt')
    } else {
      console.log('[PWA] User dismissed the install prompt')
    }

    this.deferredPrompt = null
  }

  public onInstallabilityChange(callback: () => void): () => void {
    this.installCallbacks.push(callback)
    return () => {
      this.installCallbacks = this.installCallbacks.filter(cb => cb !== callback)
    }
  }

  public onOnlineStatusChange(callback: (isOnline: boolean) => void): () => void {
    this.onlineCallbacks.push(callback)
    return () => {
      this.onlineCallbacks = this.onlineCallbacks.filter(cb => cb !== callback)
    }
  }

  public async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('[PWA] Service Worker registered:', registration)
        return registration
      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error)
        return null
      }
    }
    return null
  }

  public async unregisterServiceWorker(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
      }
      return true
    }
    return false
  }

  public async updateServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.update()
      }
    }
  }

  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission
    }
    return 'denied'
  }

  public async sendNotification(title: string, options?: NotificationOptions): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        await registration.showNotification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-96x96.png',
          ...options
        })
      } else {
        new Notification(title, {
          icon: '/icons/icon-192x192.png',
          ...options
        })
      }
    }
  }

  public getInstallInstructions(): { [key: string]: string } {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return {
        browser: 'Chrome',
        instructions: 'Click the install button in the address bar or use the menu → Install IBMS'
      }
    } else if (userAgent.includes('firefox')) {
      return {
        browser: 'Firefox',
        instructions: 'Click the home icon in the address bar to add to home screen'
      }
    } else if (userAgent.includes('safari')) {
      return {
        browser: 'Safari',
        instructions: 'Tap the share button and select "Add to Home Screen"'
      }
    } else if (userAgent.includes('edg')) {
      return {
        browser: 'Edge',
        instructions: 'Click the install button in the address bar or use the menu → Apps → Install IBMS'
      }
    }
    
    return {
      browser: 'Unknown',
      instructions: 'Use your browser\'s menu to install this app'
    }
  }
}

// Singleton instance
export const pwaManager = new PWAManager()

// Utility functions
export function detectPWADisplayMode(): 'browser' | 'standalone' | 'minimal-ui' | 'fullscreen' {
  if (typeof window === 'undefined') return 'browser'
  
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen'
  }
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone'
  }
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui'
  }
  return 'browser'
}

export function isPWAInstalled(): boolean {
  return detectPWADisplayMode() === 'standalone'
}

export function getStorageQuota(): Promise<{ usage: number; quota: number } | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    return navigator.storage.estimate().then(estimate => ({
      usage: estimate.usage || 0,
      quota: estimate.quota || 0
    }))
  }
  return Promise.resolve(null)
}

export function clearCaches(): Promise<boolean[]> {
  if ('caches' in window) {
    return caches.keys().then(names =>
      Promise.all(names.map(name => caches.delete(name)))
    )
  }
  return Promise.resolve([])
}

export function getNetworkStatus(): {
  online: boolean
  effectiveType?: string
  downlink?: number
  rtt?: number
} {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
  
  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt
  }
}

export function getDeviceInfo(): {
  isMobile: boolean
  platform: string
  userAgent: string
  screen: { width: number; height: number }
  orientation: 'portrait' | 'landscape'
} {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      platform: 'unknown',
      userAgent: '',
      screen: { width: 0, height: 0 },
      orientation: 'portrait'
    }
  }

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  return {
    isMobile,
    platform: navigator.platform,
    userAgent: navigator.userAgent,
    screen: {
      width: window.screen.width,
      height: window.screen.height
    },
    orientation: window.screen.width > window.screen.height ? 'landscape' : 'portrait'
  }
}

// Background sync utilities
export function registerBackgroundSync(tag: string): Promise<void> {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    return navigator.serviceWorker.ready.then(registration => {
      return (registration as any).sync.register(tag)
    })
  }
  return Promise.reject('Background Sync not supported')
}

// Share API utilities
export function canShare(data?: ShareData): boolean {
  return 'share' in navigator && navigator.canShare ? navigator.canShare(data) : false
}

export function shareContent(data: ShareData): Promise<void> {
  if ('share' in navigator) {
    return navigator.share(data)
  }
  return Promise.reject('Web Share API not supported')
}

// App badge utilities (for supported browsers)
export function setBadge(count?: number): Promise<void> {
  if ('setAppBadge' in navigator) {
    return (navigator as any).setAppBadge(count)
  }
  return Promise.resolve()
}

export function clearBadge(): Promise<void> {
  if ('clearAppBadge' in navigator) {
    return (navigator as any).clearAppBadge()
  }
  return Promise.resolve()
}
