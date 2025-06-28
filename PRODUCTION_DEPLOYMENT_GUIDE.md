# IBMS v2.0 - Production Deployment Guide

## Overview
IBMS (Intelligent Business Management Software) v2.0 is now feature-complete and ready for production deployment. This guide covers all aspects of deploying, configuring, and maintaining the system.

## ✅ Feature Completion Status

### Core Modules (100% Complete)
- **Authentication & Multi-tenant**: JWT-based auth with tenant isolation
- **Dashboard**: Real-time analytics, KPIs, and activity feeds
- **Client Management**: Complete CRM with search, filtering, and CRUD operations
- **Order Management**: Full order lifecycle with status tracking and items
- **Finance Management**: Transactions, payments, GST calculations, reporting
- **Rate Management**: Dynamic pricing with quantity-based calculations
- **Reports**: Comprehensive reporting with export capabilities
- **Settings**: System configuration and user preferences

### Advanced Modules (100% Complete)
- **Lead Management**: Lead tracking, conversion pipeline, activity logging
- **Queue Management**: Customer queue system with real-time updates
- **Appointment Scheduling**: Calendar integration with booking management
- **Employee Management**: HR module with roles, performance tracking
- **Consultant Management**: External consultant tracking and management
- **Notification System**: Multi-channel notifications (email, SMS, push)
- **Communication Channels**: Email/SMS provider management and templates
- **Advanced Analytics**: Business intelligence with trends and insights
- **Document & PDF Generation**: Template management and PDF creation
- **Security & Compliance**: Audit trails, access control, compliance tracking

### Infrastructure (100% Complete)
- **PWA Features**: Offline support, install prompts, service worker
- **Component Library**: 20+ reusable UI components with TypeScript
- **Testing Framework**: Frontend (Jest) and backend (PHPUnit) setup
- **Utilities**: 50+ utility functions for business logic
- **Performance**: Image optimization, caching, lazy loading

## 🚀 Deployment Instructions

### Prerequisites
- Node.js 18+ and npm
- PHP 8.1+ with extensions: pdo, pdo_mysql, mbstring, openssl
- MySQL 8.0+
- Web server (Apache/Nginx)
- SSL certificate for production

### Frontend Deployment

#### Option 1: Vercel (Recommended)
```bash
# 1. Build the project
npm install
npm run build

# 2. Deploy to Vercel
npx vercel --prod

# 3. Configure environment variables in Vercel dashboard
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api
NEXT_PUBLIC_APP_NAME=IBMS
NEXT_PUBLIC_APP_VERSION=2.0.0
```

#### Option 2: Static Hosting (Netlify, GitHub Pages)
```bash
# 1. Build for static export
npm run build
npm run export

# 2. Upload the 'out' directory to your hosting provider
```

#### Option 3: Self-hosted
```bash
# 1. Build the project
npm install
npm run build

# 2. Start production server
npm start

# 3. Configure reverse proxy (Nginx example)
server {
    listen 80;
    server_name your-domain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Backend Deployment

#### Shared Hosting
```bash
# 1. Upload backend folder to public_html/api
# 2. Install dependencies
cd api && composer install --no-dev --optimize-autoloader

# 3. Configure .htaccess
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials
```

#### VPS/Dedicated Server
```bash
# 1. Clone repository
git clone <repository-url>
cd backend

# 2. Install dependencies
composer install --no-dev --optimize-autoloader

# 3. Configure Apache/Nginx virtual host
# Apache example:
<VirtualHost *:80>
    ServerName api.your-domain.com
    DocumentRoot /path/to/backend/public
    Directory /path/to/backend/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>

# 4. Configure SSL with Let's Encrypt
certbot --apache -d api.your-domain.com
```

### Database Setup

```sql
-- 1. Create databases for each tenant
CREATE DATABASE baleeed5_easy2work;
CREATE DATABASE baleeed5_gracescans;
CREATE DATABASE baleeed5_live;
CREATE DATABASE baleeed5_test_e2w;

-- 2. Create database user
CREATE USER 'ibms_user'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON baleeed5_* TO 'ibms_user'@'%';
FLUSH PRIVILEGES;

-- 3. Import base schema
mysql -u ibms_user -p baleeed5_easy2work < backend/database/migrations.sql
mysql -u ibms_user -p baleeed5_gracescans < backend/database/migrations.sql
mysql -u ibms_user -p baleeed5_live < backend/database/migrations.sql
mysql -u ibms_user -p baleeed5_test_e2w < backend/database/migrations.sql

-- 4. Import security tables
mysql -u ibms_user -p baleeed5_easy2work < backend/database/security_tables.sql
mysql -u ibms_user -p baleeed5_gracescans < backend/database/security_tables.sql
mysql -u ibms_user -p baleeed5_live < backend/database/security_tables.sql
mysql -u ibms_user -p baleeed5_test_e2w < backend/database/security_tables.sql
```

## ⚙️ Configuration

### Environment Variables

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
NEXT_PUBLIC_APP_NAME="Your Company IBMS"
NEXT_PUBLIC_APP_VERSION=2.0.0
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

#### Backend (.env)
```bash
DB_HOST=localhost
DB_NAME=baleeed5_{tenant}
DB_USER=ibms_user
DB_PASS=secure_password

JWT_SECRET=your-256-bit-secret
JWT_EXPIRES_IN=24h

MAIL_HOST=smtp.your-provider.com
MAIL_PORT=587
MAIL_USERNAME=your-email@domain.com
MAIL_PASSWORD=your-email-password

SMS_PROVIDER=twilio
SMS_ACCOUNT_SID=your-twilio-sid
SMS_AUTH_TOKEN=your-twilio-token

ENCRYPTION_KEY=your-32-character-encryption-key
```

### System Configuration

1. **Access the settings module** at `/your-tenant/settings`
2. **Configure company information**:
   - Company name, email, phone, address
   - Timezone, currency, date format
   - Fiscal year start date

3. **Set up branding**:
   - Upload company logo
   - Set primary and secondary colors
   - Configure login background

4. **Configure security**:
   - Password policy requirements
   - Session timeout settings
   - Two-factor authentication

5. **Enable features**:
   - Toggle modules based on business needs
   - Enable experimental features as needed

## 🔒 Security Checklist

### Server Security
- [ ] SSL certificate installed and configured
- [ ] HTTP to HTTPS redirect enabled
- [ ] Security headers configured (HSTS, CSP, X-Frame-Options)
- [ ] Database access restricted to application server
- [ ] File upload restrictions in place
- [ ] Server software updated (PHP, MySQL, Apache/Nginx)

### Application Security
- [ ] Strong JWT secret configured
- [ ] Database credentials secured
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled
- [ ] Input validation and sanitization active
- [ ] Error messages don't expose sensitive information

### Access Control
- [ ] Default admin password changed
- [ ] User roles and permissions configured
- [ ] Multi-factor authentication enabled for admins
- [ ] Regular security audit logs reviewed
- [ ] Backup access credentials secured

## 📊 Performance Optimization

### Frontend Optimization
```bash
# 1. Enable compression in Next.js config
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false
}

# 2. Optimize images
next/image component used throughout
Image optimization API configured

# 3. Bundle analysis
npm run build && npm run analyze
```

### Backend Optimization
```php
// 1. Enable OPcache in php.ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000

// 2. Database query optimization
// Indexes added to frequently queried columns
// Connection pooling enabled

// 3. Caching strategy
// Redis/Memcached for session storage
// Query result caching implemented
```

### Database Optimization
```sql
-- 1. Add indexes for performance
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_clients_email ON clients(client_email);

-- 2. Regular maintenance
OPTIMIZE TABLE orders, clients, transactions;
ANALYZE TABLE orders, clients, transactions;
```

## 🔄 Backup Strategy

### Automated Backups
```bash
#!/bin/bash
# daily-backup.sh

# Database backup
mysqldump -u ibms_user -p baleeed5_easy2work > /backups/easy2work_$(date +%Y%m%d).sql
mysqldump -u ibms_user -p baleeed5_gracescans > /backups/gracescans_$(date +%Y%m%d).sql

# File backup
tar -czf /backups/files_$(date +%Y%m%d).tar.gz /path/to/uploaded/files

# Retention policy (keep 30 days)
find /backups -name "*.sql" -mtime +30 -delete
find /backups -name "*.tar.gz" -mtime +30 -delete
```

### Backup Verification
```bash
#!/bin/bash
# verify-backup.sh

# Test database restore
mysql -u ibms_user -p test_restore < /backups/easy2work_$(date +%Y%m%d).sql

# Verify file integrity
tar -tzf /backups/files_$(date +%Y%m%d).tar.gz > /dev/null

echo "Backup verification completed"
```

## 📈 Monitoring & Maintenance

### Health Checks
```bash
# Create health check endpoint
curl https://api.your-domain.com/health
# Expected response: {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}

# Monitor key metrics
- Response time < 200ms
- Database connections < 80% of limit
- Disk usage < 85%
- Memory usage < 90%
```

### Log Management
```bash
# Configure log rotation
/var/log/ibms/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 www-data www-data
}

# Monitor error logs
tail -f /var/log/apache2/error.log | grep -i "ibms"
tail -f /var/log/php/error.log | grep -i "ibms"
```

### Update Procedure
```bash
# 1. Backup current version
./backup-system.sh

# 2. Test updates in staging
git pull origin main
composer install --no-dev
npm install && npm run build

# 3. Deploy to production
./deploy-production.sh

# 4. Verify deployment
./health-check.sh

# 5. Monitor for issues
tail -f /var/log/ibms/app.log
```

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check database service
systemctl status mysql

# Test connection
mysql -u ibms_user -p -h localhost

# Check firewall
ufw status | grep 3306
```

#### Frontend Build Errors
```bash
# Clear cache
rm -rf .next node_modules package-lock.json
npm install
npm run build

# Check environment variables
cat .env.local
```

#### API Errors
```bash
# Check PHP error log
tail -f /var/log/php/error.log

# Verify file permissions
chown -R www-data:www-data /path/to/backend
chmod -R 755 /path/to/backend

# Test API endpoint
curl -X GET https://api.your-domain.com/health
```

### Emergency Contacts
- **System Administrator**: admin@your-domain.com
- **Database Administrator**: dba@your-domain.com  
- **Security Team**: security@your-domain.com

## 📞 Support & Documentation

### Resources
- **API Documentation**: https://api.your-domain.com/docs
- **User Manual**: `/docs/user-manual.pdf`
- **Developer Guide**: `/docs/developer-guide.md`
- **Change Log**: `/CHANGELOG.md`

### Getting Help
1. Check the troubleshooting guide above
2. Review application logs for error details
3. Contact support with specific error messages
4. Provide system information and reproduction steps

---

**IBMS v2.0** - Built with ❤️ for modern businesses
*Last updated: December 2024*
