'use client'

import { useState } from 'react'
import { 
  FileText, 
  Download, 
  Upload,
  Eye,
  Edit,
  Trash2,
  Share,
  Filter,
  Search,
  Plus,
  FolderPlus,
  FileImage,
  FileSpreadsheet,
  File,
  MoreHorizontal,
  Calendar,
  User,
  Tag,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Archive,
  RefreshCw,
  Settings,
  Mail,
  Printer,
  Copy,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface DocumentsPageProps {
  tenant?: string
}

export function DocumentsPage({ tenant = 'test' }: DocumentsPageProps) {
  const [activeTab, setActiveTab] = useState('documents')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])

  // Mock data - would come from API in real implementation
  const documentStats = {
    totalDocuments: 456,
    totalSize: '2.4 GB',
    recentlyCreated: 23,
    shared: 89,
    templates: 12,
    categories: 8
  }

  const documents = [
    {
      id: '1',
      name: 'Invoice_INV-2024-001.pdf',
      type: 'pdf',
      category: 'Invoices',
      size: '245 KB',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      modifiedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      createdBy: 'John Doe',
      status: 'final',
      tags: ['invoice', 'client-abc', 'q1-2024'],
      isShared: true,
      isStarred: false,
      client: 'ABC Corporation',
      orderNumber: 'ORD-2024-001'
    },
    {
      id: '2',
      name: 'Proposal_Digital_Marketing_XYZ.docx',
      type: 'docx',
      category: 'Proposals',
      size: '1.2 MB',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      modifiedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      createdBy: 'Jane Smith',
      status: 'review',
      tags: ['proposal', 'digital-marketing', 'xyz-corp'],
      isShared: false,
      isStarred: true,
      client: 'XYZ Corporation',
      orderNumber: null
    },
    {
      id: '3',
      name: 'Contract_LMN_Services_2024.pdf',
      type: 'pdf',
      category: 'Contracts',
      size: '890 KB',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      modifiedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      createdBy: 'Mike Wilson',
      status: 'signed',
      tags: ['contract', 'lmn-services', 'annual'],
      isShared: true,
      isStarred: false,
      client: 'LMN Services',
      orderNumber: null
    },
    {
      id: '4',
      name: 'Financial_Report_Q1_2024.xlsx',
      type: 'xlsx',
      category: 'Reports',
      size: '567 KB',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      modifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdBy: 'Sarah Johnson',
      status: 'final',
      tags: ['financial', 'quarterly', 'report'],
      isShared: false,
      isStarred: true,
      client: null,
      orderNumber: null
    }
  ]

  const documentTemplates = [
    {
      id: '1',
      name: 'Invoice Template',
      description: 'Standard invoice template with company branding',
      type: 'pdf',
      category: 'Finance',
      variables: ['client_name', 'invoice_number', 'amount', 'due_date', 'items'],
      usage: 156,
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isActive: true
    },
    {
      id: '2',
      name: 'Project Proposal Template',
      description: 'Comprehensive project proposal with scope and pricing',
      type: 'docx',
      category: 'Sales',
      variables: ['client_name', 'project_title', 'scope', 'timeline', 'budget'],
      usage: 89,
      lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      id: '3',
      name: 'Service Agreement',
      description: 'Standard service agreement template',
      type: 'pdf',
      category: 'Legal',
      variables: ['client_name', 'services', 'terms', 'duration', 'payment_terms'],
      usage: 45,
      lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      id: '4',
      name: 'Monthly Report Template',
      description: 'Monthly performance and analytics report',
      type: 'xlsx',
      category: 'Reports',
      variables: ['month', 'revenue', 'clients', 'projects', 'kpis'],
      usage: 12,
      lastUsed: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      isActive: true
    }
  ]

  const recentActivity = [
    {
      id: '1',
      action: 'created',
      document: 'Invoice_INV-2024-005.pdf',
      user: 'John Doe',
      timestamp: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: '2',
      action: 'shared',
      document: 'Proposal_ABC_Project.docx',
      user: 'Jane Smith',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      id: '3',
      action: 'modified',
      document: 'Contract_XYZ_2024.pdf',
      user: 'Mike Wilson',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  ]

  const categories = [
    { name: 'Invoices', count: 89, color: 'bg-green-100 text-green-800' },
    { name: 'Proposals', count: 67, color: 'bg-blue-100 text-blue-800' },
    { name: 'Contracts', count: 45, color: 'bg-purple-100 text-purple-800' },
    { name: 'Reports', count: 123, color: 'bg-orange-100 text-orange-800' },
    { name: 'Templates', count: 23, color: 'bg-gray-100 text-gray-800' },
    { name: 'Marketing', count: 34, color: 'bg-pink-100 text-pink-800' },
    { name: 'Legal', count: 12, color: 'bg-red-100 text-red-800' },
    { name: 'Misc', count: 63, color: 'bg-yellow-100 text-yellow-800' }
  ]

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return FileText
      case 'docx': 
      case 'doc': return File
      case 'xlsx':
      case 'xls': return FileSpreadsheet
      case 'png':
      case 'jpg':
      case 'jpeg': return FileImage
      default: return File
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'final': return 'bg-green-100 text-green-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'signed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return Plus
      case 'modified': return Edit
      case 'shared': return Share
      case 'downloaded': return Download
      default: return File
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-gray-600">Manage documents, templates, and PDF generation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowTemplateDialog(true)}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Templates
          </Button>
          <Button 
            onClick={() => setShowUploadDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Document
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold">{documentStats.totalDocuments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Size</p>
                <p className="text-2xl font-bold">{documentStats.totalSize}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Recent</p>
                <p className="text-2xl font-bold">{documentStats.recentlyCreated}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Share className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Shared</p>
                <p className="text-2xl font-bold">{documentStats.shared}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="generator">PDF Generator</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                <SelectItem value="pdf">PDF Files</SelectItem>
                <SelectItem value="docx">Word Documents</SelectItem>
                <SelectItem value="xlsx">Excel Files</SelectItem>
                <SelectItem value="shared">Shared</SelectItem>
                <SelectItem value="starred">Starred</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <span className="text-sm">{category.name}</span>
                      <Badge variant="secondary" className={category.color}>
                        {category.count}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Documents List */}
            <div className="lg:col-span-3 space-y-4">
              {documents.map((document) => {
                const FileIcon = getFileIcon(document.type)
                return (
                  <Card key={document.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${document.type === 'pdf' ? 'bg-red-100' : document.type === 'docx' ? 'bg-blue-100' : 'bg-green-100'}`}>
                            <FileIcon className={`h-5 w-5 ${document.type === 'pdf' ? 'text-red-600' : document.type === 'docx' ? 'text-blue-600' : 'text-green-600'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{document.name}</h3>
                              {document.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                              {document.isShared && <Share className="h-4 w-4 text-blue-500" />}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className={getStatusColor(document.status)}>
                                {document.status}
                              </Badge>
                              <Badge variant="secondary">{document.category}</Badge>
                              <span className="text-sm text-gray-500">{document.size}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                              <span>Created: {document.createdAt.toLocaleDateString()}</span>
                              <span>•</span>
                              <span>By: {document.createdBy}</span>
                              {document.client && (
                                <>
                                  <span>•</span>
                                  <span>Client: {document.client}</span>
                                </>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {document.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Document Templates</h2>
            <Button onClick={() => setShowTemplateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-base">{template.name}</span>
                    <Badge variant="outline">{template.category}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{template.description}</p>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Variables:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable) => (
                        <code key={variable} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {`{${variable}}`}
                        </code>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Usage:</span>
                      <span>{template.usage} times</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Used:</span>
                      <span>{template.lastUsed.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" className="flex-1">
                      <FileText className="h-4 w-4 mr-1" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* PDF Generator Tab */}
        <TabsContent value="generator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>PDF Document Generator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Document Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="quotation">Quotation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Template</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Template</SelectItem>
                      <SelectItem value="modern">Modern Template</SelectItem>
                      <SelectItem value="minimal">Minimal Template</SelectItem>
                      <SelectItem value="branded">Branded Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Client Information</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abc-corp">ABC Corporation</SelectItem>
                      <SelectItem value="xyz-services">XYZ Services</SelectItem>
                      <SelectItem value="lmn-industries">LMN Industries</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select order (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ord-001">ORD-2024-001</SelectItem>
                      <SelectItem value="ord-002">ORD-2024-002</SelectItem>
                      <SelectItem value="ord-003">ORD-2024-003</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Document Title</label>
                <Input placeholder="Enter document title" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Additional Notes</label>
                <Textarea 
                  placeholder="Enter any additional notes or custom content..."
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-4">
                <Button className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate PDF
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Generate & Email
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Invoice from Order
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <File className="h-4 w-4 mr-2" />
                  Create Proposal from Template
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export Financial Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Printer className="h-4 w-4 mr-2" />
                  Bulk Print Documents
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Generations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Invoice_INV-2024-005.pdf</span>
                  <span className="text-gray-500">2 min ago</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Proposal_ABC_Project.pdf</span>
                  <span className="text-gray-500">1 hour ago</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Contract_XYZ_2024.pdf</span>
                  <span className="text-gray-500">3 hours ago</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Monthly_Report_Jan.pdf</span>
                  <span className="text-gray-500">1 day ago</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Document Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const ActionIcon = getActionIcon(activity.action)
                  return (
                    <div key={activity.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <ActionIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {activity.user} {activity.action} {activity.document}
                        </p>
                        <p className="text-sm text-gray-500">{activity.timestamp.toLocaleString()}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
              <p className="text-sm text-gray-500">Support for PDF, DOC, XLS, and image files</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invoices">Invoices</SelectItem>
                    <SelectItem value="proposals">Proposals</SelectItem>
                    <SelectItem value="contracts">Contracts</SelectItem>
                    <SelectItem value="reports">Reports</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Client (Optional)</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="abc-corp">ABC Corporation</SelectItem>
                    <SelectItem value="xyz-services">XYZ Services</SelectItem>
                    <SelectItem value="lmn-industries">LMN Industries</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <Input placeholder="Enter tags separated by commas" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea placeholder="Enter document description..." rows={3} />
            </div>

            <div className="flex items-center gap-2">
              <Button className="flex-1">Upload Document</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
