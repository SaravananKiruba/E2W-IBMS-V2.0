'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  User, Phone, Mail, MapPin, Calendar, FileText, 
  CreditCard, Package, Truck, DollarSign, Download,
  Edit, Trash2, Check, X
} from 'lucide-react'
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils'
import type { Order } from '@/types'

interface OrderDetailsProps {
  order: Order
  onClose: () => void
  onEdit?: () => void
  onDelete?: () => void
  onUpdateStatus?: (status: string) => void
}

export function OrderDetails({ 
  order, 
  onClose, 
  onEdit, 
  onDelete, 
  onUpdateStatus 
}: OrderDetailsProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const handleStatusUpdate = async (newStatus: string) => {
    if (onUpdateStatus) {
      setIsUpdatingStatus(true)
      try {
        await onUpdateStatus(newStatus)
      } finally {
        setIsUpdatingStatus(false)
      }
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default'
      case 'partial': return 'secondary'
      case 'unpaid': return 'destructive'
      default: return 'outline'
    }
  }

  const calculateItemTotal = (item: any) => {
    const baseAmount = item.quantity * item.ratePerUnit
    const discountAmount = item.discountAmount || 0
    const amountAfterDiscount = baseAmount - discountAmount
    const gstAmount = (amountAfterDiscount * parseFloat(item.gstPercentage)) / 100
    return amountAfterDiscount + gstAmount
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Order #{order.orderNumber}</h2>
          <p className="text-gray-600">Created on {formatDate(order.entryDate)}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusColor(order.status) as any} className="text-sm">
            {order.status}
          </Badge>
          <Badge variant={getPaymentStatusColor(order.paymentStatus) as any} className="text-sm">
            {order.paymentStatus}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium">{order.clientName}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <span>{order.clientContact}</span>
              </div>
              {order.clientEmail && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{order.clientEmail}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Order Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{item.adMedium} - {item.adType}</h4>
                        <p className="text-sm text-gray-600">{item.adCategory}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(calculateItemTotal(item))}</div>
                        <div className="text-xs text-gray-500">
                          {item.quantity} × {formatCurrency(item.ratePerUnit)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Quantity:</span>
                        <div className="font-medium">{item.quantity} {item.units}</div>
                      </div>
                      {item.width && (
                        <div>
                          <span className="text-gray-500">Width:</span>
                          <div className="font-medium">{item.width}</div>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">GST:</span>
                        <div className="font-medium">{item.gstPercentage}%</div>
                      </div>
                      {item.discountAmount && item.discountAmount > 0 && (
                        <div>
                          <span className="text-gray-500">Discount:</span>
                          <div className="font-medium">{formatCurrency(item.discountAmount)}</div>
                        </div>
                      )}
                    </div>

                    {item.dateOfRelease && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">Release Date:</span>
                        <span className="ml-2">{formatDate(item.dateOfRelease)}</span>
                      </div>
                    )}

                    {item.remarks && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">Remarks:</span>
                        <p className="mt-1 text-gray-700">{item.remarks}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          {order.remarks && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Order Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{order.remarks}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {onEdit && (
                <Button onClick={onEdit} className="w-full" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Order
                </Button>
              )}
              
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
              
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              
              {onDelete && (
                <Button 
                  onClick={onDelete} 
                  className="w-full" 
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Order
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Status Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['pending', 'processing', 'completed', 'cancelled'].map((status) => (
                <Button
                  key={status}
                  variant={order.status === status ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleStatusUpdate(status)}
                  disabled={isUpdatingStatus || order.status === status}
                >
                  {order.status === status ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <div className="h-4 w-4 mr-2" />
                  )}
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>GST:</span>
                <span>{formatCurrency(order.gstAmount)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Discount:</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>{formatCurrency(order.netAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Paid:</span>
                <span className="text-green-600">{formatCurrency(order.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Balance:</span>
                <span className="text-red-600">{formatCurrency(order.balanceAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Delivery Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <span className="text-sm font-medium capitalize">{order.orderType}</span>
              </div>
              {order.deliveryDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Expected:</span>
                  <span className="text-sm font-medium">{formatDate(order.deliveryDate)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Entry User:</span>
                <span className="text-sm font-medium">{order.entryUser}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}
