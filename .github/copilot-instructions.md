<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# IBMS (Intelligent Business Management Software) - Development Guidelines

## Project Overview
This is a modern full-stack multi-tenant business management system built with:
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, PWA capabilities
- **Backend**: PHP with Slim Framework for RESTful APIs
- **Database**: MySQL with multi-tenant architecture (4 separate databases)
- **Features**: Client management, order processing, financial tracking, reporting

## Architecture Patterns
- **Multi-tenant**: Separate databases per tenant (easy2work, gracescans, live, test)
- **Clean Architecture**: Separation of concerns with proper layering
- **Component-based**: Reusable UI components with TypeScript interfaces
- **API-first**: RESTful APIs with proper error handling and validation

## Coding Standards
- Use TypeScript for all frontend components with proper type definitions
- Follow React hooks pattern and functional components
- Use Tailwind CSS for styling with custom design system
- Implement proper error handling and loading states
- Use React Query for server state management
- Follow PHP PSR standards for backend code

## Database Conventions
- Use prepared statements for all database queries
- Implement proper connection pooling and tenant switching
- Follow consistent naming conventions matching existing schema
- Handle database errors gracefully

## UI/UX Guidelines
- Maintain responsive design for mobile and desktop
- Use consistent color scheme based on tenant branding
- Implement loading skeletons and error boundaries
- Follow accessibility best practices
- Use Heroicons for consistent iconography

## Security Considerations
- Implement JWT-based authentication
- Validate all inputs on both client and server
- Use proper CORS configuration
- Sanitize database queries to prevent SQL injection
- Implement rate limiting and request validation

## Testing Approach
- Write unit tests for business logic
- Implement integration tests for API endpoints
- Use TypeScript for type safety
- Test multi-tenant functionality thoroughly

## Performance Optimization
- Implement proper caching strategies
- Use React Query for efficient data fetching
- Optimize database queries and indexing
- Implement proper error boundaries and fallbacks
