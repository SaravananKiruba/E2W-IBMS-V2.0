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
  UserIcon,
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

  // Customize the active link styles
  const activeLinkClasses = "bg-theme-primary/10 text-theme-primary";
  const inactiveLinkClasses = "text-gray-700 hover:bg-gray-50 hover:text-theme-primary";
  
  // Function to determine if a navigation item is active
  const isActive = (href: string) => {
    const pathWithoutTenant = pathname.replace(`/${tenant}`, '');
    return href === '/' ? pathWithoutTenant === '' : pathWithoutTenant.startsWith(href);
  };

  // Function to render navigation items consistently for both mobile and desktop
  const renderNavItem = (item: NavItem) => {
    // Handle items with children (nested navigation)
    if (item.children) {
      const isExpanded = expandedSections[item.name] || false;
      const hasActiveChild = item.children.some(
        (child) => pathname === `/${tenant}${child.href}`
      );
      const ItemIcon = item.icon;
      
      return (
        <div key={item.name} className="space-y-1">
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
            <div className="mt-1 pl-8 space-y-1">
              {item.children.map((child) => {
                const childHref = `/${tenant}${child.href}`;
                const isActive = pathname === childHref;
                const ChildIcon = child.icon;
                
                return (
                  <div key={child.name}>
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }
    
    // Regular navigation item (no children)
    const href = `/${tenant}${item.href}`;
    const isActive = pathname === href;
    const Icon = item.icon;
    
    return (
      <div key={item.name}>
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
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-xl border-r border-gray-200">
      <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-6">
        <TenantLogo tenant={tenant} />
      </div>
      
      <nav className="flex flex-1 flex-col px-4">
        <div className="space-y-1">
          {navigation.map((item) => renderNavItem(item))}
        </div>
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
            <div className="fixed inset-0 bg-gray-900/80" />
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
                  <div className="absolute top-0 right-0 -mr-12 pt-4">
                    <button
                      type="button"
                      className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                {/* Mobile sidebar content */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white pb-4">
                  <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-6">
                    <TenantLogo tenant={tenant} />
                  </div>
                  <nav className="flex flex-1 flex-col px-4">
                    <div className="space-y-1">
                      {navigation.map((item) => renderNavItem(item))}
                    </div>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white">
          <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-6">
            <TenantLogo tenant={tenant} />
          </div>
          <nav className="flex flex-1 flex-col px-4">
            <div className="space-y-1">
              {navigation.map((item) => renderNavItem(item))}
            </div>
          </nav>
          <div className="p-4 mt-auto">
            <div className="flex items-center gap-3 rounded-md bg-theme-primary/10 p-3">
              <div className="rounded-full bg-theme-primary/20 p-1">
                <UserIcon className="h-5 w-5 text-theme-primary" />
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-gray-500 text-xs truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function TenantLogo({ tenant }: { tenant: string }) {
  return (
    <Link href={`/${tenant}/dashboard`} className="flex items-center">
      <img
        className="h-8 w-auto"
        src={`/icons/icon-72x72.png`}
        alt="IBMS Logo"
      />
      <span className="ml-2 text-xl font-bold bg-gradient-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent">
        IBMS
      </span>
      <span className="ml-1 text-xs bg-theme-tertiary/20 text-theme-tertiary px-1.5 py-0.5 rounded">
        {tenant}
      </span>
    </Link>
  )
}
