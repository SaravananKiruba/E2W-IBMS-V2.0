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
        case 'Appointments': return 'Appointments';
        case 'Analytics': return 'Analytics & Reporting';
        case 'Communications': return 'Communications';
        case 'Settings': return 'System Settings';
        case 'Security': return 'Security & Access Control';
        default: return pageName;
      }
    }
    return 'Dashboard';
  };
  
  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left section: Mobile menu button and search */}
          <div className="flex items-center gap-x-4">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            
            {/* Page title for larger screens */}
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-gray-900">
                {getPageTitle()}
              </h1>
            </div>
          </div>
          
          {/* Center section: Search bar */}
          <div className="flex flex-1 justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="w-full max-w-md lg:max-w-xs">
              <label htmlFor="search" className="sr-only">Search</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-theme-primary sm:text-sm sm:leading-6"
                  placeholder="Search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Right section: User menu, notifications, etc. */}
          <div className="flex items-center gap-x-4">
            {/* Tenant Selector */}
            {tenants && tenants.length > 1 && (
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="inline-flex w-full justify-center items-center gap-x-1 rounded-md bg-white px-2 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    <span className="hidden sm:inline-block">{currentTenant?.name || tenant}</span>
                    <span className="sm:hidden">{currentTenant?.subdomain || tenant}</span>
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </Menu.Button>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {tenants.map((t) => (
                        <Menu.Item key={t.subdomain}>
                          {({ active }) => (
                            <a
                              href="#"
                              onClick={() => switchTenant(t.subdomain)}
                              className={clsx(
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'flex items-center px-4 py-2 text-sm'
                              )}
                            >
                              <span 
                                className={clsx(
                                  'mr-2 h-2 w-2 rounded-full',
                                  t.subdomain === (currentTenant?.subdomain || tenant) ? 'bg-theme-primary' : 'bg-gray-300'
                                )}
                              />
                              {t.name}
                              <span className="ml-auto text-xs text-gray-500">
                                {t.subdomain}
                              </span>
                            </a>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}
            
            {/* Notifications */}
            <Popover className="relative">
              <Popover.Button className="inline-flex items-center justify-center rounded-full bg-white p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-theme-primary">
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-theme-secondary ring-2 ring-white" />
              </Popover.Button>
            </Popover>

            {/* Profile dropdown */}
            <Menu as="div" className="relative">
              <div>
                <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary">
                  <span className="sr-only">Open user menu</span>
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-theme-primary to-theme-secondary flex items-center justify-center text-white font-medium">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                  </div>
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-3">
                    <p className="text-sm">Signed in as</p>
                    <p className="truncate text-sm font-medium text-gray-900">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href={`/${tenant}/settings/profile`}
                          className={clsx(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'flex items-center px-4 py-2 text-sm'
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
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'flex items-center px-4 py-2 text-sm'
                          )}
                        >
                          <CogIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                          Settings
                        </Link>
                      )}
                    </Menu.Item>
                  </div>
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={clsx(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'flex w-full items-center px-4 py-2 text-sm'
                          )}
                        >
                          <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
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
      </div>
    </header>
  )
}
