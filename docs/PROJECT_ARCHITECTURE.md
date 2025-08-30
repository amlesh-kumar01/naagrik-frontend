# Naagrik Frontend - Complete Project Architecture Documentation

## 🏗️ Project Overview

Naagrik is a comprehensive civic engagement platform built with Next.js 15+ that enables citizens to report community issues, view issue maps, and engage with local stewards and administrators. The platform follows a role-based access control system with three main user types: Citizens, Stewards, and Super Admins.

## 🎯 System Architecture

### Core Technologies
- **Framework**: Next.js 15.5.0 with App Router
- **Runtime**: React 19.1.0
- **State Management**: Zustand 4.4.7
- **Styling**: Tailwind CSS 4 with custom design system
- **HTTP Client**: Axios 1.11.0
- **Icons**: Lucide React 0.542.0
- **Maps**: Leaflet 1.9.4 + React Leaflet 5.0.0
- **Forms**: React Hook Form 7.48.2 + Zod 3.22.4
- **UI Components**: Custom component library with shadcn/ui patterns

### Design Principles
- **Role-Based Access Control (RBAC)**: Three-tier user hierarchy
- **Component Composition**: Reusable, composable UI components
- **State-Driven Architecture**: Centralized state management with Zustand
- **Type Safety**: Zod validation for form inputs and API responses
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Professional UI**: Custom design system with gradients and modern styling

## 📁 Directory Structure

```
frontend/
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── admin/              # Admin-only pages (SUPER_ADMIN role)
│   │   │   ├── analytics/      # Analytics dashboard
│   │   │   ├── applications/   # Steward applications management
│   │   │   ├── badges/         # Badge management system
│   │   │   ├── issues/         # Advanced issue management
│   │   │   ├── stewards/       # Steward management
│   │   │   ├── users/          # User management
│   │   │   ├── zones/          # Zone management
│   │   │   └── page.js         # Admin dashboard
│   │   ├── issues/             # Issue browsing and details
│   │   │   ├── [id]/           # Dynamic issue detail pages
│   │   │   └── page.js         # Issues list page
│   │   ├── login/              # Authentication pages
│   │   ├── map/                # Interactive map view
│   │   ├── profile/            # User profile management
│   │   ├── register/           # User registration
│   │   ├── report/             # Issue reporting
│   │   │   └── add/            # New issue creation
│   │   ├── settings/           # User settings
│   │   ├── steward/            # Steward-specific pages
│   │   │   ├── apply/          # Steward application
│   │   │   └── page.js         # Steward dashboard
│   │   ├── error.js            # Global error boundary
│   │   ├── layout.js           # Root layout component
│   │   ├── loading.js          # Global loading page
│   │   ├── not-found.js        # 404 error page
│   │   └── page.js             # Homepage
│   ├── components/             # Reusable React components
│   │   ├── auth/              # Authentication components
│   │   │   ├── AuthInitializer.jsx
│   │   │   ├── LoginForm.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── RegisterForm.jsx
│   │   ├── features/          # Feature-specific components
│   │   │   ├── IssueCard.jsx
│   │   │   ├── IssueList.jsx
│   │   │   ├── MapView.jsx
│   │   │   ├── ModernMapView.jsx
│   │   │   └── ReportIssueModal.jsx
│   │   ├── layout/            # Layout components
│   │   │   ├── ClientHeader.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   └── RootLayout.jsx
│   │   ├── pages/             # Page-level components
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   ├── AdminApplicationsPage.jsx
│   │   │   ├── AdvancedIssueManagementPage.jsx
│   │   │   ├── BadgeManagementPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── IssueDetailPage.jsx
│   │   │   ├── IssuesPage.jsx
│   │   │   ├── MapPage.jsx
│   │   │   ├── ReportIssuePage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── StewardApplicationPage.jsx
│   │   │   ├── StewardDashboardPage.jsx
│   │   │   ├── StewardManagementPage.jsx
│   │   │   ├── UserManagementPage.jsx
│   │   │   └── ZoneManagementPage.jsx
│   │   └── ui/                # Base UI components
│   │       ├── alert.jsx
│   │       ├── avatar.jsx
│   │       ├── badge.jsx
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       ├── dialog.jsx
│   │       ├── input.jsx
│   │       ├── loading.jsx
│   │       ├── textarea.jsx
│   │       └── toaster.jsx
│   ├── lib/                   # Utility libraries and configurations
│   │   ├── api/              # API layer (organized by domain)
│   │   │   ├── authApi.js
│   │   │   ├── client.js     # Base Axios configuration
│   │   │   ├── commentApi.js
│   │   │   ├── issueApi.js
│   │   │   ├── stewardApi.js
│   │   │   ├── uploadApi.js
│   │   │   └── userApi.js
│   │   ├── utils/            # Utility functions
│   │   ├── api.js            # API exports
│   │   ├── theme.js          # Design system and color palette
│   │   ├── utils.js          # General utilities
│   │   └── validation.js     # Zod schemas
│   ├── store/                # Zustand state management
│   │   ├── stores/           # Individual store modules
│   │   │   ├── adminStore.js
│   │   │   ├── authStore.js
│   │   │   ├── badgeStore.js
│   │   │   ├── dashboardStore.js
│   │   │   ├── issuesStore.js
│   │   │   ├── stewardStore.js
│   │   │   ├── uiStore.js
│   │   │   ├── userStore.js
│   │   │   └── zoneStore.js
│   │   └── index.js          # Store exports
│   └── styles/               # Global styles
│       └── globals.css
├── public/                   # Static assets
├── package.json
├── next.config.js
├── tailwind.config.js
└── eslint.config.mjs
```

## 🔐 Role-Based Access Control System

### User Roles Hierarchy

#### 1. CITIZEN (Default Role)
- **Access Level**: Basic user functionality
- **Permissions**:
  - View and browse community issues
  - Report new issues with attachments
  - View issue maps and locations
  - Manage personal profile and settings
  - Apply to become a steward
- **Restricted From**: Admin panels, steward dashboard, user management

#### 2. STEWARD (Community Moderator)
- **Access Level**: Community management functionality
- **Permissions**: All CITIZEN permissions plus:
  - Access steward dashboard
  - Manage assigned issues in their zone
  - Update issue status and priority
  - Add steward notes to issues
  - View steward performance metrics
- **Restricted From**: Admin panels, user management, zone management

#### 3. SUPER_ADMIN (System Administrator)
- **Access Level**: Full system control
- **Permissions**: All STEWARD permissions plus:
  - Full admin dashboard access
  - User management (roles, status, profiles)
  - Steward management (assignment, performance)
  - Zone management (create, edit, delete)
  - Badge management system
  - Steward application approval/rejection
  - Advanced analytics and reporting
  - System configuration

## 🌊 Data Flow Architecture

### State Management with Zustand

#### Authentication Flow
```
AuthStore → API → JWT Token → Local Storage → Protected Routes
```

#### Issue Management Flow
```
IssuesStore ↔ IssueAPI ↔ Backend
     ↓
UI Components (IssueList, IssueCard, IssueDetail)
     ↓
Real-time Updates
```

#### Admin Operations Flow
```
AdminStore → Admin APIs → Database
     ↓
Admin Pages → UI Updates → State Updates
```

### Store Responsibilities

#### 1. authStore.js
- **Purpose**: User authentication and session management
- **State**:
  - `user`: Current user object with role and profile data
  - `token`: JWT authentication token
  - `isAuthenticated`: Boolean authentication status
  - `isLoading`: Loading state for auth operations
- **Actions**:
  - `login()`: Authenticate user and set session
  - `logout()`: Clear session and redirect
  - `register()`: Create new user account
  - `checkAuth()`: Verify token validity on app load

#### 2. issuesStore.js
- **Purpose**: Community issues data and operations
- **State**:
  - `issues`: Array of issue objects
  - `currentIssue`: Selected issue details
  - `filters`: Applied filters and search terms
  - `pagination`: Page information
- **Actions**:
  - `fetchIssues()`: Get issues with filters
  - `createIssue()`: Report new issue
  - `updateIssueStatus()`: Change issue status
  - `addComment()`: Add user comments

#### 3. adminStore.js
- **Purpose**: Administrative operations and data
- **State**:
  - `users`: System users data
  - `stewards`: Steward-specific data
  - `analytics`: Dashboard analytics
  - `adminOverview`: System overview stats
- **Actions**:
  - `fetchUsers()`: Get filtered user list
  - `updateUserRole()`: Change user permissions
  - `fetchStewards()`: Get steward data
  - `assignStewardToZone()`: Zone assignments

#### 4. stewardStore.js
- **Purpose**: Steward applications and operations
- **State**:
  - `myApplication`: Current user's steward application
  - `pendingApplications`: Applications awaiting review (admin only)
  - `stewardProfile`: Steward-specific profile data
- **Actions**:
  - `submitApplication()`: Apply for steward role
  - `fetchApplications()`: Get pending applications (admin)
  - `reviewApplication()`: Approve/reject applications (admin)

#### 5. zoneStore.js
- **Purpose**: Geographic zone management
- **State**:
  - `zones`: Available zones/districts
  - `currentZone`: Selected zone details
- **Actions**:
  - `fetchAllZones()`: Get zone list
  - `createZone()`: Create new zone (admin)
  - `updateZone()`: Edit zone details (admin)
  - `deleteZone()`: Remove zone (admin)

## 🎨 Design System

### Color Palette (theme.js)
```javascript
// Primary Brand Colors
primary: {
  50: '#f8f9fa',   // Lightest backgrounds
  100: '#e9ecef',  // Light backgrounds
  200: '#B2B0E8',  // Light accent
  300: '#7A85C1',  // Medium accent
  400: '#3B38A0',  // Primary brand
  500: '#1A2A80',  // Dark primary
  600: '#152260',  // Darker primary
  700: '#101b4d',  // Very dark
  800: '#0c143a',  // Almost black
  900: '#080d26',  // Darkest
}

// Semantic Colors
semantic: {
  success: '#10B981',  // Green for success states
  warning: '#F59E0B',  // Orange for warnings
  error: '#EF4444',    // Red for errors
  info: '#3B82F6',     // Blue for information
}
```

### Button Variants
- **default**: Primary brand gradient with subtle shadow
- **primary**: Lighter primary gradient for emphasis
- **outline**: Glass-like effect with border
- **secondary**: Light gray gradient
- **ghost**: Transparent with hover effects
- **success**: Green gradient for positive actions
- **warning**: Orange gradient for caution
- **destructive**: Red gradient for dangerous actions

### Component Patterns
- **Cards**: Glass morphism with subtle borders and shadows
- **Gradients**: 135-degree linear gradients for modern look
- **Shadows**: Layered shadows (0-4px ambient, 0-8px directional)
- **Animations**: Smooth transitions (300ms duration)
- **Typography**: Hierarchical sizing with consistent spacing

## 🚦 Navigation and Routing

### Public Routes (No Authentication Required)
- `/` - Homepage with platform overview
- `/login` - User authentication
- `/register` - Account creation
- `/about` - Platform information
- `/emergency` - Emergency contacts
- `/authority` - Authority contacts

### Protected Routes (Authentication Required)

#### Citizen-Accessible Routes
- `/profile` - User profile management
- `/settings` - User preferences and configuration
- `/issues` - Browse community issues
- `/issues/[id]` - Individual issue details
- `/map` - Interactive map of issues
- `/report` - Issue reporting form
- `/report/add` - New issue creation
- `/steward/apply` - Steward application (citizens only)

#### Steward-Accessible Routes
- `/steward` - Steward dashboard
- All citizen routes

#### Admin-Only Routes (SUPER_ADMIN)
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/stewards` - Steward management
- `/admin/zones` - Zone management
- `/admin/badges` - Badge system management
- `/admin/issues` - Advanced issue management
- `/admin/applications` - Steward application reviews
- `/admin/analytics` - System analytics
- All steward and citizen routes

### Route Protection Implementation
```jsx
// ProtectedRoute.jsx
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true 
}) => {
  // Authentication check
  // Role validation
  // Redirect logic
  return children;
};
```

## 🔧 Component Architecture

### Layout Components

#### Header.jsx
- **Purpose**: Main navigation bar with role-based menu items
- **Features**:
  - Dynamic navigation based on user role
  - Admin dropdown menu (SUPER_ADMIN only)
  - User profile dropdown
  - Responsive mobile navigation
  - Authentication state handling

#### Footer.jsx
- **Purpose**: Site footer with links and information
- **Features**: Static links, social media, contact information

#### RootLayout.jsx
- **Purpose**: Application-wide layout wrapper
- **Features**: Global auth checking, layout consistency

### Feature Components

#### IssueList.jsx
- **Purpose**: Display paginated list of community issues
- **Features**:
  - Search and filtering
  - Status-based filtering
  - Pagination
  - Issue cards with summaries
  - Real-time updates

#### IssueCard.jsx
- **Purpose**: Individual issue display component
- **Features**:
  - Issue status indicators
  - Priority badges
  - Location information
  - User interaction (upvote, comment count)
  - Responsive design

#### MapView.jsx & ModernMapView.jsx
- **Purpose**: Interactive map display of issues
- **Features**:
  - Leaflet integration
  - Issue markers with popups
  - Filtering by status/category
  - Location-based clustering
  - Real-time issue plotting

#### ReportIssueModal.jsx
- **Purpose**: Issue creation modal form
- **Features**:
  - Multi-step form with validation
  - Image upload functionality
  - Location selection
  - Category and priority selection
  - Form state management

### Authentication Components

#### LoginForm.jsx
- **Purpose**: User authentication form
- **Features**:
  - Email/password validation
  - Error handling
  - Remember me functionality
  - Redirect after login

#### RegisterForm.jsx
- **Purpose**: New user registration form
- **Features**:
  - Multi-field validation
  - Password confirmation
  - Terms acceptance
  - Email verification flow

#### ProtectedRoute.jsx
- **Purpose**: Route access control wrapper
- **Features**:
  - Authentication validation
  - Role-based access control
  - Automatic redirects
  - Loading states

### Page Components

#### HomePage.jsx
- **Purpose**: Platform landing page
- **Features**:
  - Hero section with call-to-action
  - Feature showcase
  - Recent issues display (authenticated users)
  - Platform statistics
  - Responsive design

#### AdminDashboardPage.jsx
- **Purpose**: Comprehensive admin control panel
- **Features**:
  - System overview metrics
  - Quick action buttons
  - Recent activity feed
  - Performance analytics
  - Management shortcuts

#### StewardDashboardPage.jsx
- **Purpose**: Steward activity dashboard
- **Features**:
  - Assigned issue summary
  - Performance metrics
  - Quick actions
  - Admin access (for SUPER_ADMIN)
  - Zone-specific data

## 🔌 API Integration

### API Structure
```
lib/api/
├── client.js       # Base Axios configuration
├── authApi.js      # Authentication endpoints
├── userApi.js      # User management endpoints
├── issueApi.js     # Issue CRUD operations
├── commentApi.js   # Comment system
├── stewardApi.js   # Steward-specific operations
└── uploadApi.js    # File upload handling
```

### API Client Configuration (client.js)
```javascript
// Base configuration with interceptors
// Request interceptor: Add auth tokens
// Response interceptor: Handle errors globally
// Environment-based URL configuration
```

### Authentication API (authApi.js)
```javascript
// POST /auth/login - User login
// POST /auth/register - User registration
// POST /auth/logout - Session termination
// GET /auth/verify - Token verification
// POST /auth/refresh - Token refresh
```

### Issue API (issueApi.js)
```javascript
// GET /issues - Fetch issues with filters
// POST /issues - Create new issue
// GET /issues/:id - Get issue details
// PATCH /issues/:id - Update issue
// DELETE /issues/:id - Delete issue
// POST /issues/:id/comments - Add comment
```

### User API (userApi.js)
```javascript
// GET /users/profile - Get user profile
// PATCH /users/profile - Update profile
// GET /users - Get user list (admin)
// PATCH /users/:id/role - Update user role (admin)
// GET /users/:id - Get user details
```

## 🎯 User Flows

### Citizen User Flow
1. **Registration/Login** → Authentication
2. **Browse Issues** → Issues page with filters
3. **Report Issue** → Multi-step form with validation
4. **View Map** → Geographic issue visualization
5. **Apply for Steward** → Application process
6. **Manage Profile** → Settings and preferences

### Steward User Flow
1. **Login** → Authentication check
2. **Steward Dashboard** → Performance overview
3. **Manage Assigned Issues** → Status updates, notes
4. **Browse All Issues** → Community oversight
5. **Zone Management** → Local area focus
6. **Profile Management** → Steward-specific settings

### Admin User Flow
1. **Login** → Admin authentication
2. **Admin Dashboard** → System overview
3. **User Management** → Role assignments, status changes
4. **Steward Management** → Zone assignments, performance
5. **Zone Management** → Geographic area administration
6. **Application Reviews** → Steward application processing
7. **System Analytics** → Performance monitoring

## 🔄 State Synchronization

### Real-time Updates
- Issue status changes propagate to all relevant views
- Dashboard metrics update automatically
- User role changes reflect immediately in navigation
- New issue notifications for relevant stewards

### Data Consistency
- Optimistic updates for better UX
- Error rollback mechanisms
- Stale data detection and refresh
- Offline state handling

## 🚀 Performance Optimizations

### Code Splitting
- Route-based code splitting with Next.js
- Component-level lazy loading
- Dynamic imports for heavy components

### State Management
- Selective subscriptions to prevent unnecessary re-renders
- Computed values with Zustand
- Debounced search and filtering

### Caching Strategy
- Browser storage for auth tokens
- API response caching
- Image optimization and lazy loading

## 🔧 Development Guidelines

### Component Creation
1. Use functional components with hooks
2. Implement proper prop validation
3. Follow consistent naming conventions
4. Create reusable, composable components
5. Implement proper error boundaries

### State Management
1. Keep store actions pure and predictable
2. Use computed values for derived state
3. Implement proper error handling
4. Maintain clear separation of concerns

### Styling Guidelines
1. Use Tailwind CSS utilities primarily
2. Create custom components for complex styling
3. Follow the established design system
4. Implement responsive design patterns
5. Use semantic color variables

### API Integration
1. Use appropriate HTTP methods
2. Implement proper error handling
3. Add loading states for all operations
4. Use optimistic updates where appropriate
5. Validate responses with Zod schemas

This documentation provides a comprehensive overview of the Naagrik frontend architecture, enabling AI models to understand the system structure, user flows, component relationships, and development patterns used throughout the application.
