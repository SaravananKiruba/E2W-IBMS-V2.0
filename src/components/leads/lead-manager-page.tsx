'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Phone, MessageSquare, Mail, Calendar, User, 
  Search, Filter, Plus, Download, Eye, Edit, Trash2,
  Clock, TrendingUp, Users, Target, Star
} from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { LeadForm } from '@/components/leads/lead-form'
import { LeadDetails } from '@/components/leads/lead-details'
import { useLeads } from '@/hooks/use-leads'

interface Lead {
  id: string
  leadId: string
  entryDate: string
  prospect: string
  contactPerson: string
  contactNumber: string
  email: string
  address: string
  source: string
  consultant: string
  status: 'new' | 'call_followup' | 'unreachable' | 'unqualified' | 'convert' | 'ready_for_quote'
  priority: 'low' | 'medium' | 'high'
  followupDate?: string
  followupTime?: string
  quoteSent: boolean
  territory: string
  leadScore: number
  lastActivity: string
  notes: string
  conversionProbability: number
}

const mockLeads: Lead[] = [
  {
    id: '1',
    leadId: 'LD-2025-001',
    entryDate: '2025-01-15',
    prospect: 'Acme Corporation',
    contactPerson: 'John Smith',
    contactNumber: '+91 9876543210',
    email: 'john@acme.com',
    address: 'Mumbai, Maharashtra',
    source: 'JustDial',
    consultant: 'Raj Kumar',
    status: 'call_followup',
    priority: 'high',
    followupDate: '2025-01-20',
    followupTime: '10:00 AM',
    quoteSent: true,
    territory: 'West',
    leadScore: 85,
    lastActivity: '2025-01-18',
    notes: 'Interested in newspaper advertising',
    conversionProbability: 75
  },
  {
    id: '2',
    leadId: 'LD-2025-002',
    entryDate: '2025-01-16',
    prospect: 'Tech Solutions Ltd',
    contactPerson: 'Sarah Wilson',
    contactNumber: '+91 9876543211',
    email: 'sarah@techsol.com',
    address: 'Delhi, Delhi',
    source: 'IndiaMart',
    consultant: 'Priya Sharma',
    status: 'ready_for_quote',
    priority: 'medium',
    followupDate: '2025-01-22',
    followupTime: '2:00 PM',
    quoteSent: false,
    territory: 'North',
    leadScore: 72,
    lastActivity: '2025-01-17',
    notes: 'Looking for digital advertising solutions',
    conversionProbability: 60
  }
]

export function LeadManagerPage() {
  const params = useParams()
  const tenant = params.tenant as string
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [consultantFilter, setConsultantFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  // Mock data for now - replace with actual API calls
  const leads = mockLeads
  const isLoading = false
  const error = null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'call_followup': return 'bg-yellow-100 text-yellow-800'
      case 'unreachable': return 'bg-red-100 text-red-800'
      case 'unqualified': return 'bg-gray-100 text-gray-800'
      case 'convert': return 'bg-green-100 text-green-800'
      case 'ready_for_quote': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCreateLead = async (data: any) => {
    // Implement lead creation logic
    console.log('Creating lead:', data)
    setIsCreateDialogOpen(false)
  }

  const handleUpdateLead = async (data: any) => {
    // Implement lead update logic
    console.log('Updating lead:', data)
    setIsEditDialogOpen(false)
  }

  const handleDeleteLead = async (lead: Lead) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      // Implement lead deletion logic
      console.log('Deleting lead:', lead.id)
    }
  }

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead)
    setIsDetailsDialogOpen(true)
  }

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead)
    setIsEditDialogOpen(true)
  }

  // Table columns configuration
  const columns = [
    {
      accessorKey: 'leadId',
      header: 'Lead ID',
      cell: ({ row }: any) => {
        const lead = row.original as Lead
        return (
          <div className="font-medium">
            <div className="text-sm text-gray-900">{lead.leadId}</div>
            <div className="text-xs text-gray-500">{formatDate(lead.entryDate)}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'prospect',
      header: 'Prospect',
      cell: ({ row }: any) => {
        const lead = row.original as Lead
        return (
          <div>
            <div className="font-medium text-gray-900">{lead.prospect}</div>
            <div className="text-sm text-gray-500">{lead.contactPerson}</div>
            <div className="text-xs text-gray-500">{lead.contactNumber}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ row }: any) => {
        const lead = row.original as Lead
        return (
          <div>
            <div className="text-sm text-gray-900">{lead.source}</div>
            <div className="text-xs text-gray-500">{lead.consultant}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const lead = row.original as Lead
        return (
          <div className="space-y-1">
            <Badge className={getStatusColor(lead.status)}>
              {lead.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge className={getPriorityColor(lead.priority)}>
              {lead.priority.toUpperCase()}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: 'leadScore',
      header: 'Score',
      cell: ({ row }: any) => {
        const lead = row.original as Lead
        return (
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{lead.leadScore}</div>
            <div className="text-xs text-gray-500">{lead.conversionProbability}% conv.</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'followup',
      header: 'Next Follow-up',
      cell: ({ row }: any) => {
        const lead = row.original as Lead
        return lead.followupDate ? (
          <div>
            <div className="text-sm text-gray-900">{formatDate(lead.followupDate)}</div>
            <div className="text-xs text-gray-500">{lead.followupTime}</div>
          </div>
        ) : (
          <span className="text-gray-400">Not set</span>
        )
      },
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const lead = row.original as Lead
        return (
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewLead(lead)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditLead(lead)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Call lead
                window.open(`tel:${lead.contactNumber}`)
              }}
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // WhatsApp
                window.open(`https://wa.me/${lead.contactNumber.replace(/[^0-9]/g, '')}`)
              }}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">Failed to load leads</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-600">Track and manage your sales leads effectively</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
              </DialogHeader>
              <LeadForm
                onSubmit={handleCreateLead}
                isLoading={false}
                tenant={tenant}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5%</div>
            <p className="text-xs text-muted-foreground">
              +2.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">567</div>
            <p className="text-xs text-muted-foreground">
              Ready for follow-up
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Lead Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.2</div>
            <p className="text-xs text-muted-foreground">
              Quality indicator
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Lead List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              {/* Search */}
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search leads by company, person, or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="call_followup">Call Follow-up</SelectItem>
                  <SelectItem value="unreachable">Unreachable</SelectItem>
                  <SelectItem value="unqualified">Unqualified</SelectItem>
                  <SelectItem value="convert">Convert</SelectItem>
                  <SelectItem value="ready_for_quote">Ready for Quote</SelectItem>
                </SelectContent>
              </Select>

              {/* Source Filter */}
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="JustDial">JustDial</SelectItem>
                  <SelectItem value="IndiaMart">IndiaMart</SelectItem>
                  <SelectItem value="Sulekha">Sulekha</SelectItem>
                  <SelectItem value="Direct">Direct</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <DataTable
            columns={columns}
            data={leads}
          />
        </CardContent>
      </Card>

      {/* Lead Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <LeadDetails
              lead={selectedLead}
              onClose={() => setIsDetailsDialogOpen(false)}
              onEdit={() => {
                setIsDetailsDialogOpen(false)
                setIsEditDialogOpen(true)
              }}
              onDelete={() => handleDeleteLead(selectedLead)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Lead Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <LeadForm
              initialData={selectedLead}
              onSubmit={handleUpdateLead}
              isLoading={false}
              tenant={tenant}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
