'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  UserCheck, Plus, Search, Filter, Edit, Trash2, MoreHorizontal, 
  Mail, Phone, MapPin, Calendar, Building, User, TrendingUp,
  Download, Eye, Star, Award, Target, DollarSign,
  MessageSquare, Send, Users, BarChart3, Clock
} from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Consultant {
  id: string
  consultantId: string
  name: string
  email: string
  phone: string
  territory: string
  status: 'active' | 'inactive' | 'suspended'
  joinDate: string
  specialization: string[]
  performance: {
    totalClients: number
    activeClients: number
    totalRevenue: number
    conversionRate: number
    avgDealSize: number
    rating: number
  }
  commission: {
    percentage: number
    totalEarned: number
    pending: number
    paid: number
  }
  targets: {
    monthly: number
    achieved: number
    remaining: number
  }
  lastActivity: string
  address: string
  documents: {
    aadhar: boolean
    pan: boolean
    agreement: boolean
  }
  bankDetails: {
    accountNumber: string
    ifsc: string
    bankName: string
  }
}

interface ConsultantManagerPageProps {
  tenant: string
}

const mockConsultants: Consultant[] = [
  {
    id: '1',
    consultantId: 'CONS001',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@consultant.com',
    phone: '+91 9876543210',
    territory: 'Bangalore Central',
    status: 'active',
    joinDate: '2023-01-15',
    specialization: ['Print Media', 'Digital Marketing', 'Radio'],
    performance: {
      totalClients: 45,
      activeClients: 32,
      totalRevenue: 2500000,
      conversionRate: 68,
      avgDealSize: 55000,
      rating: 4.5
    },
    commission: {
      percentage: 8,
      totalEarned: 200000,
      pending: 45000,
      paid: 155000
    },
    targets: {
      monthly: 300000,
      achieved: 245000,
      remaining: 55000
    },
    lastActivity: '2025-01-20T14:30:00Z',
    address: '123 MG Road, Bangalore',
    documents: {
      aadhar: true,
      pan: true,
      agreement: true
    },
    bankDetails: {
      accountNumber: '****1234',
      ifsc: 'HDFC0001234',
      bankName: 'HDFC Bank'
    }
  },
  {
    id: '2',
    consultantId: 'CONS002',
    name: 'Priya Sharma',
    email: 'priya.sharma@consultant.com',
    phone: '+91 9876543211',
    territory: 'Mumbai South',
    status: 'active',
    joinDate: '2022-06-20',
    specialization: ['Television', 'Digital Marketing'],
    performance: {
      totalClients: 38,
      activeClients: 28,
      totalRevenue: 1800000,
      conversionRate: 72,
      avgDealSize: 47000,
      rating: 4.7
    },
    commission: {
      percentage: 10,
      totalEarned: 180000,
      pending: 32000,
      paid: 148000
    },
    targets: {
      monthly: 250000,
      achieved: 198000,
      remaining: 52000
    },
    lastActivity: '2025-01-20T16:45:00Z',
    address: '456 Andheri West, Mumbai',
    documents: {
      aadhar: true,
      pan: true,
      agreement: true
    },
    bankDetails: {
      accountNumber: '****5678',
      ifsc: 'ICICI0005678',
      bankName: 'ICICI Bank'
    }
  },
  {
    id: '3',
    consultantId: 'CONS003',
    name: 'Amit Patel',
    email: 'amit.patel@consultant.com',
    phone: '+91 9876543212',
    territory: 'Delhi NCR',
    status: 'active',
    joinDate: '2023-03-10',
    specialization: ['Print Media', 'Outdoor'],
    performance: {
      totalClients: 22,
      activeClients: 18,
      totalRevenue: 950000,
      conversionRate: 58,
      avgDealSize: 43000,
      rating: 3.9
    },
    commission: {
      percentage: 6,
      totalEarned: 57000,
      pending: 18000,
      paid: 39000
    },
    targets: {
      monthly: 150000,
      achieved: 89000,
      remaining: 61000
    },
    lastActivity: '2025-01-20T11:20:00Z',
    address: '789 Connaught Place, Delhi',
    documents: {
      aadhar: true,
      pan: false,
      agreement: true
    },
    bankDetails: {
      accountNumber: '****9012',
      ifsc: 'SBI0009012',
      bankName: 'State Bank of India'
    }
  }
]

const territories = ['All', 'Bangalore Central', 'Mumbai South', 'Delhi NCR', 'Chennai Central', 'Pune West', 'Hyderabad']
const specializations = ['Print Media', 'Television', 'Radio', 'Digital Marketing', 'Outdoor', 'Cinema']

export function ConsultantManagerPage({ tenant }: ConsultantManagerPageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [territoryFilter, setTerritoryFilter] = useState('All')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null)
  const [consultants] = useState<Consultant[]>(mockConsultants)

  const [newConsultant, setNewConsultant] = useState({
    name: '',
    email: '',
    phone: '',
    territory: '',
    specialization: [] as string[],
    commissionPercentage: 0,
    monthlyTarget: 0,
    address: '',
    aadharNumber: '',
    panNumber: '',
    bankAccountNumber: '',
    ifscCode: '',
    bankName: ''
  })

  // Filter consultants
  const filteredConsultants = consultants.filter(consultant => {
    const matchesSearch = 
      consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.consultantId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.territory.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || consultant.status === statusFilter
    const matchesTerritory = territoryFilter === 'All' || consultant.territory === territoryFilter
    
    return matchesSearch && matchesStatus && matchesTerritory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCreateConsultant = () => {
    console.log('Creating consultant:', newConsultant)
    setIsCreateDialogOpen(false)
    setNewConsultant({
      name: '',
      email: '',
      phone: '',
      territory: '',
      specialization: [],
      commissionPercentage: 0,
      monthlyTarget: 0,
      address: '',
      aadharNumber: '',
      panNumber: '',
      bankAccountNumber: '',
      ifscCode: '',
      bankName: ''
    })
  }

  const handleViewDetails = (consultant: Consultant) => {
    setSelectedConsultant(consultant)
    setIsDetailsDialogOpen(true)
  }

  const handleSendNotification = (consultantId: string, type: string) => {
    console.log('Sending notification:', consultantId, type)
  }

  // Table columns configuration
  const columns = [
    {
      accessorKey: 'consultant',
      header: 'Consultant',
      cell: ({ row }: any) => {
        const consultant = row.original as Consultant
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {consultant.name.split(' ').map(n => n.charAt(0)).join('')}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{consultant.name}</div>
              <div className="text-sm text-gray-500">{consultant.consultantId}</div>
              <div className="text-xs text-gray-500">{consultant.territory}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
      cell: ({ row }: any) => {
        const consultant = row.original as Consultant
        return (
          <div className="space-y-1">
            <div className="flex items-center text-sm">
              <Phone className="h-3 w-3 mr-1 text-gray-400" />
              {consultant.phone}
            </div>
            <div className="flex items-center text-sm">
              <Mail className="h-3 w-3 mr-1 text-gray-400" />
              {consultant.email}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'performance',
      header: 'Performance',
      cell: ({ row }: any) => {
        const consultant = row.original as Consultant
        return (
          <div className="space-y-1">
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1 text-blue-500" />
              <span className="text-sm">{consultant.performance.totalClients} clients</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-sm">{formatCurrency(consultant.performance.totalRevenue)}</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-purple-500" />
              <span className="text-sm">{consultant.performance.conversionRate}% conv.</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'commission',
      header: 'Commission',
      cell: ({ row }: any) => {
        const consultant = row.original as Consultant
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium">{consultant.commission.percentage}%</div>
            <div className="text-xs text-green-600">
              Earned: {formatCurrency(consultant.commission.totalEarned)}
            </div>
            <div className="text-xs text-orange-600">
              Pending: {formatCurrency(consultant.commission.pending)}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'targets',
      header: 'Monthly Target',
      cell: ({ row }: any) => {
        const consultant = row.original as Consultant
        const percentage = Math.round((consultant.targets.achieved / consultant.targets.monthly) * 100)
        return (
          <div className="space-y-2">
            <div className="text-sm">
              {formatCurrency(consultant.targets.achieved)} / {formatCurrency(consultant.targets.monthly)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${percentage >= 100 ? 'bg-green-600' : percentage >= 70 ? 'bg-yellow-600' : 'bg-red-600'}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500">{percentage}% achieved</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const consultant = row.original as Consultant
        return (
          <div className="space-y-1">
            <Badge className={getStatusColor(consultant.status)}>
              {consultant.status.toUpperCase()}
            </Badge>
            <div className="flex items-center">
              <Star className="h-3 w-3 mr-1 text-yellow-500" />
              <span className="text-xs">{consultant.performance.rating}/5</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const consultant = row.original as Consultant
        return (
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewDetails(consultant)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSendNotification(consultant.id, 'sms')}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`mailto:${consultant.email}`)}
            >
              <Mail className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`tel:${consultant.phone}`)}
            >
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  const totalConsultants = consultants.length
  const activeConsultants = consultants.filter(c => c.status === 'active').length
  const totalRevenue = consultants.reduce((sum, c) => sum + c.performance.totalRevenue, 0)
  const avgPerformance = consultants.reduce((sum, c) => sum + c.performance.rating, 0) / consultants.length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultant Manager</h1>
          <p className="text-gray-600">Manage consultants and track their performance</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Bulk SMS
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Consultant
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheck className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Consultants</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalConsultants}</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                  <dd className="text-lg font-medium text-gray-900">{activeConsultants}</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(totalRevenue)}</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Rating</dt>
                  <dd className="text-lg font-medium text-gray-900">{avgPerformance.toFixed(1)}/5</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search consultants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Select value={territoryFilter} onValueChange={setTerritoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {territories.map(territory => (
                    <SelectItem key={territory} value={territory}>{territory}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultants Table */}
      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={filteredConsultants}
            searchKey="name"
            searchPlaceholder="Search consultants..."
          />
        </CardContent>
      </Card>

      {/* Create Consultant Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Consultant</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <Input
                    value={newConsultant.name}
                    onChange={(e) => setNewConsultant({...newConsultant, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <Input
                    type="email"
                    value={newConsultant.email}
                    onChange={(e) => setNewConsultant({...newConsultant, email: e.target.value})}
                    placeholder="consultant@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone *</label>
                  <Input
                    value={newConsultant.phone}
                    onChange={(e) => setNewConsultant({...newConsultant, phone: e.target.value})}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Territory *</label>
                  <Select 
                    value={newConsultant.territory} 
                    onValueChange={(value) => setNewConsultant({...newConsultant, territory: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select territory" />
                    </SelectTrigger>
                    <SelectContent>
                      {territories.filter(t => t !== 'All').map(territory => (
                        <SelectItem key={territory} value={territory}>{territory}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <Textarea
                  value={newConsultant.address}
                  onChange={(e) => setNewConsultant({...newConsultant, address: e.target.value})}
                  placeholder="Complete address"
                  rows={3}
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professional Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Commission Percentage *</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={newConsultant.commissionPercentage}
                    onChange={(e) => setNewConsultant({...newConsultant, commissionPercentage: Number(e.target.value)})}
                    placeholder="8"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Monthly Target *</label>
                  <Input
                    type="number"
                    value={newConsultant.monthlyTarget}
                    onChange={(e) => setNewConsultant({...newConsultant, monthlyTarget: Number(e.target.value)})}
                    placeholder="300000"
                  />
                </div>
              </div>
            </div>

            {/* Document Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Documents & Banking</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Aadhar Number</label>
                  <Input
                    value={newConsultant.aadharNumber}
                    onChange={(e) => setNewConsultant({...newConsultant, aadharNumber: e.target.value})}
                    placeholder="XXXX XXXX XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">PAN Number</label>
                  <Input
                    value={newConsultant.panNumber}
                    onChange={(e) => setNewConsultant({...newConsultant, panNumber: e.target.value})}
                    placeholder="ABCDE1234F"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bank Account Number</label>
                  <Input
                    value={newConsultant.bankAccountNumber}
                    onChange={(e) => setNewConsultant({...newConsultant, bankAccountNumber: e.target.value})}
                    placeholder="Account number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">IFSC Code</label>
                  <Input
                    value={newConsultant.ifscCode}
                    onChange={(e) => setNewConsultant({...newConsultant, ifscCode: e.target.value})}
                    placeholder="HDFC0001234"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Bank Name</label>
                  <Input
                    value={newConsultant.bankName}
                    onChange={(e) => setNewConsultant({...newConsultant, bankName: e.target.value})}
                    placeholder="Bank name"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateConsultant}>
                Create Consultant
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Consultant Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Consultant Details</DialogTitle>
          </DialogHeader>
          {selectedConsultant && (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="commission">Commission</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Personal Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="text-sm">{selectedConsultant.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Consultant ID</label>
                        <p className="text-sm">{selectedConsultant.consultantId}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm">{selectedConsultant.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-sm">{selectedConsultant.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Territory</label>
                        <p className="text-sm">{selectedConsultant.territory}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <p className="text-sm">{selectedConsultant.address}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Professional Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Join Date</label>
                        <p className="text-sm">{formatDate(selectedConsultant.joinDate)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <Badge className={getStatusColor(selectedConsultant.status)}>
                          {selectedConsultant.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Specialization</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedConsultant.specialization.map((spec, index) => (
                            <Badge key={index} variant="outline">{spec}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Last Activity</label>
                        <p className="text-sm">{formatDate(selectedConsultant.lastActivity)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Clients
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total</span>
                          <span className="font-medium">{selectedConsultant.performance.totalClients}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active</span>
                          <span className="font-medium">{selectedConsultant.performance.activeClients}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Revenue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">
                          {formatCurrency(selectedConsultant.performance.totalRevenue)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Avg: {formatCurrency(selectedConsultant.performance.avgDealSize)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Conversion
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">
                          {selectedConsultant.performance.conversionRate}%
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          <span className="text-sm">{selectedConsultant.performance.rating}/5</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Monthly Target Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2" />
                      Monthly Target Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Target: {formatCurrency(selectedConsultant.targets.monthly)}</span>
                        <span>Achieved: {formatCurrency(selectedConsultant.targets.achieved)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full" 
                          style={{ 
                            width: `${Math.min((selectedConsultant.targets.achieved / selectedConsultant.targets.monthly) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Remaining: {formatCurrency(selectedConsultant.targets.remaining)}</span>
                        <span>{Math.round((selectedConsultant.targets.achieved / selectedConsultant.targets.monthly) * 100)}% Complete</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Commission Tab */}
              <TabsContent value="commission" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Commission Structure
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Rate</span>
                          <span className="font-medium">{selectedConsultant.commission.percentage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Earned</span>
                          <span className="font-medium">{formatCurrency(selectedConsultant.commission.totalEarned)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="h-5 w-5 mr-2" />
                        Payment Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Paid</span>
                          <span className="font-medium text-green-600">{formatCurrency(selectedConsultant.commission.paid)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pending</span>
                          <span className="font-medium text-orange-600">{formatCurrency(selectedConsultant.commission.pending)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Document Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Aadhar Card</span>
                          <Badge className={selectedConsultant.documents.aadhar ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {selectedConsultant.documents.aadhar ? 'Submitted' : 'Pending'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>PAN Card</span>
                          <Badge className={selectedConsultant.documents.pan ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {selectedConsultant.documents.pan ? 'Submitted' : 'Pending'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Agreement</span>
                          <Badge className={selectedConsultant.documents.agreement ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {selectedConsultant.documents.agreement ? 'Signed' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Banking Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Account Number</label>
                          <p className="text-sm">{selectedConsultant.bankDetails.accountNumber}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">IFSC Code</label>
                          <p className="text-sm">{selectedConsultant.bankDetails.ifsc}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Bank Name</label>
                          <p className="text-sm">{selectedConsultant.bankDetails.bankName}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
