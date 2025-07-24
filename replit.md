# MCP Marketplace & Dashboard

## Overview
This is a full-stack web application for deploying and managing Model Control Protocol (MCP) servers. The platform provides a marketplace where users can browse, discover, and deploy MCP servers with one-click simplicity, along with a dashboard for managing their deployments.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for development and bundling
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Authentication**: Replit OAuth integration

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL storage
- **Authentication**: Replit OIDC/OAuth

### Database Design
The application uses a PostgreSQL database with the following main tables:
- `users` - User profiles and authentication data
- `mcps` - MCP server catalog with metadata
- `deployments` - User deployment instances
- `sessions` - Session storage for authentication

## Key Components

### Authentication System
- Replit OAuth integration for seamless authentication
- Session-based authentication with PostgreSQL storage
- Mandatory user operations for Replit Auth compliance
- Protected routes requiring authentication

### MCP Marketplace
- Browse and search MCP servers
- Featured MCPs highlighting popular or recommended servers
- Detailed MCP pages with documentation and screenshots
- Category-based filtering and sorting options
- Grid and list view modes for browsing

### Deployment System
- One-click deployment of MCP servers
- Environment variable configuration during deployment
- Real-time deployment status tracking
- Automatic URL generation for deployed instances

### User Dashboard
- View and manage all user deployments
- Start, stop, and delete deployment instances
- Environment variable management
- Deployment status monitoring

## Data Flow

### User Authentication Flow
1. User accesses the application
2. If not authenticated, redirected to Replit OAuth
3. After successful authentication, user data is stored/updated
4. Session is established and user gains access to protected features

### MCP Deployment Flow
1. User browses MCP marketplace
2. User selects an MCP and configures environment variables
3. Deployment request is sent to backend
4. Backend creates deployment record and returns deployment URL
5. User can monitor and manage deployment from dashboard

### Data Persistence
- User sessions stored in PostgreSQL for scalability
- MCP metadata and user deployments persisted in database
- Environment variables securely stored with deployments

## External Dependencies

### Core Dependencies
- **Neon Database**: Serverless PostgreSQL provider
- **Replit Auth**: OAuth authentication service
- **shadcn/ui**: Pre-built UI components based on Radix UI
- **TanStack Query**: Server state management and caching

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **ESBuild**: Production bundling for server code
- **TSX**: TypeScript execution for development

### UI Libraries
- **Radix UI**: Headless UI primitives for accessibility
- **Lucide React**: Icon library
- **Tailwind CSS**: Utility-first CSS framework

## Deployment Strategy

### Development Environment
- Vite development server for frontend with HMR
- TSX for running TypeScript server code directly
- Automatic database schema synchronization with Drizzle

### Production Build
- Frontend built to static assets using Vite
- Backend bundled using ESBuild for Node.js deployment
- Database migrations applied using Drizzle Kit
- Environment variables required: `DATABASE_URL`, `SESSION_SECRET`, `REPL_ID`

### Architecture Benefits
- **Separation of Concerns**: Clear separation between client, server, and shared code
- **Type Safety**: Full TypeScript coverage across the stack
- **Modern Tooling**: Leverages latest development tools for optimal DX
- **Scalable Database**: Serverless PostgreSQL handles scaling automatically
- **Component Reusability**: Shared UI components with consistent design system

The application follows a traditional SPA architecture with server-side API, optimized for development experience and production performance.