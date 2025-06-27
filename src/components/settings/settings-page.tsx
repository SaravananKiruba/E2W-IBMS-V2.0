'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, User, Building2, Bell, Shield, 
  CreditCard, Globe, Palette, Save, Upload, Eye, EyeOff
} from 'lucide-react'

export function SettingsPage() {
  const params = useParams()
  const tenant = params.tenant as string

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [settings, setSettings] = useState({
    general: {
      companyName: 'Easy2Work Solutions',
      address: '123 Business Street, City, State 12345',
      phone: '+91 9876543210',
      email: 'info@easy2work.com',
      website: 'https://easy2work.com',
      gstNumber: '29ABCDE1234F1Z5',
      panNumber: 'ABCDE1234F'
    },
    user: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@easy2work.com',
      phone: '+91 9876543210',
      role: 'Admin',
      timezone: 'Asia/Kolkata'
    },
    notifications: {
      emailNotifications: true,
      orderUpdates: true,
      paymentReminders: true,
      systemAlerts: true,
      marketingEmails: false
    },
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
      sessionTimeout: 30
    }
  })

  const handleSave = async (section: string) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`)
    } catch (error) {
      alert('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account and application settings</p>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          {tenant.toUpperCase()} Environment
        </Badge>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="user" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>User</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Billing</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Company Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <Input
                    value={settings.general.companyName}
                    onChange={(e) => handleInputChange('general', 'companyName', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={settings.general.email}
                    onChange={(e) => handleInputChange('general', 'email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <Textarea
                  value={settings.general.address}
                  onChange={(e) => handleInputChange('general', 'address', e.target.value)}
                  placeholder="Enter company address"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <Input
                    value={settings.general.phone}
                    onChange={(e) => handleInputChange('general', 'phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <Input
                    value={settings.general.website}
                    onChange={(e) => handleInputChange('general', 'website', e.target.value)}
                    placeholder="Enter website URL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GST Number
                  </label>
                  <Input
                    value={settings.general.gstNumber}
                    onChange={(e) => handleInputChange('general', 'gstNumber', e.target.value)}
                    placeholder="Enter GST number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PAN Number
                  </label>
                  <Input
                    value={settings.general.panNumber}
                    onChange={(e) => handleInputChange('general', 'panNumber', e.target.value)}
                    placeholder="Enter PAN number"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => handleSave('general')}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Settings */}
        <TabsContent value="user">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>User Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Upload Photo</span>
                  </Button>
                  <p className="text-sm text-gray-500 mt-1">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <Input
                    value={settings.user.firstName}
                    onChange={(e) => handleInputChange('user', 'firstName', e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <Input
                    value={settings.user.lastName}
                    onChange={(e) => handleInputChange('user', 'lastName', e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={settings.user.email}
                    onChange={(e) => handleInputChange('user', 'email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <Input
                    value={settings.user.phone}
                    onChange={(e) => handleInputChange('user', 'phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <Input
                    value={settings.user.role}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <Input
                    value={settings.user.timezone}
                    onChange={(e) => handleInputChange('user', 'timezone', e.target.value)}
                    placeholder="Enter timezone"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => handleSave('user')}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Order Updates</h4>
                    <p className="text-sm text-gray-500">Get notified about order status changes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.orderUpdates}
                      onChange={(e) => handleInputChange('notifications', 'orderUpdates', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Payment Reminders</h4>
                    <p className="text-sm text-gray-500">Reminders for due payments</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.paymentReminders}
                      onChange={(e) => handleInputChange('notifications', 'paymentReminders', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">System Alerts</h4>
                    <p className="text-sm text-gray-500">Important system notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.systemAlerts}
                      onChange={(e) => handleInputChange('notifications', 'systemAlerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Marketing Emails</h4>
                    <p className="text-sm text-gray-500">Promotional content and updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.marketingEmails}
                      onChange={(e) => handleInputChange('notifications', 'marketingEmails', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => handleSave('notifications')}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Login Alerts</h4>
                    <p className="text-sm text-gray-500">Get notified of new login attempts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.loginAlerts}
                      onChange={(e) => handleInputChange('security', 'loginAlerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Timeout (minutes)
                  </label>
                  <Input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    placeholder="Session timeout in minutes"
                    min="5"
                    max="480"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Session will expire after this many minutes of inactivity
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Change Password</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <Input
                        type="password"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <Button variant="outline">
                      Update Password
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => handleSave('security')}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Billing & Subscription</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">Professional Plan</h4>
                    <p className="text-sm text-blue-700">₹2,999/month • Billed annually</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="mt-3 text-sm text-blue-700">
                  <p>Next billing date: January 15, 2025</p>
                  <p>✓ Unlimited orders • ✓ Advanced reports • ✓ Priority support</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Payment Methods</h4>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">•••• •••• •••• 4532</p>
                        <p className="text-sm text-gray-500">Expires 12/25</p>
                      </div>
                    </div>
                    <Badge variant="outline">Default</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Add Payment Method
                </Button>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Billing History</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">December 2024</p>
                      <p className="text-sm text-gray-500">Professional Plan</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹2,999</p>
                      <Button variant="ghost" size="sm">Download</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">November 2024</p>
                      <p className="text-sm text-gray-500">Professional Plan</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹2,999</p>
                      <Button variant="ghost" size="sm">Download</Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline">
                  Change Plan
                </Button>
                <Button variant="destructive">
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
