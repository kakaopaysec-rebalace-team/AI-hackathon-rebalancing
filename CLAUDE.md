# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (React/Vite)
- **Development server**: `npm run dev` (runs on port 5173, configured to bind to all interfaces)
- **Production build**: `npm run build`
- **Development build**: `npm run build:dev`
- **Lint code**: `npm run lint`
- **Preview build**: `npm run preview`

### Backend (Node.js/Express)
- **Start backend server**: `npm run server` (runs on port 3001)
- **Start with memory optimization**: `npm run server:memory` (4GB max heap size with GC exposure)
- **Development with auto-reload**: `cd server && npm run dev` (nodemon)

### Full Stack Development
Both frontend and backend must run simultaneously:
1. `npm run dev` (frontend on port 5173)
2. `npm run server` (backend on port 3001)

## Architecture Overview

This is a full-stack Korean stock portfolio management system with AI-powered strategy learning capabilities. The application consists of a React SPA frontend and a Node.js/Express backend with MariaDB database integration.

### System Architecture

**Frontend (React SPA)**:
- Vite + TypeScript + shadcn/ui components + Tailwind CSS
- React Router for navigation, React Query for server state management
- Real-time stock price updates and portfolio analytics
- Korean language UI with responsive mobile-first design

**Backend (Node.js/Express API)**:
- RESTful API server with CORS enabled
- Real-time stock price simulation with automatic updates
- AI strategy learning system with multiple generation methods
- File upload support via Multer for document analysis

**Database (MariaDB)**:
- Portfolio holdings, trading history, and customer data
- Real-time stock prices with automatic updates
- Strategy learning and rebalancing configurations
- Comprehensive mock data for ~200 Korean stocks

### Key Backend Components

**Core Modules**:
- `server/server.js`: Main Express server with API routing
- `server/database.js`: Database connection pool and query functions
- `server/priceUpdater.js`: Real-time stock price simulation engine

**Price Update System**:
- Automatic price updates every 1000ms with 0.95-1.05x variation
- Memory management with configurable thresholds and batch processing
- Supports start/stop/restart via API endpoints

**Strategy Learning System**:
Four AI strategy generation methods:
1. **User Input (USR)**: Text-based strategy generation
2. **Website Analysis (WEB)**: URL content analysis 
3. **Document Analysis (DOC)**: File upload processing (PDF, DOC, TXT, PPT)
4. **Automatic Generation (AUTO)**: Market analysis-based generation

Each method generates mock strategies with realistic parameters and stores them in `strategy_learning` table.

### Database Schema

**Core Tables**:
- `customer_balance`: Portfolio holdings with quantities and purchase amounts
- `stock_current_price`: Real-time stock prices (~2500 Korean stocks)
- `trading_history`: Complete trading records with buy/sell history
- `customer_strategy`: User's rebalancing strategy configuration
- `rebalancing_master`: Pre-defined investment strategies (15 types)
- `strategy_learning`: AI-generated strategies with application status

**Key Relationships**:
- Customer balance linked to current prices for real-time valuation
- Trading history maintains audit trail for all transactions
- Strategy learning system allows promoting strategies to master list

### API Architecture

**Balance Management** (`/api/balance/*`):
- `/holdings`: Portfolio positions with P&L calculation
- `/deposit`: Customer cash deposits
- `/rebalancing`: Strategy status and configuration
- `/all`: Complete portfolio summary

**Strategy Learning** (`/api/strategy-learning/*`):
- `/generate/user-input`: Text-based strategy creation
- `/generate/website`: URL analysis with validation
- `/generate/document`: Multi-file upload with type checking
- `/generate/auto`: Automated market-based generation
- `/apply/{code}`: Promote learning strategy to master list

**Price Management** (`/api/price/*`):
- `/status`: Price updater system status
- `/start`, `/stop`, `/restart`: Price update control
- `/config`: Update interval and variation configuration

### Development Patterns

**Database Operations**:
- Connection pooling with mysql2/promise
- Async/await pattern throughout
- Transaction support for multi-table operations
- Error handling with detailed logging

**File Handling**:
- Multer middleware for multipart form uploads
- File type validation and size limits
- Memory storage for temporary processing

**API Design**:
- Consistent JSON response format with success/error states
- Request logging middleware for debugging
- CORS configured for cross-origin frontend access

### Frontend-Backend Integration

**Data Flow**:
- React Query manages server state with automatic caching
- Real-time updates via polling (price data)
- Form handling with React Hook Form + Zod validation
- File uploads using FormData for document analysis

**State Management**:
- Server state: React Query (@tanstack/react-query)
- Local state: React hooks (useState, useEffect)
- Form state: React Hook Form with Zod schemas

### Environment Configuration

**Required Environment Variables** (`.env`):
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username  
DB_PASSWORD=your_password
DB_NAME=kpsdb
ACCOUNT_NUMBER=99911122222
```

**Database Setup**:
1. Create MariaDB database: `CREATE DATABASE kpsdb;`
2. Run schema: `source database/create_tables_only.sql`
3. Insert data: `source database/complete_database_setup.sql`

### Key Pages and Features

1. **Portfolio Dashboard (/)**: Real-time holdings, composition charts, P&L summary
2. **Strategy Creation (/strategy-create)**: Interactive portfolio builder with rebalancing
3. **Strategy Comparison (/strategy-compare)**: Risk assessment and strategy analysis
4. **Admin Pages**:
   - **Portfolio Management** (`/admin/portfolio-management`): Holdings and deposit management
   - **Strategy Learning** (`/admin/strategy-learning`): AI strategy generation interface
   - **Strategy Detail** (`/admin/strategy-detail/{code}`): Individual strategy analysis

### Critical Development Notes

**Backend Development**:
- Always run lint checks before deployment
- Monitor memory usage with price updater system  
- File uploads require multer middleware configuration
- Database queries use prepared statements for security

**Frontend Development**:
- All imports use `@/` alias for clean organization
- Components follow shadcn/ui patterns and conventions
- Mobile-first responsive design with Tailwind CSS
- Korean language support throughout UI

**Database Management**:
- Price updater must be stopped before schema changes
- Foreign key constraints require careful data insertion order
- Mock data includes realistic Korean stock symbols and prices
- Account number 99911122222 is the default test account

**API Integration**:
- Backend runs on port 3001, frontend on 5173
- CORS configured for local development
- File uploads require FormData, not JSON
- Strategy names are user-defined, not auto-generated