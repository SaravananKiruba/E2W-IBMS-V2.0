import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface Document {
  id: number;
  name: string;
  description?: string;
  type: 'pdf' | 'document' | 'spreadsheet' | 'image' | 'text' | 'data' | 'other';
  category: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_hash?: string;
  template_id?: number;
  generated_data?: Record<string, any>;
  uploaded_by: number;
  uploaded_by_name?: string;
  download_count?: number;
  last_downloaded?: string;
  shares?: DocumentShare[];
  versions?: DocumentVersion[];
  created_at: string;
  updated_at?: string;
}

export interface DocumentTemplate {
  id: number;
  name: string;
  description?: string;
  type: 'pdf' | 'html' | 'docx';
  category: string;
  content: string;
  variables: string[];
  styles?: Record<string, any>;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at?: string;
}

export interface DocumentShare {
  id: number;
  document_id: number;
  share_token: string;
  shared_with?: string;
  permissions: string[];
  expires_at?: string;
  created_by: number;
  created_at: string;
}

export interface DocumentVersion {
  id: number;
  document_id: number;
  version: number;
  filename: string;
  file_size: number;
  changes?: string;
  created_by: number;
  created_at: string;
}

export interface DocumentFilters {
  search?: string;
  type?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface DocumentStats {
  by_type: Array<{
    type: string;
    count: number;
  }>;
  by_category: Array<{
    category: string;
    count: number;
  }>;
  storage: {
    total_documents: number;
    total_size: number;
    avg_size: number;
  };
  downloads: {
    total_downloads: number;
    avg_downloads_per_doc: number;
    downloaded_documents: number;
  };
  recent_activity: Array<{
    name: string;
    type: string;
    created_at: string;
    uploaded_by: string;
  }>;
}

export interface PDFGenerationRequest {
  template_id: number;
  data: Record<string, any>;
  options?: {
    filename?: string;
    name?: string;
    description?: string;
    category?: string;
    uploaded_by?: number;
  };
}

export interface ShareDocumentRequest {
  shared_with?: string;
  permissions?: string[];
  expires_in_days?: number;
  created_by?: number;
}

// Mock API functions (replace with actual API calls)
const documentApi = {
  getDocuments: async (filters: DocumentFilters = {}) => {
    // Mock data
    const documents: Document[] = [
      {
        id: 1,
        name: 'Client Contract - ABC Corp',
        description: 'Service agreement for ABC Corporation',
        type: 'pdf',
        category: 'contracts',
        filename: 'abc_corp_contract.pdf',
        file_path: '1234567890_abc_corp_contract.pdf',
        file_size: 256000,
        mime_type: 'application/pdf',
        uploaded_by: 1,
        uploaded_by_name: 'John Doe',
        download_count: 5,
        last_downloaded: '2024-01-15 14:30:00',
        created_at: '2024-01-10 09:00:00'
      },
      {
        id: 2,
        name: 'Invoice Template',
        description: 'Standard invoice template',
        type: 'document',
        category: 'templates',
        filename: 'invoice_template.docx',
        file_path: '1234567891_invoice_template.docx',
        file_size: 45000,
        mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploaded_by: 1,
        uploaded_by_name: 'Jane Smith',
        download_count: 12,
        created_at: '2024-01-08 11:15:00'
      },
      {
        id: 3,
        name: 'Monthly Report - January 2024',
        description: 'Generated monthly business report',
        type: 'pdf',
        category: 'reports',
        filename: 'monthly_report_jan_2024.pdf',
        file_path: '1234567892_monthly_report.pdf',
        file_size: 180000,
        mime_type: 'application/pdf',
        template_id: 1,
        uploaded_by: 1,
        uploaded_by_name: 'System',
        download_count: 8,
        created_at: '2024-01-15 08:00:00'
      }
    ];

    // Apply filters (simplified)
    let filteredDocs = documents;
    if (filters.search) {
      filteredDocs = filteredDocs.filter(doc => 
        doc.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(filters.search!.toLowerCase()))
      );
    }
    if (filters.type) {
      filteredDocs = filteredDocs.filter(doc => doc.type === filters.type);
    }
    if (filters.category) {
      filteredDocs = filteredDocs.filter(doc => doc.category === filters.category);
    }

    return {
      documents: filteredDocs,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 10,
        total: filteredDocs.length,
        pages: Math.ceil(filteredDocs.length / (filters.limit || 10))
      }
    };
  },

  getDocument: async (id: number): Promise<Document> => {
    const { documents } = await documentApi.getDocuments();
    const document = documents.find(d => d.id === id);
    if (!document) throw new Error('Document not found');
    
    // Add additional details
    return {
      ...document,
      shares: [
        {
          id: 1,
          document_id: id,
          share_token: 'abc123def456',
          shared_with: 'client@example.com',
          permissions: ['view'],
          expires_at: '2024-02-15 23:59:59',
          created_by: 1,
          created_at: '2024-01-15 10:00:00'
        }
      ],
      versions: [
        {
          id: 1,
          document_id: id,
          version: 1,
          filename: document.filename,
          file_size: document.file_size,
          changes: 'Initial version',
          created_by: document.uploaded_by,
          created_at: document.created_at
        }
      ]
    };
  },

  uploadDocument: async (file: File, metadata: any) => {
    // Mock implementation
    const newDoc: Document = {
      id: Math.floor(Math.random() * 1000) + 100,
      name: metadata.name || file.name.split('.')[0],
      description: metadata.description,
      type: 'other',
      category: metadata.category || 'general',
      filename: file.name,
      file_path: `${Date.now()}_${file.name}`,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: metadata.uploaded_by || 1,
      uploaded_by_name: 'Current User',
      download_count: 0,
      created_at: new Date().toISOString()
    };
    return newDoc;
  },

  generatePDF: async (request: PDFGenerationRequest) => {
    // Mock implementation
    return {
      document_id: Math.floor(Math.random() * 1000) + 200,
      filename: request.options?.filename || 'generated_document.pdf',
      file_size: 150000,
      download_url: `/api/documents/${Math.floor(Math.random() * 1000) + 200}/download`
    };
  },

  downloadDocument: async (id: number) => {
    // Mock implementation - would return file blob in real implementation
    return new Blob(['Mock PDF content'], { type: 'application/pdf' });
  },

  shareDocument: async (id: number, shareRequest: ShareDocumentRequest) => {
    // Mock implementation
    return {
      share_id: Math.floor(Math.random() * 1000) + 1,
      share_token: Math.random().toString(36).substr(2, 16),
      share_url: `/shared/documents/${Math.random().toString(36).substr(2, 16)}`,
      expires_at: shareRequest.expires_in_days ? 
        new Date(Date.now() + shareRequest.expires_in_days * 24 * 60 * 60 * 1000).toISOString() : 
        null
    };
  },

  deleteDocument: async (id: number) => {
    // Mock implementation
    return { success: true };
  },

  getTemplates: async (type?: string, category?: string): Promise<DocumentTemplate[]> => {
    // Mock data
    const templates: DocumentTemplate[] = [
      {
        id: 1,
        name: 'Monthly Report Template',
        description: 'Template for monthly business reports',
        type: 'pdf',
        category: 'reports',
        content: '<h1>Monthly Report - {{month}} {{year}}</h1><p>Revenue: {{revenue}}</p><p>Orders: {{orders}}</p>',
        variables: ['month', 'year', 'revenue', 'orders'],
        styles: { fontSize: 12, fontFamily: 'Arial' },
        is_active: true,
        created_by: 1,
        created_at: '2024-01-01 00:00:00'
      },
      {
        id: 2,
        name: 'Invoice Template',
        description: 'Standard invoice template',
        type: 'pdf',
        category: 'billing',
        content: '<h1>Invoice #{{invoice_number}}</h1><p>Client: {{client_name}}</p><p>Amount: {{amount}}</p>',
        variables: ['invoice_number', 'client_name', 'amount'],
        is_active: true,
        created_by: 1,
        created_at: '2024-01-01 00:00:00'
      },
      {
        id: 3,
        name: 'Contract Template',
        description: 'Service agreement template',
        type: 'pdf',
        category: 'legal',
        content: '<h1>Service Agreement</h1><p>Client: {{client_name}}</p><p>Services: {{services}}</p>',
        variables: ['client_name', 'services', 'start_date', 'end_date'],
        is_active: true,
        created_by: 1,
        created_at: '2024-01-01 00:00:00'
      }
    ];

    let filteredTemplates = templates;
    if (type) {
      filteredTemplates = filteredTemplates.filter(t => t.type === type);
    }
    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }

    return filteredTemplates;
  },

  createTemplate: async (templateData: Partial<DocumentTemplate>) => {
    // Mock implementation
    return {
      id: Math.floor(Math.random() * 1000) + 1,
      ...templateData,
      created_at: new Date().toISOString()
    };
  },

  updateTemplate: async (id: number, templateData: Partial<DocumentTemplate>) => {
    // Mock implementation
    return {
      id,
      ...templateData,
      updated_at: new Date().toISOString()
    };
  },

  deleteTemplate: async (id: number) => {
    // Mock implementation
    return { success: true };
  },

  getDocumentStats: async (startDate?: string, endDate?: string): Promise<DocumentStats> => {
    // Mock data
    return {
      by_type: [
        { type: 'pdf', count: 45 },
        { type: 'document', count: 23 },
        { type: 'spreadsheet', count: 12 },
        { type: 'image', count: 18 },
        { type: 'other', count: 7 }
      ],
      by_category: [
        { category: 'contracts', count: 15 },
        { category: 'reports', count: 28 },
        { category: 'templates', count: 8 },
        { category: 'invoices', count: 22 },
        { category: 'general', count: 32 }
      ],
      storage: {
        total_documents: 105,
        total_size: 15728640, // ~15MB
        avg_size: 149796
      },
      downloads: {
        total_downloads: 423,
        avg_downloads_per_doc: 4.03,
        downloaded_documents: 89
      },
      recent_activity: [
        {
          name: 'Client Contract - XYZ Corp',
          type: 'pdf',
          created_at: '2024-01-15 14:30:00',
          uploaded_by: 'John Doe'
        },
        {
          name: 'Monthly Report - December 2023',
          type: 'pdf',
          created_at: '2024-01-15 09:15:00',
          uploaded_by: 'System'
        },
        {
          name: 'Invoice #2024-001',
          type: 'pdf',
          created_at: '2024-01-14 16:45:00',
          uploaded_by: 'Jane Smith'
        }
      ]
    };
  },
};

// Hooks
export const useDocuments = (filters: DocumentFilters = {}) => {
  return useQuery({
    queryKey: ['documents', filters],
    queryFn: () => documentApi.getDocuments(filters),
  });
};

export const useDocument = (id: number) => {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => documentApi.getDocument(id),
    enabled: !!id,
  });
};

export const useDocumentTemplates = (type?: string, category?: string) => {
  return useQuery({
    queryKey: ['documentTemplates', type, category],
    queryFn: () => documentApi.getTemplates(type, category),
  });
};

export const useDocumentStats = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['documentStats', startDate, endDate],
    queryFn: () => documentApi.getDocumentStats(startDate, endDate),
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, metadata }: { file: File; metadata: any }) =>
      documentApi.uploadDocument(file, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documentStats'] });
    },
  });
};

export const useGeneratePDF = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentApi.generatePDF,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documentStats'] });
    },
  });
};

export const useShareDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, shareRequest }: { id: number; shareRequest: ShareDocumentRequest }) =>
      documentApi.shareDocument(id, shareRequest),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['document', id] });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentApi.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documentStats'] });
    },
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentApi.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTemplates'] });
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DocumentTemplate> }) =>
      documentApi.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTemplates'] });
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentApi.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTemplates'] });
    },
  });
};
