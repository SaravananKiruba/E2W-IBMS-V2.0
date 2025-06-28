import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types
export interface Consultant {
  id: number;
  name: string;
  email: string;
  phone?: string;
  specialization: string;
  hourly_rate: number;
  experience_years: number;
  bio?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  status: 'active' | 'inactive' | 'busy';
  skills: Skill[];
  availability: AvailabilitySlot[];
  recent_projects: Project[];
  avg_rating?: number;
  total_reviews?: number;
  active_projects?: number;
  completed_projects?: number;
  created_at: string;
  updated_at?: string;
}

export interface Skill {
  id: number;
  name: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface AvailabilitySlot {
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time?: string;
  end_time?: string;
  is_available: boolean;
}

export interface Project {
  id: number;
  name: string;
  role: string;
  start_date: string;
  end_date?: string;
  assignment_status: string;
}

export interface ConsultantFilters {
  search?: string;
  status?: string;
  specialization?: string;
  page?: number;
  limit?: number;
}

export interface ConsultantStats {
  by_status: Record<string, number>;
  by_specialization: Record<string, number>;
  hourly_rates: {
    avg_rate: number;
    min_rate: number;
    max_rate: number;
  };
  performance: {
    total_active: number;
    avg_rating: number;
    total_assignments: number;
  };
}

export interface ProjectAssignment {
  consultant_id: number;
  project_id: number;
  role?: string;
  start_date?: string;
  end_date?: string;
  hourly_rate?: number;
  status?: string;
}

// API functions
const consultantApi = {
  getConsultants: async (filters: ConsultantFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    const response = await api.get(`/consultants?${params}`);
    return response.data;
  },

  getConsultant: async (id: number) => {
    const response = await api.get(`/consultants/${id}`);
    return response.data;
  },

  createConsultant: async (data: Partial<Consultant>) => {
    const response = await api.post('/consultants', data);
    return response.data;
  },

  updateConsultant: async (id: number, data: Partial<Consultant>) => {
    const response = await api.put(`/consultants/${id}`, data);
    return response.data;
  },

  deleteConsultant: async (id: number) => {
    const response = await api.delete(`/consultants/${id}`);
    return response.data;
  },

  getConsultantStats: async () => {
    const response = await api.get('/consultants/stats');
    return response.data;
  },

  getConsultantPerformance: async (id: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const response = await api.get(`/consultants/${id}/performance?${params}`);
    return response.data;
  },

  assignProject: async (id: number, assignment: ProjectAssignment) => {
    const response = await api.post(`/consultants/${id}/assign-project`, assignment);
    return response.data;
  },

  updateAvailability: async (id: number, availability: AvailabilitySlot[]) => {
    const response = await api.put(`/consultants/${id}/availability`, { availability });
    return response.data;
  },
};

// Hooks
export const useConsultants = (filters: ConsultantFilters = {}) => {
  return useQuery({
    queryKey: ['consultants', filters],
    queryFn: () => consultantApi.getConsultants(filters),
  });
};

export const useConsultant = (id: number) => {
  return useQuery({
    queryKey: ['consultant', id],
    queryFn: () => consultantApi.getConsultant(id),
    enabled: !!id,
  });
};

export const useConsultantStats = () => {
  return useQuery({
    queryKey: ['consultantStats'],
    queryFn: consultantApi.getConsultantStats,
  });
};

export const useConsultantPerformance = (id: number, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['consultantPerformance', id, startDate, endDate],
    queryFn: () => consultantApi.getConsultantPerformance(id, startDate, endDate),
    enabled: !!id,
  });
};

export const useCreateConsultant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: consultantApi.createConsultant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultants'] });
      queryClient.invalidateQueries({ queryKey: ['consultantStats'] });
    },
  });
};

export const useUpdateConsultant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Consultant> }) =>
      consultantApi.updateConsultant(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['consultants'] });
      queryClient.invalidateQueries({ queryKey: ['consultant', id] });
      queryClient.invalidateQueries({ queryKey: ['consultantStats'] });
    },
  });
};

export const useDeleteConsultant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: consultantApi.deleteConsultant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultants'] });
      queryClient.invalidateQueries({ queryKey: ['consultantStats'] });
    },
  });
};

export const useAssignProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assignment }: { id: number; assignment: ProjectAssignment }) =>
      consultantApi.assignProject(id, assignment),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['consultant', id] });
      queryClient.invalidateQueries({ queryKey: ['consultantPerformance', id] });
    },
  });
};

export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, availability }: { id: number; availability: AvailabilitySlot[] }) =>
      consultantApi.updateAvailability(id, availability),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['consultant', id] });
    },
  });
};
