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
  Calendar, Clock, User, Phone, Mail, MapPin, Plus, Search, Filter,
  Download, Eye, Edit, Trash2, Check, X, CalendarDays,
  MessageSquare, Bell, AlertCircle, CheckCircle
} from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'

interface Appointment {
  id: string
  appointmentId: string
  clientName: string
  clientPhone: string
  clientEmail?: string
  serviceType: string
  appointmentDate: string
  appointmentTime: string
  duration: number
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  priority: 'normal' | 'urgent' | 'high'
  notes?: string
  reminderSent: boolean
  createdBy: string
  createdAt: string
  consultantAssigned?: string
}

interface TimeSlot {
  time: string
  available: boolean
  appointmentId?: string
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    appointmentId: 'APT-2025-001',
    clientName: 'John Smith',
    clientPhone: '+91 9876543210',
    clientEmail: 'john@example.com',
    serviceType: 'Consultation',
    appointmentDate: '2025-01-20',
    appointmentTime: '10:00',
    duration: 30,
    status: 'scheduled',
    priority: 'normal',
    notes: 'Follow-up consultation for previous advertising campaign',
    reminderSent: false,
    createdBy: 'Admin',
    createdAt: '2025-01-15T09:00:00Z',
    consultantAssigned: 'Raj Kumar'
  },
  {
    id: '2',
    appointmentId: 'APT-2025-002',
    clientName: 'Sarah Wilson',
    clientPhone: '+91 9876543211',
    clientEmail: 'sarah@company.com',
    serviceType: 'Rate Discussion',
    appointmentDate: '2025-01-20',
    appointmentTime: '14:00',
    duration: 45,
    status: 'confirmed',
    priority: 'high',
    notes: 'Discuss bulk advertising rates for upcoming campaign',
    reminderSent: true,
    createdBy: 'Priya Sharma',
    createdAt: '2025-01-16T11:30:00Z',
    consultantAssigned: 'Priya Sharma'
  }
]

const serviceTypes = [
  'Consultation',
  'Rate Discussion',
  'Campaign Planning',
  'Creative Review',
  'Contract Signing',
  'Payment Discussion',
  'Technical Support'
]

const timeSlots: TimeSlot[] = [
  { time: '09:00', available: true },
  { time: '09:30', available: true },
  { time: '10:00', available: false, appointmentId: 'APT-2025-001' },
  { time: '10:30', available: true },
  { time: '11:00', available: true },
  { time: '11:30', available: true },
  { time: '12:00', available: true },
  { time: '12:30', available: true },
  { time: '13:00', available: false }, // Lunch break
  { time: '13:30', available: false }, // Lunch break
  { time: '14:00', available: false, appointmentId: 'APT-2025-002' },
  { time: '14:30', available: true },
  { time: '15:00', available: true },
  { time: '15:30', available: true },
  { time: '16:00', available: true },
  { time: '16:30', available: true },
  { time: '17:00', available: true },
  { time: '17:30', available: true }
]

export function AppointmentPage() {
  const params = useParams()
  const tenant = params.tenant as string
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [appointments] = useState<Appointment[]>(mockAppointments)

  const [newAppointment, setNewAppointment] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    serviceType: '',
    appointmentDate: '',
    appointmentTime: '',
    duration: 30,
    priority: 'normal',
    notes: '',
    consultantAssigned: ''
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'no_show': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'urgent': return 'bg-yellow-100 text-yellow-800'
      case 'normal': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCreateAppointment = () => {
    // Implementation for creating appointment
    console.log('Creating appointment:', newAppointment)
    setIsCreateDialogOpen(false)
  }

  const handleUpdateStatus = (appointmentId: string, newStatus: string) => {
    // Implementation for updating appointment status
    console.log('Updating appointment status:', appointmentId, newStatus)
  }

  const sendReminder = (appointmentId: string) => {
    // Implementation for sending reminder
    console.log('Sending reminder for:', appointmentId)
  }

  // Table columns configuration
  const columns = [
    {
      accessorKey: 'appointmentId',
      header: 'Appointment ID',
      cell: ({ row }: any) => {
        const appointment = row.original as Appointment
        return (
          <div className="font-medium">
            <div className="text-sm text-gray-900">{appointment.appointmentId}</div>
            <div className="text-xs text-gray-500">{formatDate(appointment.createdAt)}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'client',
      header: 'Client',
      cell: ({ row }: any) => {
        const appointment = row.original as Appointment
        return (
          <div>
            <div className="font-medium text-gray-900">{appointment.clientName}</div>
            <div className="text-sm text-gray-500">{appointment.clientPhone}</div>
            {appointment.clientEmail && (
              <div className="text-xs text-gray-500">{appointment.clientEmail}</div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'appointment',
      header: 'Appointment',
      cell: ({ row }: any) => {
        const appointment = row.original as Appointment
        return (
          <div>
            <div className="text-sm text-gray-900">{appointment.serviceType}</div>
            <div className="text-sm text-gray-500">
              {formatDate(appointment.appointmentDate)} at {appointment.appointmentTime}
            </div>
            <div className="text-xs text-gray-500">{appointment.duration} minutes</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const appointment = row.original as Appointment
        return (
          <div className="space-y-1">
            <Badge className={getStatusColor(appointment.status)}>
              {appointment.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge className={getPriorityColor(appointment.priority)}>
              {appointment.priority.toUpperCase()}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: 'consultant',
      header: 'Assigned To',
      cell: ({ row }: any) => {
        const appointment = row.original as Appointment
        return appointment.consultantAssigned ? (
          <div className="text-sm text-gray-900">{appointment.consultantAssigned}</div>
        ) : (
          <span className="text-gray-400">Unassigned</span>
        )
      },
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const appointment = row.original as Appointment
        return (
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedAppointment(appointment)
                setIsEditDialogOpen(true)
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => sendReminder(appointment.id)}
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`tel:${appointment.clientPhone}`)}
            >
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  const todayAppointments = appointments.filter(apt => 
    apt.appointmentDate === new Date().toISOString().split('T')[0]
  )

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.appointmentDate) > new Date()
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
          <p className="text-gray-600">Schedule and manage client appointments efficiently</p>
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
                Schedule Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Client Name *</label>
                    <Input
                      value={newAppointment.clientName}
                      onChange={(e) => setNewAppointment({...newAppointment, clientName: e.target.value})}
                      placeholder="Enter client name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <Input
                      value={newAppointment.clientPhone}
                      onChange={(e) => setNewAppointment({...newAppointment, clientPhone: e.target.value})}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <Input
                      value={newAppointment.clientEmail}
                      onChange={(e) => setNewAppointment({...newAppointment, clientEmail: e.target.value})}
                      placeholder="client@example.com"
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Service Type *</label>
                    <Select 
                      value={newAppointment.serviceType} 
                      onValueChange={(value) => setNewAppointment({...newAppointment, serviceType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date *</label>
                    <Input
                      value={newAppointment.appointmentDate}
                      onChange={(e) => setNewAppointment({...newAppointment, appointmentDate: e.target.value})}
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Time *</label>
                    <Select 
                      value={newAppointment.appointmentTime} 
                      onValueChange={(value) => setNewAppointment({...newAppointment, appointmentTime: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.filter(slot => slot.available).map((slot) => (
                          <SelectItem key={slot.time} value={slot.time}>
                            {slot.time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                    <Select 
                      value={newAppointment.duration.toString()} 
                      onValueChange={(value) => setNewAppointment({...newAppointment, duration: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <Select 
                      value={newAppointment.priority} 
                      onValueChange={(value) => setNewAppointment({...newAppointment, priority: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <Textarea
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                    placeholder="Enter any additional notes..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAppointment}>
                    Schedule Appointment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {todayAppointments.filter(a => a.status === 'confirmed').length} confirmed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              next 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No-shows</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              this week
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">Appointment List</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Search appointments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-full"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Date filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="tomorrow">Tomorrow</SelectItem>
                      <SelectItem value="this_week">This Week</SelectItem>
                      <SelectItem value="next_week">Next Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <DataTable
                columns={columns}
                data={appointments}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date()
                  date.setDate(date.getDate() - date.getDay() + i)
                  const dayAppointments = appointments.filter(apt => 
                    apt.appointmentDate === date.toISOString().split('T')[0]
                  )
                  
                  return (
                    <div key={i} className="p-2 min-h-20 border border-gray-200 rounded">
                      <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                      {dayAppointments.map(apt => (
                        <div key={apt.id} className="text-xs p-1 mb-1 bg-blue-100 rounded">
                          {apt.appointmentTime} - {apt.clientName}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeSlots.map((slot) => {
                  const appointment = appointments.find(apt => 
                    apt.appointmentTime === slot.time && 
                    apt.appointmentDate === new Date().toISOString().split('T')[0]
                  )
                  
                  return (
                    <div key={slot.time} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="w-16 text-sm font-medium">{slot.time}</div>
                      {appointment ? (
                        <div className="flex-1 flex items-center justify-between">
                          <div>
                            <div className="font-medium">{appointment.clientName}</div>
                            <div className="text-sm text-gray-500">{appointment.serviceType}</div>
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 text-gray-400">Available</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
