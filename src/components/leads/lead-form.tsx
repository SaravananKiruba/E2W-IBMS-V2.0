'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Phone, Mail, MapPin, User, Building } from 'lucide-react'

const leadSchema = z.object({
  prospect: z.string().min(1, 'Prospect name is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  contactNumber: z.string().min(10, 'Valid contact number is required'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required'),
  source: z.string().min(1, 'Lead source is required'),
  consultant: z.string().min(1, 'Consultant is required'),
  status: z.string().min(1, 'Status is required'),
  priority: z.string().min(1, 'Priority is required'),
  territory: z.string().min(1, 'Territory is required'),
  followupDate: z.string().optional(),
  followupTime: z.string().optional(),
  notes: z.string().optional(),
  leadScore: z.number().min(0).max(100).optional(),
  conversionProbability: z.number().min(0).max(100).optional(),
})

type LeadFormData = z.infer<typeof leadSchema>

interface LeadFormProps {
  initialData?: any
  onSubmit: (data: LeadFormData) => void
  isLoading: boolean
  tenant: string
}

export function LeadForm({ initialData, onSubmit, isLoading, tenant }: LeadFormProps) {
  const [consultants, setConsultants] = useState<string[]>([
    'Raj Kumar',
    'Priya Sharma',
    'Amit Singh',
    'Sunita Patel'
  ])

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: initialData ? {
      prospect: initialData.prospect,
      contactPerson: initialData.contactPerson,
      contactNumber: initialData.contactNumber,
      email: initialData.email,
      address: initialData.address,
      source: initialData.source,
      consultant: initialData.consultant,
      status: initialData.status,
      priority: initialData.priority,
      territory: initialData.territory,
      followupDate: initialData.followupDate,
      followupTime: initialData.followupTime,
      notes: initialData.notes,
      leadScore: initialData.leadScore,
      conversionProbability: initialData.conversionProbability,
    } : {
      status: 'new',
      priority: 'medium',
      leadScore: 50,
      conversionProbability: 30,
    }
  })

  const handleSubmit = (data: LeadFormData) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Lead Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Prospect/Company Name *</label>
              <Input
                {...form.register('prospect')}
                placeholder="Enter company name"
              />
              {form.formState.errors.prospect && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.prospect.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contact Person *</label>
              <Input
                {...form.register('contactPerson')}
                placeholder="Enter contact person name"
              />
              {form.formState.errors.contactPerson && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.contactPerson.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contact Number *</label>
              <Input
                {...form.register('contactNumber')}
                placeholder="+91 9876543210"
                type="tel"
              />
              {form.formState.errors.contactNumber && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.contactNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <Input
                {...form.register('email')}
                placeholder="contact@company.com"
                type="email"
              />
              {form.formState.errors.email && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Address *</label>
            <Textarea
              {...form.register('address')}
              placeholder="Enter complete address"
              rows={3}
            />
            {form.formState.errors.address && (
              <p className="text-red-600 text-sm mt-1">{form.formState.errors.address.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lead Classification */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Classification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Lead Source *</label>
              <Select onValueChange={(value) => form.setValue('source', value)} defaultValue={form.getValues('source')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JustDial">JustDial</SelectItem>
                  <SelectItem value="IndiaMart">IndiaMart</SelectItem>
                  <SelectItem value="Sulekha">Sulekha</SelectItem>
                  <SelectItem value="LG">LG</SelectItem>
                  <SelectItem value="Direct">Direct</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Social Media">Social Media</SelectItem>
                  <SelectItem value="Cold Call">Cold Call</SelectItem>
                  <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.source && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.source.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Assigned Consultant *</label>
              <Select onValueChange={(value) => form.setValue('consultant', value)} defaultValue={form.getValues('consultant')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select consultant" />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map((consultant) => (
                    <SelectItem key={consultant} value={consultant}>
                      {consultant}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.consultant && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.consultant.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Territory *</label>
              <Select onValueChange={(value) => form.setValue('territory', value)} defaultValue={form.getValues('territory')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select territory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="North">North</SelectItem>
                  <SelectItem value="South">South</SelectItem>
                  <SelectItem value="East">East</SelectItem>
                  <SelectItem value="West">West</SelectItem>
                  <SelectItem value="Central">Central</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.territory && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.territory.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Lead Status *</label>
              <Select onValueChange={(value) => form.setValue('status', value)} defaultValue={form.getValues('status')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="call_followup">Call Follow-up</SelectItem>
                  <SelectItem value="unreachable">Unreachable</SelectItem>
                  <SelectItem value="unqualified">Unqualified</SelectItem>
                  <SelectItem value="convert">Convert</SelectItem>
                  <SelectItem value="ready_for_quote">Ready for Quote</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.status.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Priority *</label>
              <Select onValueChange={(value) => form.setValue('priority', value)} defaultValue={form.getValues('priority')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.priority && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.priority.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Follow-up Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Follow-up Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Follow-up Date</label>
              <Input
                {...form.register('followupDate')}
                type="date"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Follow-up Time</label>
              <Input
                {...form.register('followupTime')}
                type="time"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lead Scoring */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Scoring & Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Lead Score (0-100)</label>
              <Input
                {...form.register('leadScore', { valueAsNumber: true })}
                type="number"
                min="0"
                max="100"
                placeholder="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Conversion Probability (%)</label>
              <Input
                {...form.register('conversionProbability', { valueAsNumber: true })}
                type="number"
                min="0"
                max="100"
                placeholder="30"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...form.register('notes')}
            placeholder="Enter any additional notes about this lead..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Lead' : 'Create Lead'}
        </Button>
      </div>
    </form>
  )
}
