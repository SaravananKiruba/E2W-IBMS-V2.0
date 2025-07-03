'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PhoneIcon, 
  ChatBubbleLeftIcon, 
  CalendarIcon, 
  PlusIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { WhatsappIcon } from 'lucide-react'

interface LeadPageProps {
  tenant: string
}

// Lead status types
type LeadStatus = 'new' | 'call-followup' | 'unreachable' | 'unqualified' | 'convert' | 'ready-for-quote'

interface Lead {
  id: string
  name: string
  phone: string
  email: string
  source: string
  status: LeadStatus
  cse: string
  nextFollowup: string
  lastContact: string
  createdAt: string
  notes: string
  probability: number
}

// Mock data for the leads
const mockLeads: Lead[] = [
  {
    id: 'LD001',
    name: 'John Smith',
    phone: '+91 98765 43210',
    email: 'john@example.com',
    source: 'JustDial',
    status: 'new',
    cse: 'Anita Kumar',
    nextFollowup: '2025-07-03',
    lastContact: '2025-07-01',
    createdAt: '2025-07-01',
    notes: 'Interested in newspaper ads',
    probability: 65
  },
  {
    id: 'LD002',
    name: 'Priya Sharma',
    phone: '+91 87654 32109',
    email: 'priya@company.com',
    source: 'IndiaMart',
    status: 'call-followup',
    cse: 'Rajesh Singh',
    nextFollowup: '2025-07-04',
    lastContact: '2025-06-30',
    createdAt: '2025-06-29',
    notes: 'Called about radio campaign',
    probability: 45
  },
  {
    id: 'LD003',
    name: 'Akash Industries',
    phone: '+91 76543 21098',
    email: 'contact@akashindustries.com',
    source: 'Website',
    status: 'ready-for-quote',
    cse: 'Neha Gupta',
    nextFollowup: '2025-07-05',
    lastContact: '2025-07-01',
    createdAt: '2025-06-25',
    notes: 'Ready for TV advertising quote',
    probability: 85
  },
  {
    id: 'LD004',
    name: 'Tech Solutions Ltd.',
    phone: '+91 65432 10987',
    email: 'info@techsolutions.com',
    source: 'Referral',
    status: 'convert',
    cse: 'Vikram Patel',
    nextFollowup: '',
    lastContact: '2025-06-28',
    createdAt: '2025-06-20',
    notes: 'Converted to client, needs onboarding',
    probability: 100
  },
  {
    id: 'LD005',
    name: 'Global Exports',
    phone: '+91 54321 09876',
    email: 'sales@globalexports.com',
    source: 'LG',
    status: 'unreachable',
    cse: 'Anita Kumar',
    nextFollowup: '2025-07-07',
    lastContact: '2025-06-25',
    createdAt: '2025-06-22',
    notes: 'Called multiple times, not reachable',
    probability: 30
  }
]

// Helper function to get status color and label
const getStatusInfo = (status: LeadStatus) => {
  switch (status) {
    case 'new':
      return { color: 'bg-blue-100 text-blue-800', label: 'New Lead' }
    case 'call-followup':
      return { color: 'bg-purple-100 text-purple-800', label: 'Call Followup' }
    case 'unreachable':
      return { color: 'bg-orange-100 text-orange-800', label: 'Unreachable' }
    case 'unqualified':
      return { color: 'bg-red-100 text-red-800', label: 'Unqualified' }
    case 'convert':
      return { color: 'bg-green-100 text-green-800', label: 'Ready to Convert' }
    case 'ready-for-quote':
      return { color: 'bg-indigo-100 text-indigo-800', label: 'Ready for Quote' }
    default:
      return { color: 'bg-gray-100 text-gray-800', label: 'Unknown' }
  }
}

export function LeadsPage({ tenant }: LeadPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | 'all'>('all')
  const [selectedCSE, setSelectedCSE] = useState<string | 'all'>('all')
  const [dateFilter, setDateFilter] = useState<string>('')
  
  // Filter leads based on filters
  const filteredLeads = mockLeads.filter(lead => {
    // Text search filter
    const matchesSearch = searchQuery === '' || 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Status filter
    const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus
    
    // CSE filter
    const matchesCSE = selectedCSE === 'all' || lead.cse === selectedCSE
    
    // Date filter (simplified - in real implementation would handle date parsing)
    const matchesDate = dateFilter === '' || lead.nextFollowup.includes(dateFilter) || lead.createdAt.includes(dateFilter)
    
    return matchesSearch && matchesStatus && matchesCSE && matchesDate
  })
  
  // Get unique CSEs for the filter
  const uniqueCSEs = Array.from(new Set(mockLeads.map(lead => lead.cse)))
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Manager</h1>
          <p className="text-gray-500 mt-1">Manage and track potential client leads</p>
        </div>
        <Button 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add New Lead</span>
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as LeadStatus | 'all')}
                className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="new">New Leads</option>
                <option value="call-followup">Call Followup</option>
                <option value="unreachable">Unreachable</option>
                <option value="unqualified">Unqualified</option>
                <option value="convert">Ready to Convert</option>
                <option value="ready-for-quote">Ready for Quote</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <FunnelIcon className="h-4 w-4" />
              </div>
            </div>
            
            {/* CSE Filter */}
            <div className="relative">
              <select
                value={selectedCSE}
                onChange={(e) => setSelectedCSE(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All CSE</option>
                {uniqueCSEs.map(cse => (
                  <option key={cse} value={cse}>{cse}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
            
            {/* Date Filter */}
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Leads List */}
      <div className="space-y-4">
        {filteredLeads.length > 0 ? (
          filteredLeads.map(lead => {
            const statusInfo = getStatusInfo(lead.status)
            
            return (
              <Card key={lead.id} className="overflow-hidden hover:border-blue-300 transition-colors">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                    {/* Lead Info */}
                    <div className="p-4 md:p-5">
                      <div className="flex justify-between">
                        <Badge className="mb-2">{lead.id}</Badge>
                        <Badge className={`${statusInfo.color} border-none`}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-lg text-gray-900 mb-1">{lead.name}</h3>
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center gap-2 text-gray-600">
                          <PhoneIcon className="h-4 w-4" />
                          {lead.phone}
                        </p>
                        <p className="flex items-center gap-2 text-gray-600">
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          {lead.email}
                        </p>
                        <p className="flex items-center gap-2 text-gray-600">
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Details */}
                    <div className="p-4 md:p-5">
                      <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-1">
                          <span className="text-gray-600">Source:</span>
                          <span className="font-medium">{lead.source}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <span className="text-gray-600">CSE:</span>
                          <span className="font-medium">{lead.cse}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <span className="text-gray-600">Last Contact:</span>
                          <span className="font-medium">{new Date(lead.lastContact).toLocaleDateString()}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <span className="text-gray-600">Conversion:</span>
                          <span className="font-medium text-green-600">{lead.probability}%</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Notes & Follow-up */}
                    <div className="p-4 md:p-5 space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{lead.notes}</p>
                      </div>
                      
                      {lead.nextFollowup && (
                        <div className="flex items-center gap-2 text-sm bg-amber-50 p-2 rounded-lg border border-amber-100">
                          <ClockIcon className="h-4 w-4 text-amber-500" />
                          <span>Next Follow-up: {new Date(lead.nextFollowup).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="p-4 md:p-5 flex flex-col justify-between">
                      <h4 className="font-medium text-gray-900 mb-2">Actions</h4>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <PhoneIcon className="h-4 w-4" />
                          <span>Call</span>
                        </Button>
                        <Button size="sm" variant="outline" className="flex items-center gap-1 text-green-600 hover:text-green-700">
                          <WhatsappIcon className="h-4 w-4" />
                          <span>WhatsApp</span>
                        </Button>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <ChatBubbleLeftIcon className="h-4 w-4" />
                          <span>SMS</span>
                        </Button>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>Schedule</span>
                        </Button>
                      </div>
                      
                      <div className="mt-3 flex justify-end">
                        <Button className="bg-blue-600 hover:bg-blue-700">Update Status</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <ExclamationCircleIcon className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No leads found</h3>
              <p className="mt-1 text-gray-500">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Pagination - Simplified */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredLeads.length}</span> of{' '}
          <span className="font-medium">{filteredLeads.length}</span> leads
        </p>
        <div className="flex gap-2">
          <Button variant="outline" disabled>Previous</Button>
          <Button variant="outline" disabled>Next</Button>
        </div>
      </div>
    </div>
  )
}
