'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, Phone, Mail, MapPin, Calendar, MessageSquare,
  Star, TrendingUp, Clock, Target, Edit, Trash2, 
  Phone as PhoneIcon, MessageSquareIcon, Plus, FileText
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

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
  status: string
  priority: string
  followupDate?: string
  followupTime?: string
  quoteSent: boolean
  territory: string
  leadScore: number
  lastActivity: string
  notes: string
  conversionProbability: number
}

interface Activity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'quote'
  description: string
  date: string
  user: string
  outcome?: string
}

interface LeadDetailsProps {
  lead: Lead
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'call',
    description: 'Initial consultation call',
    date: '2025-01-18T10:00:00Z',
    user: 'Raj Kumar',
    outcome: 'Interested in newspaper ads'
  },
  {
    id: '2',
    type: 'email',
    description: 'Sent company brochure and rate card',
    date: '2025-01-17T14:30:00Z',
    user: 'Raj Kumar'
  },
  {
    id: '3',
    type: 'note',
    description: 'Lead shows high interest, budget confirmed',
    date: '2025-01-16T16:15:00Z',
    user: 'Raj Kumar'
  }
]

export function LeadDetails({ lead, onClose, onEdit, onDelete }: LeadDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [activities] = useState<Activity[]>(mockActivities)

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <PhoneIcon className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'meeting': return <Calendar className="h-4 w-4" />
      case 'note': return <FileText className="h-4 w-4" />
      case 'quote': return <Target className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-900">{lead.prospect}</h2>
            <Badge className={getStatusColor(lead.status)}>
              {lead.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge className={getPriorityColor(lead.priority)}>
              {lead.priority.toUpperCase()}
            </Badge>
          </div>
          <p className="text-gray-600 mt-1">Lead ID: {lead.leadId}</p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`tel:${lead.contactNumber}`)}
          >
            <PhoneIcon className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://wa.me/${lead.contactNumber.replace(/[^0-9]/g, '')}`)}
          >
            <MessageSquareIcon className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Lead Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Contact Person</p>
                      <p className="font-medium">{lead.contactPerson}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Source</p>
                      <p className="font-medium">{lead.source}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Consultant</p>
                      <p className="font-medium">{lead.consultant}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Territory</p>
                      <p className="font-medium">{lead.territory}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Entry Date</p>
                      <p className="font-medium">{formatDate(lead.entryDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Activity</p>
                      <p className="font-medium">{formatDate(lead.lastActivity)}</p>
                    </div>
                  </div>
                  
                  {lead.notes && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Notes</p>
                      <p className="text-gray-900">{lead.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Follow-up Information */}
              {lead.followupDate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Next Follow-up
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">{formatDate(lead.followupDate)}</p>
                      </div>
                      {lead.followupTime && (
                        <div>
                          <p className="text-sm text-gray-500">Time</p>
                          <p className="font-medium">{lead.followupTime}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Lead Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Lead Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{lead.leadScore}</div>
                    <div className="text-sm text-gray-500">out of 100</div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${lead.leadScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Conversion Probability */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Conversion Probability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{lead.conversionProbability}%</div>
                    <div className="text-sm text-gray-500">probability</div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Activity
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Quote
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium">{lead.contactNumber}</p>
                    </div>
                  </div>
                  
                  {lead.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email Address</p>
                        <p className="font-medium">{lead.email}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{lead.address}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Quote Status</p>
                    <Badge className={lead.quoteSent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {lead.quoteSent ? 'Quote Sent' : 'Quote Pending'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{activity.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(activity.date)}</p>
                      </div>
                      <p className="text-sm text-gray-600">by {activity.user}</p>
                      {activity.outcome && (
                        <p className="text-sm text-gray-500 mt-1">Outcome: {activity.outcome}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Score History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{lead.leadScore}</div>
                  <div className="text-sm text-gray-500">Current Score</div>
                  <div className="mt-2 text-green-600 text-sm">+5 this week</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">2.5h</div>
                  <div className="text-sm text-gray-500">Avg Response</div>
                  <div className="mt-2 text-green-600 text-sm">Above average</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">High</div>
                  <div className="text-sm text-gray-500">Activity Level</div>
                  <div className="mt-2 text-blue-600 text-sm">5 interactions</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button variant="destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Lead
        </Button>
      </div>
    </div>
  )
}
