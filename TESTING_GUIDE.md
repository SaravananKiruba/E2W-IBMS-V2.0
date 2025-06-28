# IBMS Testing Guide

This document provides comprehensive testing instructions for the IBMS (Intelligent Business Management Software) system.

## Testing Stack

### Frontend Testing
- **Jest** - JavaScript testing framework
- **React Testing Library** - React component testing utilities
- **TypeScript** - Type checking and compilation
- **User Event** - User interaction simulation

### Backend Testing
- **PHPUnit** - PHP testing framework
- **SQLite** - In-memory database for testing
- **Mockery** - PHP mocking framework (optional)

## Setup Testing Environment

### Frontend Setup

1. **Install Testing Dependencies**
```bash
npm install --save-dev @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest babel-jest jest jest-environment-jsdom
```

2. **Run Tests**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Backend Setup

1. **Install Testing Dependencies**
```bash
cd backend
composer install --dev
```

2. **Run Tests**
```bash
# Run all tests
composer test

# Run tests with coverage
./vendor/bin/phpunit --coverage-html coverage

# Run specific test
./vendor/bin/phpunit tests/SecurityServiceTest.php
```

## Test Structure

### Frontend Test Files

```
src/
├── components/
│   ├── ui/
│   │   └── __tests__/
│   │       ├── button.test.tsx
│   │       ├── input.test.tsx
│   │       └── card.test.tsx
│   ├── clients/
│   │   └── __tests__/
│   │       ├── client-form.test.tsx
│   │       └── clients-page.test.tsx
│   └── security/
│       └── __tests__/
│           └── security-page.test.tsx
├── hooks/
│   └── __tests__/
│       ├── use-auth.test.ts
│       ├── use-clients.test.ts
│       └── use-security.test.ts
└── lib/
    └── __tests__/
        ├── utils.test.ts
        └── security-utils.test.ts
```

### Backend Test Files

```
backend/
├── tests/
│   ├── Unit/
│   │   ├── Services/
│   │   │   ├── AuthServiceTest.php
│   │   │   ├── ClientServiceTest.php
│   │   │   ├── SecurityServiceTest.php
│   │   │   └── FinanceServiceTest.php
│   │   └── Controllers/
│   │       ├── AuthControllerTest.php
│   │       ├── ClientControllerTest.php
│   │       └── SecurityControllerTest.php
│   ├── Integration/
│   │   ├── AuthenticationTest.php
│   │   ├── ClientManagementTest.php
│   │   └── SecurityTest.php
│   └── Feature/
│       ├── DashboardTest.php
│       ├── OrderManagementTest.php
│       └── ComplianceTest.php
└── phpunit.xml
```

## Writing Tests

### Frontend Component Tests

```typescript
// Example: Button Component Test
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await user.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByText('Loading')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Frontend Hook Tests

```typescript
// Example: Custom Hook Test
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useClients } from '../use-clients'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useClients Hook', () => {
  it('fetches clients successfully', async () => {
    const { result } = renderHook(() => useClients(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeDefined()
  })
})
```

### Backend Service Tests

```php
// Example: Service Test
<?php

use PHPUnit\Framework\TestCase;
use App\Services\ClientService;

class ClientServiceTest extends TestCase
{
    private ClientService $clientService;

    protected function setUp(): void
    {
        $this->clientService = new ClientService();
    }

    public function testGetAllClients(): void
    {
        $tenant = 'test';
        $filters = ['status' => 'active'];
        
        $clients = $this->clientService->getAll($tenant, $filters);
        
        $this->assertIsArray($clients);
        $this->assertArrayHasKey('data', $clients);
        $this->assertArrayHasKey('total', $clients);
    }

    public function testCreateClient(): void
    {
        $tenant = 'test';
        $clientData = [
            'clientName' => 'Test Client',
            'clientContact' => '1234567890',
            'clientEmail' => 'test@example.com'
        ];
        
        $clientId = $this->clientService->create($tenant, $clientData);
        
        $this->assertIsInt($clientId);
        $this->assertGreaterThan(0, $clientId);
    }
}
```

### Backend Controller Tests

```php
// Example: Controller Test
<?php

use PHPUnit\Framework\TestCase;
use Slim\Psr7\Factory\ServerRequestFactory;
use Slim\Psr7\Factory\ResponseFactory;
use App\Controllers\ClientController;

class ClientControllerTest extends TestCase
{
    private ClientController $controller;

    protected function setUp(): void
    {
        $this->controller = new ClientController();
    }

    public function testGetClientsEndpoint(): void
    {
        $request = (new ServerRequestFactory())->createServerRequest('GET', '/api/clients')
            ->withHeader('X-Tenant', 'test');
        $response = (new ResponseFactory())->createResponse();
        
        $response = $this->controller->getAll($request, $response, []);
        
        $this->assertEquals(200, $response->getStatusCode());
        
        $body = json_decode((string)$response->getBody(), true);
        $this->assertTrue($body['success']);
        $this->assertArrayHasKey('data', $body);
    }
}
```

## Test Categories

### Unit Tests
- Test individual functions and methods
- Mock external dependencies
- Fast execution
- High coverage

### Integration Tests
- Test interaction between components
- Test API endpoints with database
- Test service integrations
- Medium execution time

### Feature Tests
- Test complete user workflows
- Test business logic end-to-end
- Test security features
- Slower execution

### Security Tests
- Authentication and authorization
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Data encryption

## Testing Best Practices

### General Guidelines
1. **AAA Pattern**: Arrange, Act, Assert
2. **Single Responsibility**: One test per behavior
3. **Descriptive Names**: Test names should describe the behavior
4. **Independent Tests**: Tests should not depend on each other
5. **Fast Tests**: Keep tests fast and focused

### Frontend Testing
1. **Test User Interactions**: Focus on user behavior
2. **Mock External Dependencies**: Mock API calls and services
3. **Test Accessibility**: Include accessibility testing
4. **Test Error States**: Test loading and error states
5. **Snapshot Testing**: Use sparingly for stable components

### Backend Testing
1. **Database Transactions**: Use database transactions for isolation
2. **Mock External Services**: Mock third-party APIs
3. **Test Edge Cases**: Test boundary conditions
4. **Security Testing**: Test authentication and authorization
5. **Performance Testing**: Test with large datasets

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run type-check

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
      - run: cd backend && composer install
      - run: cd backend && composer test
```

## Test Data Management

### Test Database Setup
```sql
-- Create test database schema
CREATE DATABASE ibms_test;

-- Use separate test data
INSERT INTO user_table (userName, userEmail, userPassword) 
VALUES ('testuser', 'test@example.com', 'hashed_password');
```

### Mock Data Factories
```typescript
// Frontend mock factories
export const createMockClient = (overrides = {}) => ({
  id: 1,
  clientName: 'Test Client',
  clientEmail: 'test@example.com',
  status: 'active',
  ...overrides
})
```

```php
// Backend test factories
class ClientFactory
{
    public static function create(array $attributes = []): array
    {
        return array_merge([
            'clientName' => 'Test Client',
            'clientEmail' => 'test@example.com',
            'clientContact' => '1234567890',
            'status' => 'active'
        ], $attributes);
    }
}
```

## Coverage Requirements

### Minimum Coverage Targets
- **Unit Tests**: 80% coverage
- **Integration Tests**: 70% coverage
- **Critical Paths**: 95% coverage
- **Security Functions**: 100% coverage

### Coverage Reports
```bash
# Frontend coverage
npm run test:coverage
open coverage/lcov-report/index.html

# Backend coverage
cd backend
./vendor/bin/phpunit --coverage-html coverage
open coverage/index.html
```

## Debugging Tests

### Frontend Debugging
```typescript
// Debug test with screen.debug()
import { render, screen } from '@testing-library/react'

test('debug example', () => {
  render(<MyComponent />)
  screen.debug() // Prints current DOM state
})
```

### Backend Debugging
```php
// Debug test with var_dump
public function testDebugExample(): void
{
    $result = $this->service->someMethod();
    var_dump($result); // Debug output
    $this->assertTrue(true);
}
```

## Security Testing Checklist

- [ ] Authentication mechanisms
- [ ] Authorization controls
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Session management
- [ ] Password security
- [ ] Data encryption
- [ ] Audit logging
- [ ] Rate limiting
- [ ] File upload security

## Performance Testing

### Load Testing
```bash
# Use Artillery for API load testing
npm install -g artillery
artillery quick --count 100 --num 10 http://localhost:8000/api/clients
```

### Database Performance
```sql
-- Test query performance
EXPLAIN SELECT * FROM client_table WHERE status = 'active';
```

## Troubleshooting

### Common Issues
1. **Tests timeout**: Increase timeout in Jest config
2. **Database connection errors**: Check test database configuration
3. **Mock issues**: Ensure mocks are properly set up
4. **Type errors**: Run type checking separately

### Getting Help
- Check test logs for detailed error messages
- Use debugging tools and breakpoints
- Review test documentation and examples
- Ask for help in team discussions

---

This testing guide provides a comprehensive foundation for ensuring IBMS quality through automated testing. Regular testing helps maintain code quality, prevent regressions, and ensure security compliance.
