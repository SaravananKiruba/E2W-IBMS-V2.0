'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Calculator } from 'lucide-react'
import type { Order, OrderFormData, Client, Rate } from '@/types'
import { useClients } from '@/hooks/use-clients'
import { apiClient } from '@/lib/api'

const orderItemSchema = z.object({
  adMedium: z.string().min(1, 'Ad medium is required'),
  adType: z.string().min(1, 'Ad type is required'),
  adCategory: z.string().min(1, 'Ad category is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  width: z.number().optional(),
  units: z.string().min(1, 'Unit is required'),
  ratePerUnit: z.number().min(0, 'Rate must be non-negative'),
  gstPercentage: z.number().min(0).max(100, 'GST must be between 0-100'),
  discountAmount: z.number().min(0).optional(),
  remarks: z.string().optional(),
  dateOfRelease: z.string().optional(),
})

const orderSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  status: z.string().min(1, 'Status is required'),
  orderType: z.string().min(1, 'Order type is required'),
  deliveryDate: z.string().optional(),
  remarks: z.string().optional(),
  discount: z.number().min(0).optional(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
})

interface OrderFormProps {
  initialData?: Order
  onSubmit: (data: OrderFormData) => void
  isLoading: boolean
  tenant: string
}

export function OrderForm({ initialData, onSubmit, isLoading, tenant }: OrderFormProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [rates, setRates] = useState<Rate[]>([])
  const [adMediums, setAdMediums] = useState<string[]>([])
  const [adTypes, setAdTypes] = useState<string[]>([])
  const [adCategories, setAdCategories] = useState<string[]>([])

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: initialData ? {
      clientId: initialData.clientId,
      status: initialData.status,
      orderType: initialData.orderType,
      deliveryDate: initialData.deliveryDate,
      remarks: initialData.remarks,
      discount: initialData.discount,
      items: initialData.items.map(item => ({
        adMedium: item.adMedium,
        adType: item.adType,
        adCategory: item.adCategory,
        quantity: item.quantity,
        width: item.width,
        units: item.units,
        ratePerUnit: item.ratePerUnit,
        gstPercentage: parseFloat(item.gstPercentage),
        discountAmount: item.discountAmount,
        remarks: item.remarks,
        dateOfRelease: item.dateOfRelease,
      }))
    } : {
      clientId: '',
      status: 'pending',
      orderType: 'standard',
      deliveryDate: '',
      remarks: '',
      discount: 0,
      items: [{
        adMedium: '',
        adType: '',
        adCategory: '',
        quantity: 1,
        width: 0,
        units: 'Per Unit',
        ratePerUnit: 0,
        gstPercentage: 18,
        discountAmount: 0,
        remarks: '',
        dateOfRelease: '',
      }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items'
  })

  // Load initial data
  useEffect(() => {
    loadClients()
    loadRates()
  }, [tenant])

  const loadClients = async () => {
    try {
      const response = await apiClient.get(`/clients`, {
        headers: { 'X-Tenant': tenant }
      })
      if (response.data.success) {
        setClients(response.data.data)
      }
    } catch (error) {
      console.error('Failed to load clients:', error)
    }
  }

  const loadRates = async () => {
    try {
      const response = await apiClient.get(`/rates`, {
        headers: { 'X-Tenant': tenant }
      })
      if (response.data.success) {
        const ratesData = response.data.data
        setRates(ratesData)
        
        // Extract unique values
        const mediums = Array.from(new Set(ratesData.map((r: Rate) => r.adMedium))) as string[]
        const types = Array.from(new Set(ratesData.map((r: Rate) => r.adType))) as string[]
        const categories = Array.from(new Set(ratesData.map((r: Rate) => r.adCategory))) as string[]
        
        setAdMediums(mediums)
        setAdTypes(types)
        setAdCategories(categories)
      }
    } catch (error) {
      console.error('Failed to load rates:', error)
    }
  }

  const calculateItemAmount = (index: number) => {
    const item = form.getValues(`items.${index}`)
    const baseAmount = item.quantity * item.ratePerUnit
    const discountAmount = item.discountAmount || 0
    const amountAfterDiscount = baseAmount - discountAmount
    const gstAmount = (amountAfterDiscount * item.gstPercentage) / 100
    const totalAmount = amountAfterDiscount + gstAmount
    
    return {
      baseAmount,
      amountAfterDiscount,
      gstAmount,
      totalAmount
    }
  }

  const addItem = () => {
    append({
      adMedium: '',
      adType: '',
      adCategory: '',
      quantity: 1,
      width: 0,
      units: 'Per Unit',
      ratePerUnit: 0,
      gstPercentage: 18,
      discountAmount: 0,
      remarks: '',
      dateOfRelease: '',
    })
  }

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const calculateOrderTotal = () => {
    const items = form.getValues('items')
    let totalAmount = 0
    let totalGST = 0
    
    items.forEach(item => {
      const baseAmount = item.quantity * item.ratePerUnit
      const discountAmount = item.discountAmount || 0
      const amountAfterDiscount = baseAmount - discountAmount
      const gstAmount = (amountAfterDiscount * item.gstPercentage) / 100
      
      totalAmount += amountAfterDiscount + gstAmount
      totalGST += gstAmount
    })
    
    const orderDiscount = form.getValues('discount') || 0
    const finalAmount = totalAmount - orderDiscount
    
    return {
      subtotal: totalAmount - totalGST,
      gstAmount: totalGST,
      discount: orderDiscount,
      total: finalAmount
    }
  }

  const onFormSubmit = (data: OrderFormData) => {
    onSubmit(data)
  }

  const orderTotals = calculateOrderTotal()

  return (
    <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Client *</label>
              <Select 
                value={form.watch('clientId')} 
                onValueChange={(value: string) => form.setValue('clientId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.clientName} - {client.clientContact}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.clientId && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.clientId.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-2">Status *</label>
              <Select 
                value={form.watch('status')} 
                onValueChange={(value: string) => form.setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Order Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Order Type *</label>
              <Select 
                value={form.watch('orderType')} 
                onValueChange={(value: string) => form.setValue('orderType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="express">Express</SelectItem>
                  <SelectItem value="bulk">Bulk</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Delivery Date */}
            <div>
              <label className="block text-sm font-medium mb-2">Delivery Date</label>
              <Input
                type="date"
                {...form.register('deliveryDate')}
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium mb-2">Order Remarks</label>
            <Textarea
              {...form.register('remarks')}
              placeholder="Enter any additional notes..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Order Items</CardTitle>
            <Button type="button" onClick={addItem} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="border-dashed">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Item #{index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Ad Medium */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Ad Medium *</label>
                      <Select
                        value={form.watch(`items.${index}.adMedium`)}
                        onValueChange={(value: string) => form.setValue(`items.${index}.adMedium`, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select medium" />
                        </SelectTrigger>
                        <SelectContent>
                          {adMediums.map((medium) => (
                            <SelectItem key={medium} value={medium}>
                              {medium}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Ad Type */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Ad Type *</label>
                      <Select
                        value={form.watch(`items.${index}.adType`)}
                        onValueChange={(value: string) => form.setValue(`items.${index}.adType`, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {adTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Ad Category */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Ad Category *</label>
                      <Select
                        value={form.watch(`items.${index}.adCategory`)}
                        onValueChange={(value: string) => form.setValue(`items.${index}.adCategory`, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {adCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Quantity *</label>
                      <Input
                        type="number"
                        min="1"
                        {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                      />
                    </div>

                    {/* Width */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Width</label>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`items.${index}.width`, { valueAsNumber: true })}
                      />
                    </div>

                    {/* Units */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Units *</label>
                      <Input
                        {...form.register(`items.${index}.units`)}
                        placeholder="Per Unit"
                      />
                    </div>

                    {/* Rate per Unit */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Rate/Unit *</label>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`items.${index}.ratePerUnit`, { valueAsNumber: true })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {/* GST Percentage */}
                    <div>
                      <label className="block text-sm font-medium mb-1">GST % *</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        {...form.register(`items.${index}.gstPercentage`, { valueAsNumber: true })}
                      />
                    </div>

                    {/* Discount Amount */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Discount</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...form.register(`items.${index}.discountAmount`, { valueAsNumber: true })}
                      />
                    </div>

                    {/* Date of Release */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Release Date</label>
                      <Input
                        type="date"
                        {...form.register(`items.${index}.dateOfRelease`)}
                      />
                    </div>
                  </div>

                  {/* Item Remarks */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Item Remarks</label>
                    <Textarea
                      {...form.register(`items.${index}.remarks`)}
                      placeholder="Item-specific notes..."
                      rows={2}
                    />
                  </div>

                  {/* Item Total Display */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Item Total:</span>
                      <span className="font-medium">
                        ₹{calculateItemAmount(index).totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Order Discount */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Order Discount:</label>
              <div className="w-32">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register('discount', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{orderTotals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>GST Amount:</span>
                <span>₹{orderTotals.gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Order Discount:</span>
                <span>-₹{orderTotals.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total Amount:</span>
                <span>₹{orderTotals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Order' : 'Create Order'}
        </Button>
      </div>
    </form>
  )
}
