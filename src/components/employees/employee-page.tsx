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
  Users, Plus, Search, Filter, Edit, Trash2, MoreHorizontal, 
  Mail, Phone, MapPin, Calendar, Building, User, Shield,
  Clock, CheckCircle, XCircle, Star, Award, TrendingUp,
  Download, Eye, UserCheck, UserX, Settings
} from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  designation: string
  department: string
  joiningDate: string
  status: 'active' | 'inactive' | 'on_leave' | 'terminated'
  role: 'admin' | 'manager' | 'consultant' | 'executive' | 'trainee'
  reportingTo?: string
  salary: number
  address: string
  photo?: string
  skills: string[]
  performance: {
    rating: number
    reviewDate: string
    goals: number
    achievements: number
  }
  attendance: {
    present: number
    absent: number
    late: number
    total: number
  }
  permissions: string[]
  createdAt: string
  lastActive: string
}

interface EmployeePageProps {
  tenant: string
}

const mockEmployees: Employee[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh.kumar@easy2work.com',
    phone: '+91 9876543210',
    designation: 'Senior Consultant',
    department: 'Sales',
    joiningDate: '2023-01-15',
    status: 'active',
    role: 'consultant',
    reportingTo: 'EMP005',
    salary: 45000,
    address: '123 MG Road, Bangalore',
    skills: ['Client Management', 'Sales', 'Advertising', 'Communication'],
    performance: {
      rating: 4.5,
      reviewDate: '2024-12-01',
      goals: 10,
      achievements: 8
    },
    attendance: {
      present: 22,
      absent: 2,
      late: 1,
      total: 25
    },
    permissions: ['view_clients', 'create_orders', 'view_reports'],
    createdAt: '2023-01-15T09:00:00Z',
    lastActive: '2025-01-20T14:30:00Z'
  },
  {
    id: '2',
    employeeId: 'EMP002',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@easy2work.com',
    phone: '+91 9876543211',
    designation: 'Manager',
    department: 'Operations',
    joiningDate: '2022-03-20',
    status: 'active',
    role: 'manager',
    reportingTo: 'EMP006',
    salary: 65000,
    address: '456 Brigade Road, Bangalore',
    skills: ['Team Management', 'Operations', 'Planning', 'Analytics'],
    performance: {
      rating: 4.8,
      reviewDate: '2024-12-01',
      goals: 12,
      achievements: 11
    },
    attendance: {
      present: 24,
      absent: 1,
      late: 0,
      total: 25
    },
    permissions: ['all_access'],
    createdAt: '2022-03-20T09:00:00Z',
    lastActive: '2025-01-20T16:45:00Z'
  },
  {
    id: '3',
    employeeId: 'EMP003',
    firstName: 'Arjun',
    lastName: 'Patel',
    email: 'arjun.patel@easy2work.com',
    phone: '+91 9876543212',
    designation: 'Sales Executive',
    department: 'Sales',
    joiningDate: '2023-06-10',
    status: 'active',
    role: 'executive',
    reportingTo: 'EMP001',
    salary: 28000,
    address: '789 Commercial Street, Bangalore',
    skills: ['Lead Generation', 'Cold Calling', 'Presentations'],
    performance: {
      rating: 3.8,
      reviewDate: '2024-12-01',
      goals: 8,
      achievements: 6
    },
    attendance: {
      present: 21,
      absent: 3,
      late: 2,
      total: 25
    },
    permissions: ['view_clients', 'create_leads'],
    createdAt: '2023-06-10T09:00:00Z',
    lastActive: '2025-01-20T12:15:00Z'
  },
  {
    id: '4',
    employeeId: 'EMP004',
    firstName: 'Sneha',
    lastName: 'Reddy',
    email: 'sneha.reddy@easy2work.com',
    phone: '+91 9876543213',
    designation: 'HR Executive',
    department: 'Human Resources',
    joiningDate: '2023-02-28',
    status: 'on_leave',
    role: 'executive',
    reportingTo: 'EMP002',
    salary: 32000,
    address: '321 HSR Layout, Bangalore',
    skills: ['Recruitment', 'Employee Relations', 'Training', 'Compliance'],
    performance: {
      rating: 4.2,
      reviewDate: '2024-12-01',
      goals: 6,
      achievements: 5
    },
    attendance: {
      present: 18,
      absent: 5,
      late: 1,
      total: 25
    },
    permissions: ['view_employees', 'manage_hr'],
    createdAt: '2023-02-28T09:00:00Z',
    lastActive: '2025-01-18T10:00:00Z'
  }
]

const departments = ['All', 'Sales', 'Operations', 'Human Resources', 'Finance', 'Marketing', 'IT']
const designations = ['Manager', 'Senior Consultant', 'Consultant', 'Executive', 'Trainee', 'Assistant']
const roles = ['admin', 'manager', 'consultant', 'executive', 'trainee']

export function EmployeePage({ tenant }: EmployeePageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [employees] = useState<Employee[]>(mockEmployees)

  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    role: 'executive',
    reportingTo: '',
    salary: 0,
    address: '',
    joiningDate: ''
  })

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter
    const matchesDepartment = departmentFilter === 'All' || employee.department === departmentFilter
    
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'on_leave': return 'bg-yellow-100 text-yellow-800'
      case 'terminated': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'consultant': return 'bg-indigo-100 text-indigo-800'
      case 'executive': return 'bg-green-100 text-green-800'
      case 'trainee': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCreateEmployee = () => {
    console.log('Creating employee:', newEmployee)
    setIsCreateDialogOpen(false)
    setNewEmployee({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      designation: '',
      department: '',
      role: 'executive',
      reportingTo: '',
      salary: 0,
      address: '',
      joiningDate: ''
    })
  }

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsEditDialogOpen(true)
  }

  const handleUpdateStatus = (employeeId: string, newStatus: string) => {
    console.log('Updating employee status:', employeeId, newStatus)
  }

  // Table columns configuration
  const columns = [
    {
      accessorKey: 'employee',
      header: 'Employee',
      cell: ({ row }: any) => {
        const employee = row.original as Employee
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {employee.firstName} {employee.lastName}
              </div>
              <div className="text-sm text-gray-500">{employee.employeeId}</div>
              <div className="text-xs text-gray-500">{employee.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'designation',
      header: 'Position',
      cell: ({ row }: any) => {
        const employee = row.original as Employee
        return (
          <div>
            <div className="text-sm font-medium text-gray-900">{employee.designation}</div>
            <div className="text-sm text-gray-500">{employee.department}</div>
            <Badge className={getRoleColor(employee.role)}>
              {employee.role.toUpperCase()}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
      cell: ({ row }: any) => {
        const employee = row.original as Employee
        return (
          <div className="space-y-1">
            <div className="flex items-center text-sm">
              <Phone className="h-3 w-3 mr-1 text-gray-400" />
              {employee.phone}
            </div>
            <div className="flex items-center text-sm">
              <Mail className="h-3 w-3 mr-1 text-gray-400" />
              {employee.email}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'performance',
      header: 'Performance',
      cell: ({ row }: any) => {
        const employee = row.original as Employee
        const attendanceRate = Math.round((employee.attendance.present / employee.attendance.total) * 100)
        return (
          <div className="space-y-1">
            <div className="flex items-center">
              <Star className="h-3 w-3 mr-1 text-yellow-500" />
              <span className="text-sm">{employee.performance.rating}/5</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1 text-blue-500" />
              <span className="text-sm">{attendanceRate}% attendance</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const employee = row.original as Employee
        return (
          <div className="space-y-1">
            <Badge className={getStatusColor(employee.status)}>
              {employee.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <div className="text-xs text-gray-500">
              Joined {formatDate(employee.joiningDate)}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const employee = row.original as Employee
        return (
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditEmployee(employee)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUpdateStatus(employee.id, 'active')}
            >
              <UserCheck className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`mailto:${employee.email}`)}
            >
              <Mail className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`tel:${employee.phone}`)}
            >
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  const activeEmployees = employees.filter(emp => emp.status === 'active').length
  const totalEmployees = employees.length
  const avgRating = employees.reduce((sum, emp) => sum + emp.performance.rating, 0) / employees.length
  const avgAttendance = Math.round(
    employees.reduce((sum, emp) => sum + (emp.attendance.present / emp.attendance.total), 0) / employees.length * 100
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600">Manage your team members and track their performance</p>
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
                Add Employee
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
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Employees</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalEmployees}</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                  <dd className="text-lg font-medium text-gray-900">{activeEmployees}</dd>
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
                  <dd className="text-lg font-medium text-gray-900">{avgRating.toFixed(1)}/5</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Attendance</dt>
                  <dd className="text-lg font-medium text-gray-900">{avgAttendance}%</dd>
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
                  placeholder="Search employees..."
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
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={filteredEmployees}
            searchKey="firstName"
            searchPlaceholder="Search employees..."
          />
        </CardContent>
      </Card>

      {/* Create Employee Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name *</label>
                  <Input
                    value={newEmployee.firstName}
                    onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name *</label>
                  <Input
                    value={newEmployee.lastName}
                    onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <Input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                    placeholder="employee@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone *</label>
                  <Input
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <Textarea
                  value={newEmployee.address}
                  onChange={(e) => setNewEmployee({...newEmployee, address: e.target.value})}
                  placeholder="Complete address"
                  rows={3}
                />
              </div>
            </div>

            {/* Job Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Job Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Designation *</label>
                  <Select 
                    value={newEmployee.designation} 
                    onValueChange={(value) => setNewEmployee({...newEmployee, designation: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent>
                      {designations.map(designation => (
                        <SelectItem key={designation} value={designation}>{designation}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Department *</label>
                  <Select 
                    value={newEmployee.department} 
                    onValueChange={(value) => setNewEmployee({...newEmployee, department: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.filter(dept => dept !== 'All').map(department => (
                        <SelectItem key={department} value={department}>{department}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role *</label>
                  <Select 
                    value={newEmployee.role} 
                    onValueChange={(value) => setNewEmployee({...newEmployee, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Joining Date *</label>
                  <Input
                    type="date"
                    value={newEmployee.joiningDate}
                    onChange={(e) => setNewEmployee({...newEmployee, joiningDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Salary *</label>
                  <Input
                    type="number"
                    value={newEmployee.salary}
                    onChange={(e) => setNewEmployee({...newEmployee, salary: Number(e.target.value)})}
                    placeholder="Monthly salary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Reporting To</label>
                  <Select 
                    value={newEmployee.reportingTo} 
                    onValueChange={(value) => setNewEmployee({...newEmployee, reportingTo: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.filter(emp => emp.role === 'manager' || emp.role === 'admin').map(manager => (
                        <SelectItem key={manager.employeeId} value={manager.employeeId}>
                          {manager.firstName} {manager.lastName} ({manager.employeeId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEmployee}>
                Create Employee
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <Tabs defaultValue="profile" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
              </TabsList>
              
              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Personal Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="text-sm">{selectedEmployee.firstName} {selectedEmployee.lastName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Employee ID</label>
                        <p className="text-sm">{selectedEmployee.employeeId}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm">{selectedEmployee.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-sm">{selectedEmployee.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <p className="text-sm">{selectedEmployee.address}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Job Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Designation</label>
                        <p className="text-sm">{selectedEmployee.designation}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Department</label>
                        <p className="text-sm">{selectedEmployee.department}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Role</label>
                        <Badge className={getRoleColor(selectedEmployee.role)}>
                          {selectedEmployee.role.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <Badge className={getStatusColor(selectedEmployee.status)}>
                          {selectedEmployee.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Joining Date</label>
                        <p className="text-sm">{formatDate(selectedEmployee.joiningDate)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Salary</label>
                        <p className="text-sm">{formatCurrency(selectedEmployee.salary)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Star className="h-5 w-5 mr-2" />
                        Performance Rating
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-center">
                        {selectedEmployee.performance.rating}/5
                      </div>
                      <p className="text-center text-gray-500">
                        Last reviewed: {formatDate(selectedEmployee.performance.reviewDate)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Award className="h-5 w-5 mr-2" />
                        Goals & Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Goals Set</span>
                          <span className="font-medium">{selectedEmployee.performance.goals}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Achieved</span>
                          <span className="font-medium">{selectedEmployee.performance.achievements}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(selectedEmployee.performance.achievements / selectedEmployee.performance.goals) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmployee.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Attendance Tab */}
              <TabsContent value="attendance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{selectedEmployee.attendance.present}</div>
                      <div className="text-sm text-gray-500">Present</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{selectedEmployee.attendance.absent}</div>
                      <div className="text-sm text-gray-500">Absent</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{selectedEmployee.attendance.late}</div>
                      <div className="text-sm text-gray-500">Late</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">
                        {Math.round((selectedEmployee.attendance.present / selectedEmployee.attendance.total) * 100)}%
                      </div>
                      <div className="text-sm text-gray-500">Attendance Rate</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Permissions Tab */}
              <TabsContent value="permissions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      System Permissions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedEmployee.permissions.map((permission, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b">
                          <span className="text-sm">{permission.replace('_', ' ').toUpperCase()}</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
