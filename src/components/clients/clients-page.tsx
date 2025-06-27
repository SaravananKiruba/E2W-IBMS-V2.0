'use client'

import { useState } from 'react'
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/hooks/use-clients'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react'
import { formatDate, getStatusColor } from '@/lib/utils'
import type { Client, ClientFormData } from '@/types'
import { ClientForm } from './client-form'

interface ClientsPageProps {
  tenant: string
}

export function ClientsPage({ tenant }: ClientsPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { data: clientsData, isLoading } = useClients({
    search: searchQuery,
    page: 1,
    limit: 50,
  })

  const createClientMutation = useCreateClient()
  const updateClientMutation = useUpdateClient()
  const deleteClientMutation = useDeleteClient()

  const handleCreateClient = async (data: ClientFormData) => {
    await createClientMutation.mutateAsync(data)
    setIsCreateDialogOpen(false)
  }

  const handleUpdateClient = async (data: Partial<ClientFormData>) => {
    if (!selectedClient) return
    await updateClientMutation.mutateAsync({ id: selectedClient.id, data })
    setIsEditDialogOpen(false)
    setSelectedClient(null)
  }

  const handleDeleteClient = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      await deleteClientMutation.mutateAsync(id)
    }
  }

  const columns = [
    {
      accessorKey: 'clientName',
      header: 'Client Name',
      cell: ({ row }: any) => {
        const client = row.original as Client
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {client.clientName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {client.clientName}
              </div>
              <div className="text-sm text-gray-500">
                {client.title && `${client.title} • `}ID: {client.id}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
      cell: ({ row }: any) => {
        const client = row.original as Client
        return (
          <div className="space-y-1">
            <div className="flex items-center text-sm text-gray-900">
              <Phone className="h-3 w-3 mr-1" />
              {client.clientContact}
            </div>
            {client.clientEmail && (
              <div className="flex items-center text-sm text-gray-500">
                <Mail className="h-3 w-3 mr-1" />
                {client.clientEmail}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }: any) => {
        const client = row.original as Client
        return client.address ? (
          <div className="flex items-start text-sm text-gray-500">
            <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{client.address}</span>
          </div>
        ) : (
          <span className="text-gray-400">No address</span>
        )
      },
    },
    {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ row }: any) => {
        const client = row.original as Client
        return client.source ? (
          <Badge variant="outline" className="text-xs">
            {client.source}
          </Badge>
        ) : null
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const client = row.original as Client
        return (
          <Badge className={getStatusColor(client.status)}>
            {client.status}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'entryDate',
      header: 'Created',
      cell: ({ row }: any) => {
        const client = row.original as Client
        return (
          <div className="text-sm text-gray-500">
            {formatDate(client.entryDate)}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const client = row.original as Client
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedClient(client)
                setIsEditDialogOpen(true)
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClient(client.id)}
              disabled={deleteClientMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">Manage your client database</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <ClientForm
              onSubmit={handleCreateClient}
              isLoading={createClientMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Client Directory</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={clientsData?.data || []}
            searchKey="clientName"
            searchPlaceholder="Search clients..."
          />
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <ClientForm
              initialData={selectedClient}
              onSubmit={handleUpdateClient}
              isLoading={updateClientMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
