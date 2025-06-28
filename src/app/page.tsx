'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function HomePage() {
  const router = useRouter()
  
  useEffect(() => {
    const token = Cookies.get('token')
    const tenant = Cookies.get('tenant') || 'test'
    
    if (token) {
      // Redirect to dashboard if authenticated
      router.push(`/${tenant}/dashboard`)
    } else {
      // Redirect to login if not authenticated
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          IBMS - Intelligent Business Management Software
        </h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
