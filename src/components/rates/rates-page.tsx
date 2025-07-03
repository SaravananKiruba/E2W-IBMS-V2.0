'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  FileText,
  Plus,
  Search,
  Tag,
  Pencil, 
  Trash,
  DollarSign,
  AlertTriangle
} from 'lucide-react'

interface RatesPageProps {
  tenant?: string;
}

export function RatesPage({ tenant = 'default' }: RatesPageProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Placeholder data
  const rates = [
    { id: 1, name: 'Standard Rate', description: 'Default pricing for regular clients', basePrice: 5000, unit: 'Per ad' },
    { id: 2, name: 'Premium Package', description: 'Premium service with priority handling', basePrice: 8500, unit: 'Per ad' },
    { id: 3, name: 'Volume Discount', description: 'Discounted rate for bulk orders (5+ ads)', basePrice: 4000, unit: 'Per ad' },
    { id: 4, name: 'Retainer Contract', description: 'Monthly retainer for regular clients', basePrice: 25000, unit: 'Monthly' },
  ]

  return (
    <PageContainer
      title="Rate Cards"
      description="Manage your service pricing and rate cards"
    >
      <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-[260px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search rates..."
              className="pl-8 w-full"
            />
          </div>
          <Button
            className="bg-theme-primary hover:bg-theme-secondary"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add New Rate Card
          </Button>
        </div>

        {/* Rates Table */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-lg text-theme-primary">Available Rate Cards</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="spinner" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Description</TableHead>
                      <TableHead className="text-right">Base Price</TableHead>
                      <TableHead className="hidden sm:table-cell">Unit</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rates.map((rate) => (
                      <TableRow key={rate.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 mr-2 text-theme-primary" />
                            <span>{rate.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{rate.description}</TableCell>
                        <TableCell className="text-right font-medium">
                          <div className="flex items-center justify-end">
                            <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                            <span>{rate.basePrice.toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{rate.unit}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {!isLoading && rates.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertTriangle className="h-8 w-8 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No rate cards found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating your first rate card.</p>
                <div className="mt-6">
                  <Button 
                    size="sm"
                    className="bg-theme-primary hover:bg-theme-secondary"
                  >
                    Create Rate Card
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-theme-primary">Pricing Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Rate cards help standardize your pricing across different services and client tiers. Consider these factors when setting rates:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h3 className="font-medium text-gray-900 mb-2">Market Positioning</h3>
                  <p className="text-sm text-gray-600">
                    Set rates based on your market position, service quality, and target client segment.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h3 className="font-medium text-gray-900 mb-2">Volume Discounts</h3>
                  <p className="text-sm text-gray-600">
                    Offer tiered pricing to incentivize larger orders and long-term commitments.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h3 className="font-medium text-gray-900 mb-2">Seasonal Adjustments</h3>
                  <p className="text-sm text-gray-600">
                    Consider seasonal demand fluctuations when creating promotional rates.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h3 className="font-medium text-gray-900 mb-2">Client Tiers</h3>
                  <p className="text-sm text-gray-600">
                    Develop different rate structures for different types of clients and service levels.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
