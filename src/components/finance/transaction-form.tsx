'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Transaction, TransactionFormData } from '@/types'

const transactionSchema = z.object({
  billNumber: z.string().min(1, 'Bill number is required'),
  billDate: z.string().min(1, 'Bill date is required'),
  type: z.enum(['income', 'expense'], { required_error: 'Transaction type is required' }),
  amount: z.number().min(0, 'Amount must be positive'),
  amountExcludingGST: z.number().min(0, 'Amount excluding GST must be positive'),
  gstAmount: z.number().min(0, 'GST amount must be positive'),
  orderNumber: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  description: z.string().optional(),
  category: z.string().optional(),
})

interface TransactionFormProps {
  initialData?: Transaction
  onSubmit: (data: TransactionFormData) => void
  isLoading: boolean
  tenant: string
}

export function TransactionForm({ 
  initialData, 
  onSubmit, 
  isLoading, 
  tenant 
}: TransactionFormProps) {
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData ? {
      billNumber: initialData.billNumber,
      billDate: initialData.billDate,
      type: initialData.type,
      amount: initialData.amount,
      amountExcludingGST: initialData.amountExcludingGST,
      gstAmount: initialData.gstAmount,
      orderNumber: initialData.orderNumber,
      status: initialData.status,
      description: '',
      category: '',
    } : {
      billNumber: '',
      billDate: new Date().toISOString().split('T')[0],
      type: 'income',
      amount: 0,
      amountExcludingGST: 0,
      gstAmount: 0,
      orderNumber: '',
      status: 'active',
      description: '',
      category: '',
    }
  })

  const watchAmount = form.watch('amount')
  const watchGST = form.watch('gstAmount')

  // Auto-calculate GST when amount changes
  const handleAmountChange = (amount: number) => {
    const gstRate = 0.18 // 18% GST
    const amountExcludingGST = amount / (1 + gstRate)
    const gstAmount = amount - amountExcludingGST
    
    form.setValue('amountExcludingGST', Number(amountExcludingGST.toFixed(2)))
    form.setValue('gstAmount', Number(gstAmount.toFixed(2)))
  }

  const onFormSubmit = (data: TransactionFormData) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bill Number */}
            <div>
              <label className="block text-sm font-medium mb-2">Bill Number *</label>
              <Input
                {...form.register('billNumber')}
                placeholder="Enter bill number"
              />
              {form.formState.errors.billNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.billNumber.message}
                </p>
              )}
            </div>

            {/* Bill Date */}
            <div>
              <label className="block text-sm font-medium mb-2">Bill Date *</label>
              <Input
                type="date"
                {...form.register('billDate')}
              />
              {form.formState.errors.billDate && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.billDate.message}
                </p>
              )}
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Type *</label>
              <Select 
                value={form.watch('type')} 
                onValueChange={(value: 'income' | 'expense') => form.setValue('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.type.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select 
                value={form.watch('status')} 
                onValueChange={(value: 'active' | 'inactive') => form.setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Order Number */}
          <div>
            <label className="block text-sm font-medium mb-2">Order Number (Optional)</label>
            <Input
              {...form.register('orderNumber')}
              placeholder="Link to order number"
            />
          </div>

          {/* Amount Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Amount */}
            <div>
              <label className="block text-sm font-medium mb-2">Total Amount *</label>
              <Input
                type="number"
                step="0.01"
                {...form.register('amount', { 
                  valueAsNumber: true,
                  onChange: (e) => handleAmountChange(Number(e.target.value))
                })}
                placeholder="0.00"
              />
              {form.formState.errors.amount && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            {/* Amount Excluding GST */}
            <div>
              <label className="block text-sm font-medium mb-2">Amount (Exc. GST)</label>
              <Input
                type="number"
                step="0.01"
                {...form.register('amountExcludingGST', { valueAsNumber: true })}
                placeholder="0.00"
                readOnly
                className="bg-gray-50"
              />
            </div>

            {/* GST Amount */}
            <div>
              <label className="block text-sm font-medium mb-2">GST Amount</label>
              <Input
                type="number"
                step="0.01"
                {...form.register('gstAmount', { valueAsNumber: true })}
                placeholder="0.00"
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <Select 
              value={form.watch('category') || ''} 
              onValueChange={(value: string) => form.setValue('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="advertising">Advertising</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="supplies">Supplies</SelectItem>
                <SelectItem value="services">Services</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              {...form.register('description')}
              placeholder="Enter transaction description..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Transaction' : 'Create Transaction'}
        </Button>
      </div>
    </form>
  )
}
