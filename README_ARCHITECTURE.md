# IBMS v2.0 - Modern Clean Architecture Implementation

## 🚀 Overview

This is a complete rewrite of the Easy2Work CRM system using modern web technologies and clean architecture principles. The system is designed to be:

- **Multi-tenant**: Supports multiple business entities with separate databases
- **Scalable**: Built with modern React patterns and TypeScript
- **Maintainable**: Clean separation of concerns and proper error handling
- **User-friendly**: Modern UI with responsive design and accessibility

## 🏗️ Architecture

### Frontend Stack
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Query** for server state management
- **Zustand** for client state management
- **React Hook Form** with Zod validation
- **Radix UI** components for accessibility

### Backend Stack
- **PHP 8+** with Slim Framework
- **MySQL** with multi-tenant architecture
- **JWT** authentication
- **RESTful APIs** with proper error handling

### Database Architecture
```
├── baleeed5_easy2work (Main tenant)
├── baleeed5_gracescans (Grace Scans tenant)
├── baleeed5_live (Production environment)
└── baleeed5_test_e2w (Test environment)
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── [tenant]/          # Tenant-specific routes
│   │   ├── dashboard/     # Dashboard pages
│   │   ├── clients/       # Client management
│   │   ├── orders/        # Order management
│   │   ├── finance/       # Financial tracking
│   │   └── reports/       # Reporting system
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   ├── dashboard/        # Dashboard-specific components
│   ├── clients/          # Client management components
│   └── providers/        # React context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── types/                # TypeScript type definitions
└── styles/               # Global styles
```

## 🎨 Key Features Implemented

### ✅ Core Infrastructure
- [x] Multi-tenant routing system
- [x] Modern UI component library
- [x] React Query integration
- [x] TypeScript type safety
- [x] Error handling and toast notifications
- [x] Loading states and animations

### ✅ Authentication System
- [x] JWT-based authentication
- [x] Token refresh mechanism
- [x] Protected routes
- [x] Multi-tenant login

### ✅ Client Management
- [x] Modern data table with sorting/filtering
- [x] Client CRUD operations
- [x] Form validation with Zod
- [x] Search functionality
- [x] Status management

### ✅ Dashboard
- [x] Real-time statistics
- [x] Revenue charts
- [x] Recent activity feed
- [x] Top clients overview

### ✅ API Layer
- [x] Centralized API client
- [x] Request/response interceptors
- [x] Error handling
- [x] Loading states
- [x] Caching strategies

## 🔧 Modern Patterns Used

### React Query for Server State
```typescript
export function useClients(filters: QueryFilters = {}) {
  return useQuery({
    queryKey: clientKeys.list(filters),
    queryFn: async () => {
      const response = await clientApi.getAll(filters)
      return response as PaginatedResponse<Client>
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}
```

### Form Handling with React Hook Form + Zod
```typescript
const clientSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  clientContact: z.string().min(1, 'Contact number is required'),
  clientEmail: z.string().email('Invalid email address').optional(),
  // ... more fields
})
```

### Modern UI Components
```typescript
<DataTable
  columns={columns}
  data={clientsData?.data || []}
  searchKey="clientName"
  searchPlaceholder="Search clients..."
/>
```

## 🎯 Benefits Over Previous Implementation

### 1. **Type Safety**
- Complete TypeScript coverage
- Compile-time error detection
- Better IDE support and autocomplete

### 2. **Performance**
- React Query caching and background updates
- Optimized re-renders with proper state management
- Lazy loading and code splitting

### 3. **User Experience**
- Modern, responsive UI
- Real-time feedback with loading states
- Proper error handling and user notifications
- Accessibility support

### 4. **Developer Experience**
- Clean code organization
- Reusable components
- Comprehensive error handling
- Easy to test and maintain

### 5. **Scalability**
- Modular architecture
- Easy to add new features
- Multi-tenant support
- Proper separation of concerns

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PHP 8+
- MySQL 8+
- Composer

### Installation

1. **Install Frontend Dependencies**
```bash
npm install
```

2. **Install Backend Dependencies**
```bash
cd backend
composer install
```

3. **Environment Setup**
```bash
cp .env.example .env
# Configure your database connections
```

4. **Database Migration**
```bash
# Run the migration script
mysql -u root -p < backend/database/migrations.sql
```

5. **Start Development**
```bash
# Frontend
npm run dev

# Backend (separate terminal)
cd backend
php -S localhost:8000 -t public
```

## 🔐 Authentication Flow

1. User accesses `/{tenant}/login`
2. Credentials validated against tenant database
3. JWT tokens issued (access + refresh)
4. Tokens stored in HTTP-only cookies
5. API requests include tenant headers
6. Automatic token refresh on expiry

## 📊 Database Schema

The system maintains separate databases for each tenant with identical schemas:

### Core Tables
- `user_table` - User authentication and profiles
- `client_table` - Client information and contacts
- `order_table` - Orders and order items
- `bill_table` - Financial transactions
- `rate_table` - Pricing and rate cards
- `cart_table` - Shopping cart functionality

## 🎨 UI Components

### Base Components
- `Button` - Multiple variants with loading states
- `Input` - Form inputs with validation
- `Card` - Content containers
- `Badge` - Status indicators
- `DataTable` - Advanced table with sorting/filtering

### Composite Components
- `ClientForm` - Complete client creation/editing
- `DashboardStats` - Statistics overview
- `ClientsPage` - Full client management interface

## 🔄 State Management

### Server State (React Query)
- API data caching
- Background updates
- Optimistic updates
- Error retry logic

### Client State (Zustand)
- UI state management
- User preferences
- Temporary form data

## 📈 Performance Optimizations

- **Code Splitting**: Route-based code splitting
- **Caching**: React Query with stale-while-revalidate
- **Optimistic Updates**: Immediate UI feedback
- **Debounced Search**: Reduced API calls
- **Memoization**: Optimized re-renders

## 🧪 Testing Strategy

- **Unit Tests**: Individual component testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Complete user workflows
- **Type Checking**: Compile-time validation

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
npm start
```

### Backend (Apache/Nginx + PHP-FPM)
```bash
composer install --no-dev --optimize-autoloader
# Configure web server to point to backend/public
```

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Component Library](./docs/components.md)
- [Database Schema](./docs/database.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Use proper component composition
3. Implement proper error handling
4. Add loading states for async operations
5. Follow the established patterns
6. Write tests for new features

## 📝 Next Steps

### Phase 1 (Current)
- [x] Core infrastructure
- [x] Authentication system
- [x] Client management
- [ ] Order management
- [ ] Financial tracking

### Phase 2
- [ ] Advanced reporting
- [ ] Real-time notifications
- [ ] Export functionality
- [ ] Mobile app support

### Phase 3
- [ ] Advanced analytics
- [ ] AI-powered insights
- [ ] Third-party integrations
- [ ] Advanced security features

---

This implementation represents a significant improvement over the previous version with modern patterns, better user experience, and maintainable code architecture.
