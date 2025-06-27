'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { validateEmail, validatePhone, validateGST, validatePAN } from '@/lib/utils'
import type { Client, ClientFormData as ClientFormDataType } from '@/types'

const clientSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  clientContact: z.string().min(1, 'Contact number is required').refine(validatePhone, 'Invalid phone number'),
  clientEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional(),
  gst: z.string().optional().refine((val) => !val || validateGST(val), 'Invalid GST number'),
  pan: z.string().optional().refine((val) => !val || validatePAN(val), 'Invalid PAN number'),
  source: z.string().optional(),
  consultantId: z.number().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  gender: z.string().optional(),
  age: z.number().optional(),
  ageFormat: z.string().optional(),
  dob: z.string().optional(),
  title: z.string().optional(),
  contactPerson: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientFormProps {
  initialData?: Partial<Client>
  onSubmit: (data: ClientFormData) => void
  isLoading?: boolean
}

export function ClientForm({ initialData, onSubmit, isLoading }: ClientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      clientName: initialData?.clientName || '',
      clientContact: initialData?.clientContact || '',
      clientEmail: initialData?.clientEmail || '',
      address: initialData?.address || '',
      gst: initialData?.gst || '',
      pan: initialData?.pan || '',
      source: initialData?.source || '',
      status: initialData?.status || 'active',
      gender: initialData?.gender || '',
      title: initialData?.title || '',
      contactPerson: initialData?.contactPerson || '',
    },
  })

  const status = watch('status')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Client Name"
              {...register('clientName')}
              error={errors.clientName?.message}
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Title"
                {...register('title')}
                placeholder="Mr., Mrs., Dr., etc."
                error={errors.title?.message}
              />
              <Input
                label="Gender"
                {...register('gender')}
                placeholder="Male, Female, Other"
                error={errors.gender?.message}
              />
            </div>

            <Input
              label="Contact Person"
              {...register('contactPerson')}
              placeholder="Primary contact person"
              error={errors.contactPerson?.message}
            />

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Status</label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setValue('status', 'active')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setValue('status', 'inactive')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    status === 'inactive'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Phone Number"
              {...register('clientContact')}
              error={errors.clientContact?.message}
              required
            />

            <Input
              label="Email Address"
              type="email"
              {...register('clientEmail')}
              error={errors.clientEmail?.message}
            />

            <Textarea
              label="Address"
              {...register('address')}
              error={errors.address?.message}
              rows={3}
            />

            <Input
              label="Source"
              {...register('source')}
              placeholder="How did they find you?"
              error={errors.source?.message}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="GST Number"
              {...register('gst')}
              placeholder="22AAAAA0000A1Z5"
              error={errors.gst?.message}
            />

            <Input
              label="PAN Number"
              {...register('pan')}
              placeholder="AAAAA0000A"
              error={errors.pan?.message}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end space-x-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          {initialData ? 'Update Client' : 'Create Client'}
        </Button>
      </div>
    </form>
  )
}
