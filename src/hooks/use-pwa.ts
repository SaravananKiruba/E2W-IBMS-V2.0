import { useState, useEffect } from 'react'
import { pwaManager, type PWAInstallProps } from '@/lib/pwa-utils'

export function usePWA(): PWAInstallProps & {
  requestNotificationPermission: () => Promise<NotificationPermission>
  sendNotification: (title: string, options?: NotificationOptions) => Promise<void>
  networkStatus: { online: boolean; effectiveType?: string }
  storageQuota: { usage: number; quota: number } | null
  deviceInfo: {
    isMobile: boolean
    platform: string
    orientation: 'portrait' | 'landscape'
  }
} {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [networkStatus, setNetworkStatus] = useState<{ online: boolean; effectiveType?: string }>({
    online: true
  })
  const [storageQuota, setStorageQuota] = useState<{ usage: number; quota: number } | null>(null)
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    platform: 'unknown',
    orientation: 'portrait' as 'portrait' | 'landscape'
  })

  useEffect(() => {
    // Initialize states
    setIsInstallable(pwaManager.isInstallable())
    setIsInstalled(pwaManager.isInstalled())
    setIsOnline(pwaManager.isOnline())

    // Set up listeners
    const unsubscribeInstall = pwaManager.onInstallabilityChange(() => {
      setIsInstallable(pwaManager.isInstallable())
      setIsInstalled(pwaManager.isInstalled())
      
      // Show install prompt if app becomes installable and not already installed
      if (pwaManager.isInstallable() && !pwaManager.isInstalled()) {
        setShowInstallPrompt(true)
      }
    })

    const unsubscribeOnline = pwaManager.onOnlineStatusChange((online) => {
      setIsOnline(online)
      setNetworkStatus(prev => ({ ...prev, online }))
    })

    // Get initial network status
    if (typeof window !== 'undefined') {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      setNetworkStatus({
        online: navigator.onLine,
        effectiveType: connection?.effectiveType
      })

      // Get device info
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setDeviceInfo({
        isMobile,
        platform: navigator.platform,
        orientation: window.screen.width > window.screen.height ? 'landscape' : 'portrait'
      })

      // Get storage quota
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(estimate => {
          setStorageQuota({
            usage: estimate.usage || 0,
            quota: estimate.quota || 0
          })
        })
      }
    }

    // Listen for connection changes
    const handleConnectionChange = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      setNetworkStatus({
        online: navigator.onLine,
        effectiveType: connection?.effectiveType
      })
    }

    if (typeof window !== 'undefined') {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      if (connection) {
        connection.addEventListener('change', handleConnectionChange)
      }
    }

    return () => {
      unsubscribeInstall()
      unsubscribeOnline()
      
      if (typeof window !== 'undefined') {
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
        if (connection) {
          connection.removeEventListener('change', handleConnectionChange)
        }
      }
    }
  }, [])

  const installApp = async () => {
    try {
      await pwaManager.installApp()
      setShowInstallPrompt(false)
    } catch (error) {
      console.error('[PWA Hook] Failed to install app:', error)
      throw error
    }
  }

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false)
  }

  const requestNotificationPermission = () => {
    return pwaManager.requestNotificationPermission()
  }

  const sendNotification = (title: string, options?: NotificationOptions) => {
    return pwaManager.sendNotification(title, options)
  }

  return {
    isInstallable,
    isInstalled,
    isOnline,
    showInstallPrompt,
    installApp,
    dismissInstallPrompt,
    requestNotificationPermission,
    sendNotification,
    networkStatus,
    storageQuota,
    deviceInfo
  }
}

// Hook for managing app updates
export function useAppUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!isUpdating) {
          setUpdateAvailable(true)
        }
      })

      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
              }
            })
          }
        })
      })
    }
  }, [isUpdating])

  const updateApp = async () => {
    setIsUpdating(true)
    try {
      await pwaManager.updateServiceWorker()
      window.location.reload()
    } catch (error) {
      console.error('[PWA Update] Failed to update app:', error)
      setIsUpdating(false)
    }
  }

  return {
    updateAvailable,
    updateApp,
    isUpdating
  }
}

// Hook for managing offline storage
export function useOfflineStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadValue = async () => {
      try {
        if ('indexedDB' in window) {
          // Use IndexedDB for complex data
          const stored = localStorage.getItem(`offline_${key}`)
          if (stored) {
            setValue(JSON.parse(stored))
          }
        } else {
          // Fallback to localStorage
          const stored = localStorage.getItem(`offline_${key}`)
          if (stored) {
            setValue(JSON.parse(stored))
          }
        }
      } catch (error) {
        console.error('[Offline Storage] Failed to load value:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadValue()
  }, [key])

  const updateValue = async (newValue: T) => {
    try {
      setValue(newValue)
      localStorage.setItem(`offline_${key}`, JSON.stringify(newValue))
    } catch (error) {
      console.error('[Offline Storage] Failed to save value:', error)
    }
  }

  const clearValue = async () => {
    try {
      setValue(defaultValue)
      localStorage.removeItem(`offline_${key}`)
    } catch (error) {
      console.error('[Offline Storage] Failed to clear value:', error)
    }
  }

  return {
    value,
    updateValue,
    clearValue,
    isLoading
  }
}
