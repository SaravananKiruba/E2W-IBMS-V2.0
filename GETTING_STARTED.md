# IBMS - Getting Started Guide

Welcome to IBMS (Intelligent Business Management Software) v2.0! This guide will help you set up and run the application locally.

## 🚦 Quick Setup Checklist

### Prerequisites Check
- [ ] **Node.js 18+** installed ([Download here](https://nodejs.org/))
- [ ] **PHP 8.1+** with required extensions
- [ ] **MySQL 8.0+** server running
- [ ] **Composer** installed ([Download here](https://getcomposer.org/))
- [ ] **XAMPP** or similar local server stack (recommended)

### Installation Steps

#### 1. Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
composer install
cd ..
```

#### 2. Database Setup
1. Start your MySQL server (via XAMPP or standalone)
2. Import the provided SQL files:
   - `baleeed5_easy2work.sql`
   - `baleeed5_gracescans.sql`
   - `baleeed5_live.sql`
   - `baleeed5_test_e2w.sql`
3. Run the migration file: `backend/database/migrations.sql`

#### 3. Configuration
1. Copy and configure environment files:
   - `.env.local` (already created)
   - `backend/.env` (already created)

#### 4. Run the Application

**Terminal 1 - Backend API:**
```bash
cd backend
php -S localhost:8000 -t public
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

#### 5. Access the Application
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **Default Login**: http://localhost:3000/test/login

## 🎯 Available Tenants

| Tenant | URL | Database |
|--------|-----|----------|
| Test | http://localhost:3000/test | baleeed5_test_e2w |
| Easy2Work | http://localhost:3000/easy2work | baleeed5_easy2work |
| Grace Scans | http://localhost:3000/gracescans | baleeed5_gracescans |
| Live | http://localhost:3000/live | baleeed5_live |

## 🔑 Test Credentials

For testing, you can use these credentials on any tenant:
- **Username**: admin
- **Password**: password

## 📱 Application Features

### Core Modules
- ✅ **Dashboard** - Business metrics and analytics
- ✅ **Clients** - Customer relationship management
- ✅ **Orders** - Order processing and tracking
- ✅ **Finance** - Financial management and reporting
- ✅ **Rates** - Dynamic pricing management
- ✅ **Reports** - Comprehensive business reports
- ✅ **Settings** - Application configuration

### Technical Features
- ✅ **Multi-tenant Architecture** - Separate databases per tenant
- ✅ **Responsive Design** - Mobile and desktop optimized
- ✅ **PWA Support** - Progressive Web App capabilities
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Real-time Data** - Live updates and notifications
- ✅ **Modern UI/UX** - Clean, intuitive interface

## 🔧 Development Tools

### Frontend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Backend Commands
```bash
cd backend
php -S localhost:8000 -t public    # Start dev server
composer install                   # Install dependencies
composer update                    # Update dependencies
```

## 🐛 Troubleshooting

### Common Issues

#### "Connection refused" or API errors
- Ensure MySQL server is running
- Check database credentials in `backend/.env`
- Verify PHP extensions are installed

#### "Module not found" errors
- Run `npm install` in the root directory
- Run `composer install` in the backend directory

#### "Permission denied" errors
- Check file permissions on backend directory
- Ensure PHP has write permissions for logs/cache

#### Database connection issues
- Verify MySQL is running on port 3306
- Check database names match environment config
- Ensure databases are properly imported

### Getting Help
If you encounter issues:
1. Check the console for error messages
2. Verify all prerequisites are installed
3. Ensure environment files are configured correctly
4. Check if all services are running (MySQL, PHP, Node.js)

## 🚀 Next Steps

Once the application is running:

1. **Explore the Dashboard** - Get familiar with the main interface
2. **Add Test Data** - Create sample clients and orders
3. **Test Features** - Try different modules and functionality
4. **Configure Settings** - Customize the application settings
5. **Generate Reports** - Explore the reporting features

## 📚 Documentation

- **README.md** - Comprehensive project documentation
- **API Documentation** - Available in the codebase comments
- **Component Documentation** - TypeScript definitions in `/src/types`

---

**Happy coding with IBMS v2.0!** 🎉

For questions or support, check the main README.md file or contact the development team.
