'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, Clock, Activity, TrendingUp, Plus, RefreshCw,
  Phone, User, Calendar, AlertCircle, CheckCircle,
  ArrowUp, ArrowDown, MoreVertical, Bell, Settings
} from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'

interface QueueCustomer {
  id: string
  tokenNumber: string
  customerName: string
  phoneNumber: string
  serviceType: string
  priority: 'normal' | 'urgent' | 'emergency'
  status: 'waiting' | 'in_service' | 'completed' | 'no_show'
  entryTime: string
  estimatedWaitTime: number
  position: number
  notes?: string
}

interface ServiceType {
  id: string
  name: string
  estimatedDuration: number
  color: string
  capacity: number
  currentlyServing: number
}

const mockServiceTypes: ServiceType[] = [
  {
    id: 'usg',
    name: 'USG Scan',
    estimatedDuration: 20,
    color: 'bg-blue-500',
    capacity: 3,
    currentlyServing: 2
  },
  {
    id: 'ct',
    name: 'CT Scan',
    estimatedDuration: 30,
    color: 'bg-green-500',
    capacity: 2,
    currentlyServing: 1
  },
  {
    id: 'xray',
    name: 'X-Ray',
    estimatedDuration: 10,
    color: 'bg-yellow-500',
    capacity: 4,
    currentlyServing: 3
  },
  {
    id: 'consultation',
    name: 'Consultation',
    estimatedDuration: 15,
    color: 'bg-purple-500',
    capacity: 5,
    currentlyServing: 2
  }
]

const mockQueue: QueueCustomer[] = [
  {
    id: '1',
    tokenNumber: 'T001',
    customerName: 'John Smith',
    phoneNumber: '+91 9876543210',
    serviceType: 'usg',
    priority: 'normal',
    status: 'waiting',
    entryTime: '2025-01-15T09:00:00Z',
    estimatedWaitTime: 15,
    position: 1
  },
  {
    id: '2',
    tokenNumber: 'T002',
    customerName: 'Mary Johnson',
    phoneNumber: '+91 9876543211',
    serviceType: 'ct',
    priority: 'urgent',
    status: 'waiting',
    entryTime: '2025-01-15T09:05:00Z',
    estimatedWaitTime: 25,
    position: 2
  },
  {
    id: '3',
    tokenNumber: 'T003',
    customerName: 'David Wilson',
    phoneNumber: '+91 9876543212',
    serviceType: 'xray',
    priority: 'normal',
    status: 'in_service',
    entryTime: '2025-01-15T09:10:00Z',
    estimatedWaitTime: 0,
    position: 3
  }
]

export function QueueDashboardPage() {
  const params = useParams()
  const tenant = params.tenant as string
  const [queue, setQueue] = useState<QueueCustomer[]>(mockQueue)
  const [serviceTypes] = useState<ServiceType[]>(mockServiceTypes)
  const [selectedService, setSelectedService] = useState<string>('all')
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    customerName: '',
    phoneNumber: '',
    serviceType: '',
    priority: 'normal'
  })

  // Auto-refresh queue every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // In real implementation, fetch updated queue data
      console.log('Refreshing queue data...')
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800'
      case 'urgent': return 'bg-yellow-100 text-yellow-800'
      case 'normal': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-blue-100 text-blue-800'
      case 'in_service': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'no_show': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const moveCustomerUp = (customerId: string) => {
    const customerIndex = queue.findIndex(c => c.id === customerId)
    if (customerIndex > 0) {
      const newQueue = [...queue]
      const temp = newQueue[customerIndex]
      newQueue[customerIndex] = newQueue[customerIndex - 1]
      newQueue[customerIndex - 1] = temp
      
      // Update positions
      newQueue[customerIndex].position = customerIndex + 1
      newQueue[customerIndex - 1].position = customerIndex
      
      setQueue(newQueue)
    }
  }

  const moveCustomerDown = (customerId: string) => {
    const customerIndex = queue.findIndex(c => c.id === customerId)
    if (customerIndex < queue.length - 1) {
      const newQueue = [...queue]
      const temp = newQueue[customerIndex]
      newQueue[customerIndex] = newQueue[customerIndex + 1]
      newQueue[customerIndex + 1] = temp
      
      // Update positions
      newQueue[customerIndex].position = customerIndex + 1
      newQueue[customerIndex + 1].position = customerIndex + 2
      
      setQueue(newQueue)
    }
  }

  const addCustomerToQueue = () => {
    if (!newCustomer.customerName || !newCustomer.phoneNumber || !newCustomer.serviceType) {
      return
    }

    const tokenNumber = `T${String(queue.length + 1).padStart(3, '0')}`
    const newQueueCustomer: QueueCustomer = {
      id: Date.now().toString(),
      tokenNumber,
      customerName: newCustomer.customerName,
      phoneNumber: newCustomer.phoneNumber,
      serviceType: newCustomer.serviceType,
      priority: newCustomer.priority as 'normal' | 'urgent' | 'emergency',
      status: 'waiting',
      entryTime: new Date().toISOString(),
      estimatedWaitTime: 20,
      position: queue.length + 1
    }

    setQueue([...queue, newQueueCustomer])
    setNewCustomer({
      customerName: '',
      phoneNumber: '',
      serviceType: '',
      priority: 'normal'
    })
    setIsAddCustomerDialogOpen(false)
  }

  const moveCustomerToService = (customerId: string) => {
    setQueue(queue.map(customer => 
      customer.id === customerId 
        ? { ...customer, status: 'in_service' }
        : customer
    ))
  }

  const completeService = (customerId: string) => {
    setQueue(queue.map(customer => 
      customer.id === customerId 
        ? { ...customer, status: 'completed' }
        : customer
    ))
  }

  const markNoShow = (customerId: string) => {
    setQueue(queue.map(customer => 
      customer.id === customerId 
        ? { ...customer, status: 'no_show' }
        : customer
    ))
  }

  const removeFromQueue = (customerId: string) => {
    setQueue(queue.filter(customer => customer.id !== customerId))
  }

  const filteredQueue = selectedService === 'all' 
    ? queue 
    : queue.filter(customer => customer.serviceType === selectedService)

  const waitingCustomers = queue.filter(c => c.status === 'waiting')
  const inServiceCustomers = queue.filter(c => c.status === 'in_service')
  const completedToday = queue.filter(c => c.status === 'completed')
  const averageWaitTime = waitingCustomers.length > 0 
    ? Math.round(waitingCustomers.reduce((acc, c) => acc + c.estimatedWaitTime, 0) / waitingCustomers.length)
    : 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Queue Management</h1>
          <p className="text-gray-600">Real-time customer queue management system</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Dialog open={isAddCustomerDialogOpen} onOpenChange={setIsAddCustomerDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Customer to Queue</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Customer Name</label>
                  <Input
                    value={newCustomer.customerName}
                    onChange={(e) => setNewCustomer({...newCustomer, customerName: e.target.value})}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input
                    value={newCustomer.phoneNumber}
                    onChange={(e) => setNewCustomer({...newCustomer, phoneNumber: e.target.value})}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Service Type</label>
                  <Select 
                    value={newCustomer.serviceType} 
                    onValueChange={(value) => setNewCustomer({...newCustomer, serviceType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <Select 
                    value={newCustomer.priority} 
                    onValueChange={(value) => setNewCustomer({...newCustomer, priority: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddCustomerDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addCustomerToQueue}>
                    Add to Queue
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
            <CardTitle className="text-sm font-medium">Waiting</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{waitingCustomers.length}</div>
            <p className="text-xs text-muted-foreground">
              customers in queue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Service</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inServiceCustomers.length}</div>
            <p className="text-xs text-muted-foreground">
              currently being served
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedToday.length}</div>
            <p className="text-xs text-muted-foreground">
              services completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageWaitTime}m</div>
            <p className="text-xs text-muted-foreground">
              minutes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {serviceTypes.map((service) => (
              <div key={service.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{service.name}</h3>
                  <div className={`w-3 h-3 rounded-full ${service.color}`}></div>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Capacity: {service.capacity}</div>
                  <div>In Use: {service.currentlyServing}</div>
                  <div>Duration: {service.estimatedDuration}min</div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${service.color}`}
                      style={{ width: `${(service.currentlyServing / service.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Queue Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waiting Queue */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Queue</CardTitle>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {serviceTypes.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredQueue.filter(c => c.status === 'waiting').map((customer, index) => (
                <div
                  key={customer.id}
                  className={`p-4 border rounded-lg ${
                    customer.priority === 'urgent' ? 'border-yellow-300 bg-yellow-50' : 
                    customer.priority === 'emergency' ? 'border-red-300 bg-red-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-bold text-gray-900">
                        {customer.tokenNumber}
                      </div>
                      <div>
                        <div className="font-medium">{customer.customerName}</div>
                        <div className="text-sm text-gray-500">{customer.phoneNumber}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className="text-xs">
                            {serviceTypes.find(s => s.id === customer.serviceType)?.name}
                          </Badge>
                          <Badge className={getPriorityColor(customer.priority)}>
                            {customer.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Wait time</div>
                        <div className="font-medium">{customer.estimatedWaitTime}m</div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moveCustomerUp(customer.id)}
                            className="h-6 w-6 p-0"
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moveCustomerDown(customer.id)}
                            className="h-6 w-6 p-0"
                            disabled={index === filteredQueue.filter(c => c.status === 'waiting').length - 1}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => moveCustomerToService(customer.id)}
                          className="h-6 px-2 text-xs"
                        >
                          Start
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markNoShow(customer.id)}
                          className="h-6 px-2 text-xs"
                        >
                          No Show
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* In Service & Completed */}
        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="in_service">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="in_service">In Service</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <TabsContent value="in_service" className="space-y-3">
                {queue.filter(c => c.status === 'in_service').map((customer) => (
                  <div key={customer.id} className="p-3 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{customer.customerName}</div>
                        <div className="text-sm text-gray-500">{customer.tokenNumber}</div>
                        <Badge className="text-xs mt-1">
                          {serviceTypes.find(s => s.id === customer.serviceType)?.name}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => completeService(customer.id)}
                        className="h-8 px-3 text-xs"
                      >
                        Complete
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="completed" className="space-y-3">
                {queue.filter(c => c.status === 'completed').slice(-5).map((customer) => (
                  <div key={customer.id} className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{customer.customerName}</div>
                        <div className="text-sm text-gray-500">{customer.tokenNumber}</div>
                        <div className="text-xs text-gray-400">
                          {formatTime(customer.entryTime)}
                        </div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
