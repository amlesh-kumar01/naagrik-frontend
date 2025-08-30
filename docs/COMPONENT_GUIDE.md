# Naagrik Component Usage Guide

## 🧩 Component Library Overview

This guide provides detailed documentation for all reusable components in the Naagrik platform, including usage examples, props, and best practices.

## 🎨 UI Components (src/components/ui/)

### Button Component

**File**: `src/components/ui/button.jsx`

**Purpose**: Professional, accessible button component with multiple variants and sizes.

**Usage**:
```jsx
import { Button } from '@/components/ui/button';

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="primary">Primary Action</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="destructive">Delete</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="lg">Large Button</Button>

// With icons
<Button>
  <Plus className="h-4 w-4 mr-2" />
  Add Item
</Button>
```

**Props**:
```typescript
interface ButtonProps {
  variant?: 'default' | 'primary' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  style?: CSSProperties;
  asChild?: boolean;
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => void;
}
```

**Styling Features**:
- Gradient backgrounds for primary variants
- Glass morphism for outline variant
- Smooth hover animations
- Professional shadows and scaling effects
- Accessible focus states

### Card Component

**File**: `src/components/ui/card.jsx`

**Purpose**: Container component for grouped content with consistent styling.

**Usage**:
```jsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here...</p>
  </CardContent>
</Card>
```

**Components**:
- `Card`: Main container
- `CardHeader`: Header section
- `CardTitle`: Title with proper typography
- `CardDescription`: Subtitle/description text
- `CardContent`: Main content area
- `CardFooter`: Footer section

### Input Component

**File**: `src/components/ui/input.jsx`

**Purpose**: Styled form input with consistent design and validation states.

**Usage**:
```jsx
import { Input } from '@/components/ui/input';

<Input 
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="mb-4"
/>
```

### Badge Component

**File**: `src/components/ui/badge.jsx`

**Purpose**: Small status indicators and labels.

**Usage**:
```jsx
import { Badge } from '@/components/ui/badge';

<Badge variant="success">Resolved</Badge>
<Badge variant="warning">In Progress</Badge>
<Badge variant="destructive">Urgent</Badge>
```

**Variants**:
- `default`: Primary brand color
- `secondary`: Gray/neutral
- `success`: Green for positive states
- `warning`: Orange for attention
- `destructive`: Red for errors/urgent

### Loading Component

**File**: `src/components/ui/loading.jsx`

**Purpose**: Loading states and skeleton screens.

**Usage**:
```jsx
import { LoadingCard, LoadingPage, LoadingSpinner } from '@/components/ui/loading';

// Full page loading
<LoadingPage message="Loading dashboard..." />

// Card skeleton
<LoadingCard />

// Simple spinner
<LoadingSpinner size="lg" />
```

### Alert Component

**File**: `src/components/ui/alert.jsx`

**Purpose**: Notification and alert messages.

**Usage**:
```jsx
import { Alert, AlertDescription } from '@/components/ui/alert';

<Alert variant="success">
  <CheckCircle className="h-4 w-4" />
  <AlertDescription>
    Issue successfully created!
  </AlertDescription>
</Alert>
```

## 🔐 Authentication Components (src/components/auth/)

### ProtectedRoute Component

**File**: `src/components/auth/ProtectedRoute.jsx`

**Purpose**: Wrapper component for route-level access control.

**Usage**:
```jsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Basic authentication required
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Role-based access
<ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
  <AdminPanel />
</ProtectedRoute>

// Optional authentication
<ProtectedRoute requireAuth={false}>
  <PublicContent />
</ProtectedRoute>
```

**Props**:
```typescript
interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<'CITIZEN' | 'STEWARD' | 'SUPER_ADMIN'>;
  requireAuth?: boolean;
}
```

### LoginForm Component

**File**: `src/components/auth/LoginForm.jsx`

**Purpose**: Complete login form with validation and state management.

**Usage**:
```jsx
import LoginForm from '@/components/auth/LoginForm';

// Standalone usage
<LoginForm onSuccess={() => router.push('/dashboard')} />

// With custom styling
<LoginForm 
  className="max-w-md mx-auto"
  showRememberMe={true}
/>
```

**Features**:
- Email/password validation
- Error handling and display
- Loading states
- Remember me functionality
- Automatic redirect after login

### RegisterForm Component

**File**: `src/components/auth/RegisterForm.jsx`

**Purpose**: User registration form with validation.

**Usage**:
```jsx
import RegisterForm from '@/components/auth/RegisterForm';

<RegisterForm onSuccess={() => router.push('/login')} />
```

**Features**:
- Multi-field validation
- Password strength checking
- Terms acceptance
- Email confirmation
- Error handling

### AuthInitializer Component

**File**: `src/components/auth/AuthInitializer.jsx`

**Purpose**: Initialize authentication state on app load.

**Usage**:
```jsx
import AuthInitializer from '@/components/auth/AuthInitializer';

// In app layout
<AuthInitializer>
  <App />
</AuthInitializer>
```

## 🏗️ Layout Components (src/components/layout/)

### Header Component

**File**: `src/components/layout/Header.jsx`

**Purpose**: Main navigation header with role-based menu items.

**Usage**:
```jsx
import Header from '@/components/layout/Header';

// Automatic integration in layout
<Header />
```

**Features**:
- Role-based navigation items
- Admin dropdown menu
- User profile dropdown
- Mobile responsive design
- Authentication state handling

**Navigation Items by Role**:
```javascript
// Citizens
const citizenNav = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Report Issue', href: '/report', icon: Plus },
  { name: 'Map View', href: '/map', icon: MapPin },
  { name: 'Issues', href: '/issues', icon: AlertTriangle },
  { name: 'Become Steward', href: '/steward/apply', icon: Award }
];

// Stewards (includes citizen items plus)
const stewardNav = [
  ...citizenNav,
  { name: 'Steward Dashboard', href: '/steward', icon: Shield }
];

// Admin (includes all items plus admin menu)
const adminMenu = [
  { name: 'Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Stewards', href: '/admin/stewards', icon: Shield },
  // ... more admin items
];
```

### Footer Component

**File**: `src/components/layout/Footer.jsx`

**Purpose**: Site footer with links and information.

**Usage**:
```jsx
import Footer from '@/components/layout/Footer';

<Footer />
```

### RootLayout Component

**File**: `src/components/layout/RootLayout.jsx`

**Purpose**: Application-wide layout wrapper.

**Usage**:
```jsx
import RootLayout from '@/components/layout/RootLayout';

<RootLayout>
  <PageContent />
</RootLayout>
```

## 🚀 Feature Components (src/components/features/)

### IssueList Component

**File**: `src/components/features/IssueList.jsx`

**Purpose**: Paginated, filterable list of community issues.

**Usage**:
```jsx
import IssueList from '@/components/features/IssueList';

// Basic usage
<IssueList />

// With custom filters
<IssueList 
  defaultFilters={{
    status: 'REPORTED',
    zone: 'downtown'
  }}
  showFilters={true}
/>
```

**Props**:
```typescript
interface IssueListProps {
  defaultFilters?: {
    status?: string;
    priority?: string;
    zone?: string;
    category?: string;
  };
  showFilters?: boolean;
  itemsPerPage?: number;
  onIssueClick?: (issue: Issue) => void;
}
```

**Features**:
- Search functionality
- Multiple filter options
- Pagination
- Real-time updates
- Loading states
- Empty states

### IssueCard Component

**File**: `src/components/features/IssueCard.jsx`

**Purpose**: Individual issue display with status, priority, and actions.

**Usage**:
```jsx
import IssueCard from '@/components/features/IssueCard';

<IssueCard 
  issue={issueData}
  onClick={() => router.push(`/issues/${issue.id}`)}
  showActions={user?.role === 'STEWARD'}
/>
```

**Props**:
```typescript
interface IssueCardProps {
  issue: Issue;
  onClick?: () => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}
```

**Features**:
- Status indicators with colors
- Priority badges
- Location display
- Upvote functionality
- Comment count
- Responsive design
- Action buttons for stewards

### MapView Component

**File**: `src/components/features/MapView.jsx`

**Purpose**: Interactive map showing issue locations.

**Usage**:
```jsx
import MapView from '@/components/features/MapView';

<MapView 
  issues={issues}
  center={[latitude, longitude]}
  zoom={12}
  onMarkerClick={(issue) => setSelectedIssue(issue)}
  filters={{
    status: ['REPORTED', 'IN_PROGRESS']
  }}
/>
```

**Props**:
```typescript
interface MapViewProps {
  issues: Issue[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (issue: Issue) => void;
  filters?: {
    status?: string[];
    priority?: string[];
    category?: string[];
  };
  height?: string;
}
```

**Features**:
- Leaflet integration
- Custom markers by status
- Popup information
- Clustering for performance
- Filter integration
- Responsive design

### ModernMapView Component

**File**: `src/components/features/ModernMapView.jsx`

**Purpose**: Enhanced map component with advanced features.

**Usage**:
```jsx
import ModernMapView from '@/components/features/ModernMapView';

<ModernMapView 
  issues={issues}
  showControls={true}
  showSearch={true}
  onIssueSelect={(issue) => handleIssueSelect(issue)}
/>
```

**Additional Features**:
- Search by location
- Map controls
- Layer switching
- Advanced clustering
- Heat map mode
- Drawing tools (for zones)

### ReportIssueModal Component

**File**: `src/components/features/ReportIssueModal.jsx`

**Purpose**: Modal form for creating new issue reports.

**Usage**:
```jsx
import ReportIssueModal from '@/components/features/ReportIssueModal';

<ReportIssueModal 
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={(newIssue) => {
    console.log('Issue created:', newIssue);
    setShowModal(false);
  }}
  initialLocation={userLocation}
/>
```

**Props**:
```typescript
interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (issue: Issue) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}
```

**Features**:
- Multi-step form
- Image upload with preview
- Location selection (map + manual)
- Category and priority selection
- Real-time validation
- Progress indicator

## 📄 Page Components (src/components/pages/)

### HomePage Component

**File**: `src/components/pages/HomePage.jsx`

**Purpose**: Platform landing page with hero section and features.

**Usage**:
```jsx
import HomePage from '@/components/pages/HomePage';

<HomePage />
```

**Sections**:
- Hero with call-to-action
- Feature showcase
- Recent issues (authenticated users)
- Platform statistics
- Community testimonials

### AdminDashboardPage Component

**File**: `src/components/pages/AdminDashboardPage.jsx`

**Purpose**: Comprehensive admin control panel.

**Usage**:
```jsx
import AdminDashboardPage from '@/components/pages/AdminDashboardPage';

// Protected route required
<ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
  <AdminDashboardPage />
</ProtectedRoute>
```

**Features**:
- System overview metrics
- Quick action buttons
- Recent activity feed
- Performance charts
- Management shortcuts

### StewardDashboardPage Component

**File**: `src/components/pages/StewardDashboardPage.jsx`

**Purpose**: Steward activity dashboard.

**Usage**:
```jsx
import StewardDashboardPage from '@/components/pages/StewardDashboardPage';

<ProtectedRoute allowedRoles={['STEWARD', 'SUPER_ADMIN']}>
  <StewardDashboardPage />
</ProtectedRoute>
```

**Features**:
- Assigned issue summary
- Performance metrics
- Quick actions
- Admin access (for SUPER_ADMIN)
- Zone-specific data

### UserManagementPage Component

**File**: `src/components/pages/UserManagementPage.jsx`

**Purpose**: Admin interface for managing users.

**Usage**:
```jsx
import UserManagementPage from '@/components/pages/UserManagementPage';

<ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
  <UserManagementPage />
</ProtectedRoute>
```

**Features**:
- User list with filters
- Role assignment
- Status management
- Bulk operations
- User profile editing

## 🎛️ Advanced Component Patterns

### Compound Components Pattern

Many components use the compound component pattern for flexibility:

```jsx
// Card component example
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Render Props Pattern

Some components accept render functions for customization:

```jsx
<IssueList 
  renderItem={(issue) => (
    <CustomIssueCard issue={issue} />
  )}
  renderEmpty={() => (
    <div>No issues found</div>
  )}
/>
```

### Hook Integration

Components integrate with custom hooks for state management:

```jsx
const MyComponent = () => {
  const { issues, loading, fetchIssues } = useIssuesStore();
  const { user } = useAuthStore();
  
  useEffect(() => {
    fetchIssues();
  }, []);
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      {issues.map(issue => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
};
```

## 🎨 Styling Guidelines

### Using the Design System

All components use the centralized design system:

```jsx
import { colors } from '@/lib/theme';

// Use design system colors
<div style={{ 
  background: colors.gradients.primary,
  color: colors.primary[600]
}}>
  Content
</div>

// Use Tailwind utilities
<div className="bg-gradient-to-r from-primary-400 to-primary-600">
  Content
</div>
```

### Custom Styling

When adding custom styles:

```jsx
// Use Tailwind merge for conditional classes
import { cn } from '@/lib/utils';

<Button 
  className={cn(
    "base-classes",
    variant === "special" && "special-classes",
    className
  )}
>
  Button
</Button>
```

## 🧪 Testing Patterns

### Component Testing

```jsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});
```

### Integration Testing

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import IssueList from '@/components/features/IssueList';
import { useIssuesStore } from '@/store';

// Mock store
jest.mock('@/store');

test('displays issues and handles interactions', () => {
  const mockIssues = [/* mock data */];
  useIssuesStore.mockReturnValue({
    issues: mockIssues,
    loading: false,
    fetchIssues: jest.fn()
  });

  render(<IssueList />);
  
  expect(screen.getByText('Issues')).toBeInTheDocument();
  expect(screen.getAllByTestId('issue-card')).toHaveLength(mockIssues.length);
});
```

## 🚀 Performance Optimization

### Lazy Loading

```jsx
import { lazy, Suspense } from 'react';
import { LoadingCard } from '@/components/ui/loading';

const AdminDashboard = lazy(() => import('@/components/pages/AdminDashboardPage'));

<Suspense fallback={<LoadingCard />}>
  <AdminDashboard />
</Suspense>
```

### Memoization

```jsx
import { memo, useMemo } from 'react';

const IssueCard = memo(({ issue, onClick }) => {
  const statusColor = useMemo(() => 
    getStatusColor(issue.status), 
    [issue.status]
  );
  
  return (
    <Card onClick={onClick}>
      <Badge style={{ backgroundColor: statusColor }}>
        {issue.status}
      </Badge>
    </Card>
  );
});
```

This component guide provides comprehensive documentation for using all components in the Naagrik platform, including examples, props, and best practices for development.
