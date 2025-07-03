'use client'

import { Fragment, useState } from 'react'
import { Menu, Transition, Popover } from '@headlessui/react'
import { 
  Bars3Icon, 
  BellIcon, 
  ChevronDownIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  LanguageIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/components/providers/auth-provider'
import { useTenant } from '@/components/providers/tenant-provider'
import { clsx } from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void
  tenant: string
}

export function Header({ setSidebarOpen, tenant }: HeaderProps) {
  const { user, logout } = useAuth()
  const { currentTenant, tenants, switchTenant } = useTenant()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  
  // Extract current page name from pathname
  const getPageTitle = () => {
    if (!pathname || pathname === '/') return 'Dashboard';
    
    const pathParts = pathname.split('/');
    if (pathParts.length >= 3) {
      // Remove tenant part and capitalize
      const pageName = pathParts[2].charAt(0).toUpperCase() + pathParts[2].slice(1);
      
      // Handle special cases for better titles
      switch(pageName) {
        case 'Dashboard': return 'Dashboard';
        case 'Clients': return 'Client Management';
        case 'Leads': return 'Lead Management';
        case 'Orders': return 'Order Management';
        case 'Finance': return 'Financial Management';
        case 'Queue': return 'Queue Management System';
        case 'Analytics': return 'Business Analytics';
        case 'Reports': return 'Reporting Center';
        default: return pageName;
      }
    }
    
    return 'Dashboard';
  };

  // Sample notifications for demo
  const notifications = [
    {
      id: 1,
      title: 'New order received',
      description: 'Order #12345 has been placed',
      time: '10 minutes ago',
      type: 'order'
    },
    {
      id: 2,
      title: 'Payment received',
      description: 'Payment of $1,250 received from Client #421',
      time: '2 hours ago',
      type: 'payment'
    },
    {
      id: 3,
      title: 'Lead assigned to you',
      description: 'New lead from website contact form',
      time: '3 hours ago',
      type: 'lead'
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Will implement global search functionality
    console.log('Searching for:', searchQuery);
  };
  
  const handleSwitchTenant = (tenantId: string) => {
    switchTenant(tenantId);
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white/90 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden hover:bg-gray-100 rounded-lg transition-colors"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      {/* Page Title */}
      <div className="flex-1 text-sm">
        <h1 className="font-semibold text-gray-900">
          {getPageTitle()}
        </h1>
        <p className="text-xs text-gray-500 hidden sm:block">
          <span className="capitalize">{tenant}</span> workspace • {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Search - Hidden on mobile */}
      <div className="hidden md:block flex-1 max-w-md">
        <form onSubmit={handleSearch} className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            placeholder="Search clients, orders, invoices..."
          />
        </form>
      </div>

      <div className="flex items-center gap-x-4 lg:gap-x-6">
        {/* Tenant Switcher */}
        <Popover className="relative">
          <Popover.Button className="hidden sm:flex items-center gap-x-1 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-lg px-2 py-1 hover:bg-gray-100 transition-colors">
            <LanguageIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only sm:ml-2 capitalize">
              {tenant}
            </span>
            <ChevronDownIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1 divide-y divide-gray-100">
                <div className="px-4 py-2">
                  <p className="text-xs font-medium text-gray-500">SWITCH WORKSPACE</p>
                </div>
                <div className="py-1">
                  {tenants.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleSwitchTenant(t.id)}
                      className={clsx(
                        t.id === tenant ? 'bg-gray-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50',
                        'flex items-center w-full px-4 py-2 text-sm'
                      )}
                    >
                      <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: t.settings.primaryColor }}></div>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </Popover>

        {/* Help Button */}
        <button
          type="button"
          className="hidden sm:flex -m-2.5 p-2.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span className="sr-only">Help</span>
          <QuestionMarkCircleIcon className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Notifications */}
        <Popover className="relative">
          <Popover.Button className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 relative hover:bg-gray-100 rounded-lg transition-colors">
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">{notifications.length}</span>
            </span>
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1 divide-y divide-gray-100">
                <div className="px-4 py-2 flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-900">Notifications</p>
                  <Link 
                    href={`/${tenant}/notifications`} 
                    className="text-xs font-medium text-blue-600 hover:text-blue-500"
                  >
                    View all
                  </Link>
                </div>
                <div className="py-1 max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                          <div className={clsx(
                            'h-8 w-8 rounded-full flex items-center justify-center',
                            notification.type === 'order' ? 'bg-green-100' : 
                            notification.type === 'payment' ? 'bg-purple-100' : 'bg-blue-100'
                          )}>
                            {notification.type === 'order' && (
                              <ClockIcon className="h-4 w-4 text-green-600" />
                            )}
                            {notification.type === 'payment' && (
                              <CalendarIcon className="h-4 w-4 text-purple-600" />
                            )}
                            {notification.type === 'lead' && (
                              <UserIcon className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {notification.description}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </Popover>

        {/* Separator */}
        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

        {/* Profile dropdown */}
        <Menu as="div" className="relative">
          <Menu.Button className="-m-1.5 flex items-center p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <span className="sr-only">Open user menu</span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'D'}
              </span>
            </div>
            <span className="hidden lg:flex lg:items-center">
              <span className="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                {user?.name || 'Demo User'}
              </span>
              <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2.5 w-56 origin-top-right rounded-lg bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || 'Demo User'}
                </p>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {user?.email || 'demo@example.com'}
                </p>
              </div>
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href={`/${tenant}/settings/profile`}
                      className={clsx(
                        active ? 'bg-gray-50' : '',
                        'flex items-center px-4 py-2 text-sm text-gray-700 w-full'
                      )}
                    >
                      <UserIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                      Your Profile
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href={`/${tenant}/settings`}
                      className={clsx(
                        active ? 'bg-gray-50' : '',
                        'flex items-center px-4 py-2 text-sm text-gray-700 w-full'
                      )}
                    >
                      <CogIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                      Settings
                    </Link>
                  )}
                </Menu.Item>
              </div>
              <div className="py-1 border-t border-gray-100">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => logout()}
                      className={clsx(
                        active ? 'bg-gray-50' : '',
                        'flex items-center px-4 py-2 text-sm text-gray-700 w-full'
                      )}
                    >
                      <ArrowRightOnRectangleIcon 
                        className="mr-3 h-5 w-5 text-gray-400" 
                        aria-hidden="true" 
                      />
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  )
}
