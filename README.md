# IBMS - Intelligent Business Management Software v2.0

A modern, full-stack, multi-tenant business management system built for scalability and efficiency.

## 🚀 Features

- **Multi-tenant Architecture**: Support for multiple clients with separate databases
- **Progressive Web App (PWA)**: Mobile-responsive with offline capabilities
- **Client Management**: Comprehensive customer relationship management
- **Order Processing**: Complete order lifecycle management
- **Financial Tracking**: Revenue, expenses, and financial reporting
- **Real-time Analytics**: Dashboard with live business metrics
- **Role-based Access**: Secure authentication and authorization

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Server state management
- **Zustand** - Client state management
- **PWA** - Progressive Web App capabilities

### Backend
- **PHP 8.1+** - Server-side language
- **Slim Framework** - Lightweight REST API framework
- **JWT Authentication** - Secure token-based auth
- **MySQL** - Multi-tenant database architecture

### Database Structure
- `baleeed5_easy2work` - Easy2Work tenant
- `baleeed5_gracescans` - Grace Scans tenant  
- `baleeed5_live` - Live production environment
- `baleeed5_test_e2w` - Test/development environment

## 📋 Prerequisites

- **XAMPP** (Apache + MySQL + PHP 8.1+)
- **Node.js** 18+ and npm
- **MySQL Workbench** (recommended)
- **VS Code** with recommended extensions

## ⚡ Quick Start

### 1. Environment Setup

1. **Clone and Setup**:
   ```bash
   # Already in your project directory
   cd D:\Easy2Work\IBMS\E2W-IBMS-V2.0
   ```

2. **Frontend Setup**:
   ```bash
   # Install dependencies (already done)
   npm install
   
   # Copy environment file
   cp .env.local.example .env.local
   
   # Edit .env.local with your settings
   ```

3. **Backend Setup**:
   ```bash
   cd backend
   
   # Install PHP dependencies
   composer install
   
   # Copy environment file
   cp .env.example .env
   
   # Edit .env with your database settings
   ```

4. **Database Setup**:
   ```sql
   -- Import your database files using MySQL Workbench or command line
   mysql -u root -p baleeed5_easy2work < ../baleeed5_easy2work.sql
   mysql -u root -p baleeed5_gracescans < ../baleeed5_gracescans.sql
   mysql -u root -p baleeed5_live < ../baleeed5_live.sql
   mysql -u root -p baleeed5_test_e2w < ../baleeed5_test_e2w.sql
   ```

### 2. Development

1. **Start XAMPP**:
   - Start Apache and MySQL services

2. **Start Backend API**:
   ```bash
   cd backend
   php -S localhost:8000 -t public
   # Or use XAMPP Apache with virtual host
   ```

3. **Start Frontend**:
   ```bash
   # In project root
   npm run dev
   ```

4. **Access Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Default tenant: http://localhost:3000/test/dashboard

## 🌐 Multi-Tenant Access

- **Easy2Work**: http://localhost:3000/easy2work/dashboard
- **Grace Scans**: http://localhost:3000/gracescans/dashboard  
- **Live**: http://localhost:3000/live/dashboard
- **Test**: http://localhost:3000/test/dashboard

## 📁 Project Structure

```
E2W-IBMS-V2.0/
├── src/                          # Frontend source
│   ├── app/                      # Next.js App Router
│   │   ├── [tenant]/            # Dynamic tenant routes
│   │   │   ├── dashboard/       # Dashboard pages
│   │   │   ├── clients/         # Client management
│   │   │   ├── orders/          # Order management
│   │   │   └── finance/         # Financial modules
│   │   └── globals.css          # Global styles
│   ├── components/              # Reusable components
│   │   ├── ui/                  # Base UI components
│   │   ├── layout/              # Layout components
│   │   ├── dashboard/           # Dashboard components
│   │   └── providers/           # Context providers
│   ├── lib/                     # Utilities and helpers
│   └── types/                   # TypeScript definitions
├── backend/                     # PHP Backend
│   ├── public/                  # Public web directory
│   ├── src/                     # PHP source code
│   │   ├── Controllers/         # API controllers
│   │   ├── Middleware/          # Custom middleware
│   │   ├── Database/            # Database utilities
│   │   └── Models/              # Data models
│   └── composer.json            # PHP dependencies
├── public/                      # Static assets
│   ├── manifest.json            # PWA manifest
│   └── icons/                   # PWA icons
└── docs/                        # Documentation
```

## 🛠️ Development Commands

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Backend
cd backend
composer install     # Install dependencies
composer test        # Run tests
php -S localhost:8000 -t public  # Start dev server
```

## 🔐 Authentication & Authorization

- **JWT-based authentication**
- **Multi-tenant user management**
- **Role-based access control**
- **Secure API endpoints**

## 📊 Key Modules

### 1. Dashboard
- Real-time business metrics
- Recent activity feed
- Revenue charts and analytics
- Quick action buttons

### 2. Client Management
- Customer profiles and contact info
- Client categorization
- Communication history
- Advanced search and filtering

### 3. Order Management
- Order creation and processing
- Shopping cart functionality
- Invoice generation
- Order status tracking

### 4. Financial Management
- Transaction recording
- Ledger management
- Payment tracking
- Financial reports

### 5. Rate Management
- Dynamic pricing system
- Quantity-based slabs
- Discount management
- Rate validation

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=IBMS
NEXT_PUBLIC_DEFAULT_TENANT=test
```

**Backend (.env)**:
```env
DB_HOST=localhost
DB_USERNAME=root
DB_PASSWORD=
DB_EASY2WORK=baleeed5_easy2work
DB_GRACESCANS=baleeed5_gracescans
DB_LIVE=baleeed5_live
DB_TEST=baleeed5_test_e2w
JWT_SECRET=your-secret-key
```

## 🎨 Theming & Branding

Each tenant has customizable branding:
- Primary/secondary colors
- Company logos
- Custom styling
- Branded PWA icons

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Clients
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `GET /api/clients/{id}` - Get client details
- `PUT /api/clients/{id}` - Update client

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/orders/{id}` - Get order details

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/activity` - Recent activity

## 📱 PWA Features

- **Offline functionality**
- **App-like experience**
- **Push notifications**
- **Background sync**
- **Install prompts**

## 🔒 Security Features

- JWT token authentication
- CORS protection
- Input validation
- SQL injection prevention
- XSS protection
- Rate limiting

## 🧪 Testing

```bash
# Frontend tests
npm test

# Backend tests
cd backend
composer test
```

## 📈 Performance

- **Optimized bundle size**
- **Image optimization**
- **Database query optimization**
- **Caching strategies**
- **Lazy loading**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software for internal use.

## 📞 Support

For support and questions, contact the development team.

---

**IBMS v2.0** - Built with ❤️ for modern business management
