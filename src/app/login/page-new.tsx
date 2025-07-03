'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useTenant } from '@/components/providers/tenant-provider'

const tenantOptions = [
  { id: 'easy2work', name: 'Easy2Work', logo: '/logos/easy2work.png' },
  { id: 'gracescans', name: 'Grace Scans', logo: '/logos/gracescans.png' },
  { id: 'baleen', name: 'Baleen Media', logo: '/logos/baleen.png' },
  { id: 'test', name: 'Baleen Test', logo: '/logos/test.png' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('demo@ibms.com')
  const [password, setPassword] = useState('demo123')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [detectedTenant, setDetectedTenant] = useState<string | null>(null)
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showTenantDropdown, setShowTenantDropdown] = useState(false)
  const router = useRouter()
  
  const { login } = useAuth()
  const { setCurrentTenant } = useTenant()
  
  // Auto-detect tenant from subdomain
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const subdomain = hostname.split('.')[0]
      
      // Check if subdomain matches any tenant
      const matchedTenant = tenantOptions.find(
        tenant => tenant.id.toLowerCase() === subdomain.toLowerCase()
      )
      
      if (matchedTenant) {
        setDetectedTenant(matchedTenant.id)
        setSelectedTenant(matchedTenant.id)
      }
    }
  }, [])
  
  const filteredTenants = tenantOptions.filter(
    tenant => tenant.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTenant) {
      setError('Please select a company')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      // Encode special characters in password
      const encodedPassword = encodeURIComponent(password)
      
      await login(email, encodedPassword)
      // Set the tenant in context
      if (setCurrentTenant) {
        setCurrentTenant(selectedTenant)
      }
      
      // Redirect to tenant's dashboard
      router.push(`/${selectedTenant}/dashboard`)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }
  
  const selectTenant = (tenantId: string) => {
    setSelectedTenant(tenantId)
    setShowTenantDropdown(false)
  }

  const handleDemoLogin = async () => {
    setError('')
    setIsLoading(true)
    try {
      await login('demo@ibms.com', 'demo123')
      router.push('/demo/dashboard')
    } catch (err: any) {
      setError('Demo login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">I</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to IBMS
          </h1>
          <p className="text-gray-600">
            Intelligent Business Management Software
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Selection */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="relative w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  onClick={() => setShowTenantDropdown(!showTenantDropdown)}
                >
                  {selectedTenant ? (
                    <div className="flex items-center">
                      <div className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full mr-3">
                        <span className="text-blue-800 text-xs font-medium">
                          {tenantOptions.find(t => t.id === selectedTenant)?.name.charAt(0) || '?'}
                        </span>
                      </div>
                      <span>{tenantOptions.find(t => t.id === selectedTenant)?.name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Select your company</span>
                  )}
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </button>
                
                {showTenantDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200">
                    <div className="p-2">
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Search company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <ul className="py-1 max-h-60 overflow-auto">
                      {filteredTenants.map((tenant) => (
                        <li key={tenant.id}>
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 flex items-center"
                            onClick={() => selectTenant(tenant.id)}
                          >
                            <div className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full mr-3">
                              <span className="text-blue-800 text-xs font-medium">
                                {tenant.name.charAt(0)}
                              </span>
                            </div>
                            {tenant.name}
                          </button>
                        </li>
                      ))}
                      {filteredTenants.length === 0 && (
                        <li className="px-4 py-2 text-sm text-gray-500">No companies found</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/50"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/50"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="mt-4 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-green-400 disabled:to-green-500 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Loading Demo...
                </>
              ) : (
                <>
                  🎯 Try Demo Mode
                </>
              )}
            </button>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Demo Credentials:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Email:</strong> demo@ibms.com</p>
              <p><strong>Password:</strong> demo123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link 
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
