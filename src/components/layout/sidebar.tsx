'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import {
  HomeIcon,
  UsersIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  CalendarIcon,
  UserGroupIcon,
  QueueListIcon,
  PhoneIcon,
  BellIcon,
  DocumentDuplicateIcon,
  ArrowTrendingUpIcon,
  PresentationChartBarIcon,
  ClipboardDocumentCheckIcon,
  DocumentChartBarIcon,
  ArchiveBoxIcon,
  WrenchScrewdriverIcon,
  EnvelopeIcon,
  CloudArrowUpIcon,
  BuildingOfficeIcon,
  InboxIcon,
  ChatBubbleLeftEllipsisIcon,
  LockClosedIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { useAuth } from '@/components/providers/auth-provider'

// Define navigation item types with proper TypeScript interfaces
interface NavItemBase {
  name: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
}

interface NavItemWithHref extends NavItemBase {
  href: string;
  children?: undefined;
  badge?: string;
  badgeColor?: string;
}

interface NavItemWithChildren extends NavItemBase {
  href?: undefined;
  children: NavItemWithHref[];
}

type NavItem = NavItemWithHref | NavItemWithChildren;

// Complete navigation definition with all modules and features
const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { 
    name: 'Client Management', 
    icon: UsersIcon,
    children: [
      { name: 'Clients', href: '/clients', icon: UsersIcon },
      { name: 'Leads', href: '/leads', icon: UserPlusIcon },
      { name: 'Client Documents', href: '/documents/clients', icon: DocumentTextIcon },
    ]
  },
  { 
    name: 'Orders & Quotes', 
    icon: ShoppingCartIcon,
    children: [
      { name: 'Orders', href: '/orders', icon: ShoppingCartIcon },
      { name: 'Quotations', href: '/orders/quotes', icon: ClipboardDocumentCheckIcon },
      { name: 'Ad Details', href: '/adDetails', icon: DocumentDuplicateIcon },
      { name: 'Rate Cards', href: '/rates', icon: ArrowTrendingUpIcon, badge: 'New' },
      { name: 'Order Status', href: '/orders/status', icon: ArchiveBoxIcon },
    ]
  },
  { 
    name: 'Finance', 
    icon: CurrencyDollarIcon,
    children: [
      { name: 'Transactions', href: '/finance', icon: CurrencyDollarIcon },
      { name: 'Invoices', href: '/finance/invoices', icon: DocumentChartBarIcon },
      { name: 'Receipts', href: '/finance/receipts', icon: ReceiptPercentIcon },
      { name: 'Reports', href: '/reports', icon: DocumentTextIcon },
      { name: 'Expenses', href: '/finance/expenses', icon: ArchiveBoxIcon },
    ]
  },
  { 
    name: 'Resources', 
    icon: UserGroupIcon,
    children: [
      { name: 'Employees', href: '/employees', icon: UserGroupIcon },
      { name: 'Consultants', href: '/consultants', icon: BuildingOfficeIcon },
      { name: 'Appointments', href: '/appointments', icon: CalendarIcon },
    ]
  },
  { name: 'Queue System', href: '/queue', icon: QueueListIcon, badge: 'Active' },
  { name: 'Analytics', href: '/analytics', icon: PresentationChartBarIcon },
  { 
    name: 'Communications', 
    icon: PhoneIcon,
    children: [
      { name: 'Channels', href: '/communications', icon: PhoneIcon },
      { name: 'Email Templates', href: '/communications/email', icon: EnvelopeIcon },
      { name: 'SMS Templates', href: '/communications/sms', icon: ChatBubbleLeftEllipsisIcon },
      { name: 'Message History', href: '/communications/history', icon: InboxIcon },
    ]
  },
  { name: 'Notifications', href: '/notifications', icon: BellIcon },
  { 
    name: 'Security', 
    icon: ShieldCheckIcon,
    children: [
      { name: 'User Access', href: '/security', icon: ShieldCheckIcon },
      { name: 'Permissions', href: '/security/permissions', icon: LockClosedIcon },
      { name: 'Audit Logs', href: '/security/logs', icon: ClipboardDocumentCheckIcon },
    ]
  },
  { 
    name: 'System', 
    icon: CogIcon,
    children: [
      { name: 'Settings', href: '/settings', icon: CogIcon },
      { name: 'Backups', href: '/settings/backups', icon: CloudArrowUpIcon },
      { name: 'Maintenance', href: '/settings/maintenance', icon: WrenchScrewdriverIcon },
    ]
  },
];

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  tenant: string;
}

export function Sidebar({ open, setOpen, tenant }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  // State to track expanded navigation sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  // Initialize expanded sections based on current path
  useEffect(() => {
    const newExpandedSections: Record<string, boolean> = {};
    
    navigation.forEach((item) => {
      if (item.children) {
        // Check if any child matches the current path
        const hasActiveChild = item.children.some(
          (child) => pathname === `/${tenant}${child.href}`
        );
        
        if (hasActiveChild) {
          newExpandedSections[item.name] = true;
        }
      }
    });
    
    setExpandedSections(newExpandedSections);
  }, [pathname, tenant]);

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const sidebarContent = (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-xl border-r border-gray-200">
      <div className="flex h-16 shrink-0 items-center border-b border-gray-100 -mx-6 px-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {tenant?.charAt(0)?.toUpperCase() || 'I'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              IBMS
            </h2>
            <p className="text-xs text-gray-500 capitalize">{tenant} Workspace</p>
          </div>
        </div>
      </div>
      
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                // Handle items with children (nested navigation)
                if (item.children) {
                  const isExpanded = expandedSections[item.name] || false;
                  const hasActiveChild = item.children.some(
                    (child) => pathname === `/${tenant}${child.href}`
                  );
                  const ItemIcon = item.icon;
                  
                  return (
                    <li key={item.name} className="space-y-1">
                      <button
                        onClick={() => toggleSection(item.name)}
                        className={clsx(
                          hasActiveChild
                            ? 'bg-blue-50/70 text-blue-700'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50/50',
                          'group flex w-full items-center justify-between gap-x-3 rounded-l-lg p-3 text-sm leading-6 font-medium transition-all duration-200'
                        )}
                      >
                        <div className="flex items-center gap-x-3">
                          <ItemIcon
                            className={clsx(
                              hasActiveChild ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600',
                              'h-5 w-5 shrink-0 transition-colors duration-200'
                            )}
                            aria-hidden="true"
                          />
                          <span className="truncate">{item.name}</span>
                        </div>
                        <svg 
                          className={clsx(
                            "h-5 w-5 transition-transform duration-200",
                            isExpanded ? "transform rotate-90" : ""
                          )}
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Nested navigation items */}
                      {isExpanded && (
                        <ul className="mt-1 pl-8 space-y-1">
                          {item.children.map((child) => {
                            const childHref = `/${tenant}${child.href}`;
                            const isActive = pathname === childHref;
                            const ChildIcon = child.icon;
                            
                            return (
                              <li key={child.name}>
                                <Link
                                  href={childHref}
                                  className={clsx(
                                    isActive
                                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50',
                                    'group flex gap-x-3 rounded-l-lg p-2 text-sm leading-6 font-medium transition-all duration-200'
                                  )}
                                  onClick={() => setOpen(false)}
                                >
                                  <ChildIcon
                                    className={clsx(
                                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600',
                                      'h-5 w-5 shrink-0 transition-colors duration-200'
                                    )}
                                    aria-hidden="true"
                                  />
                                  <span className="flex-1">{child.name}</span>
                                  
                                  {/* Badge for new or active features */}
                                  {child.badge && (
                                    <span className={clsx(
                                      'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                                      child.badge === 'New' ? 'bg-green-100 text-green-800' :
                                      child.badge === 'Active' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    )}>
                                      {child.badge}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }
                
                // Regular navigation item (no children)
                const href = `/${tenant}${item.href}`;
                const isActive = pathname === href;
                const Icon = item.icon;
                
                return (
                  <li key={item.name}>
                    <Link
                      href={href}
                      className={clsx(
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50/50',
                        'group flex items-center justify-between gap-x-3 rounded-l-lg p-3 text-sm leading-6 font-medium transition-all duration-200'
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex items-center gap-x-3">
                        <Icon
                          className={clsx(
                            isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600',
                            'h-5 w-5 shrink-0 transition-colors duration-200'
                          )}
                          aria-hidden="true"
                        />
                        <span>{item.name}</span>
                      </div>
                      
                      {/* Badge for new or active features */}
                      {item.badge && (
                        <span className={clsx(
                          'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                          item.badge === 'New' ? 'bg-green-100 text-green-800' :
                          item.badge === 'Active' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
          
          {/* User profile footer */}
          <li className="mt-auto">
            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-blue-700">
                    {user?.name?.charAt(0)?.toUpperCase() || 'D'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'Demo User'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role || 'Administrator'}
                  </p>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button 
                      type="button" 
                      className="-m-2.5 p-2.5 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors" 
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                {sidebarContent}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        {sidebarContent}
      </div>
    </>
  )
}
