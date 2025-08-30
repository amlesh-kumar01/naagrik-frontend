# Naagrik Development Workflow & Best Practices

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ and npm
- Git for version control
- Code editor (VS Code recommended)

### Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd naagrik-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

### Development Server
- **URL**: http://localhost:3000
- **Hot Reload**: Automatic on file changes
- **Error Overlay**: Shows compilation errors in browser

## 📁 File Organization Principles

### Component Structure
```
ComponentName/
├── index.js          # Export file
├── ComponentName.jsx # Main component
├── ComponentName.test.js # Tests
├── ComponentName.stories.js # Storybook stories
└── styles.module.css # Component-specific styles (if needed)
```

### Feature-Based Organization
```
features/
├── authentication/
│   ├── components/
│   ├── hooks/
│   ├── stores/
│   └── api/
├── issues/
│   ├── components/
│   ├── hooks/
│   ├── stores/
│   └── api/
```

### Import Path Standards
```javascript
// Absolute imports (preferred)
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store';
import { colors } from '@/lib/theme';

// Relative imports (only for nearby files)
import './styles.css';
import { helper } from '../utils/helper';
```

## 🧩 Component Development Guidelines

### Component Creation Checklist
- [ ] Use functional components with hooks
- [ ] Implement proper prop validation
- [ ] Follow naming conventions (PascalCase)
- [ ] Add TypeScript-style JSDoc comments
- [ ] Implement error boundaries where needed
- [ ] Add loading and error states
- [ ] Make components responsive
- [ ] Follow accessibility guidelines

### Component Template
```jsx
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { colors } from '@/lib/theme';

/**
 * ComponentName - Brief description of what it does
 * 
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {ReactNode} props.children - Child components
 * @param {Function} props.onAction - Callback function
 */
const ComponentName = ({ 
  className,
  children,
  onAction,
  ...props 
}) => {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Side effects
  }, []);

  const handleAction = () => {
    onAction?.();
  };

  return (
    <div 
      className={cn("base-classes", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default ComponentName;
```

### Props Validation Pattern
```jsx
// Using JSDoc for prop types
/**
 * @typedef {Object} ComponentProps
 * @property {string} title - The component title
 * @property {boolean} isActive - Whether the component is active
 * @property {Array<Object>} items - Array of items to display
 * @property {Function} onItemClick - Click handler for items
 */
```

## 🎨 Styling Best Practices

### Tailwind CSS Usage
```jsx
// Preferred: Use Tailwind utilities
<div className="flex items-center justify-between p-4 rounded-lg bg-white shadow-md">

// Conditional classes
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "primary" && "primary-classes",
  className
)}>

// Responsive design
<div className="text-sm md:text-base lg:text-lg">
```

### Custom Styling Guidelines
```jsx
// 1. Use design system colors
import { colors } from '@/lib/theme';

<div style={{ 
  background: colors.gradients.primary,
  color: colors.primary[600]
}}>

// 2. Use CSS variables for consistency
<div style={{
  backgroundColor: 'var(--color-primary-400)',
  color: 'var(--color-primary-600)'
}}>

// 3. Avoid inline styles for complex styling
// Instead, use Tailwind classes or CSS modules
```

### Responsive Design Patterns
```jsx
// Mobile-first approach
<div className="
  w-full p-4
  md:w-1/2 md:p-6
  lg:w-1/3 lg:p-8
">

// Container patterns
<div className="
  max-w-7xl mx-auto 
  px-4 sm:px-6 lg:px-8
">

// Grid layouts
<div className="
  grid grid-cols-1 gap-4
  md:grid-cols-2 md:gap-6
  lg:grid-cols-3 lg:gap-8
">
```

## 🏪 State Management Patterns

### Zustand Store Structure
```javascript
// stores/exampleStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useExampleStore = create(
  devtools(
    (set, get) => ({
      // State
      items: [],
      isLoading: false,
      error: null,
      
      // Actions
      fetchItems: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.getItems();
          set({ 
            items: response.data,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error.message,
            isLoading: false 
          });
        }
      },
      
      // Computed values
      get activeItems() {
        return get().items.filter(item => item.isActive);
      },
      
      // Reset/clear actions
      clearError: () => set({ error: null }),
      reset: () => set({ items: [], isLoading: false, error: null }),
    }),
    { name: 'example-store' }
  )
);
```

### Store Usage in Components
```jsx
const MyComponent = () => {
  const { 
    items, 
    isLoading, 
    error, 
    fetchItems,
    clearError 
  } = useExampleStore();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={fetchItems} />;

  return (
    <div>
      {items.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};
```

### State Synchronization
```javascript
// Cross-store communication
const useAuthStore = create((set, get) => ({
  user: null,
  login: async (credentials) => {
    const user = await authAPI.login(credentials);
    set({ user });
    
    // Notify other stores
    useIssuesStore.getState().fetchUserIssues(user.id);
    useNotificationStore.getState().subscribeToUser(user.id);
  }
}));
```

## 🌐 API Integration Patterns

### API Client Setup
```javascript
// lib/api/client.js
import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('naagrik-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    handleAPIError(error);
    return Promise.reject(error);
  }
);
```

### API Method Pattern
```javascript
// lib/api/issueApi.js
export const issueAPI = {
  async getIssues(filters = {}) {
    const params = new URLSearchParams(filters);
    return api.get(`/issues?${params}`);
  },

  async createIssue(issueData) {
    return api.post('/issues', issueData);
  },

  async updateIssue(id, updates) {
    return api.patch(`/issues/${id}`, updates);
  },

  async deleteIssue(id) {
    return api.delete(`/issues/${id}`);
  }
};
```

### Error Handling Strategy
```javascript
// lib/api/errorHandler.js
export const handleAPIError = (error) => {
  const status = error.response?.status;
  const message = error.response?.data?.error?.message || error.message;

  switch (status) {
    case 401:
      // Unauthorized - redirect to login
      useAuthStore.getState().logout();
      window.location.href = '/login';
      break;
    
    case 403:
      toast.error('You do not have permission for this action');
      break;
    
    case 404:
      toast.error('Resource not found');
      break;
    
    case 422:
      // Validation errors
      const validationErrors = error.response.data.error.details;
      Object.values(validationErrors).forEach(errorArray => {
        errorArray.forEach(msg => toast.error(msg));
      });
      break;
    
    case 500:
      toast.error('Server error. Please try again later.');
      break;
    
    default:
      toast.error(message || 'An unexpected error occurred');
  }
};
```

## 🔐 Authentication Patterns

### Protected Route Implementation
```jsx
// components/auth/ProtectedRoute.jsx
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isLoading, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
      router.push('/unauthorized');
      return;
    }
  }, [user, isLoading, isAuthenticated, router]);

  if (isLoading) return <LoadingPage />;
  if (!isAuthenticated) return null;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) return null;

  return children;
};
```

### Role-Based Component Rendering
```jsx
const ConditionalComponent = () => {
  const { user } = useAuthStore();

  return (
    <div>
      {/* Always visible */}
      <PublicContent />

      {/* Authenticated users only */}
      {user && (
        <AuthenticatedContent />
      )}

      {/* Role-based content */}
      {user?.role === 'STEWARD' && (
        <StewardContent />
      )}

      {user?.role === 'SUPER_ADMIN' && (
        <AdminContent />
      )}
    </div>
  );
};
```

## 🧪 Testing Strategies

### Unit Testing Components
```javascript
// __tests__/Button.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  test('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies correct variant classes', () => {
    render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('button-primary');
  });
});
```

### Testing with Stores
```javascript
// __tests__/IssueList.test.js
import { render, screen } from '@testing-library/react';
import { useIssuesStore } from '@/store';
import IssueList from '@/components/features/IssueList';

// Mock the store
jest.mock('@/store');

describe('IssueList Component', () => {
  beforeEach(() => {
    useIssuesStore.mockReturnValue({
      issues: [],
      isLoading: false,
      error: null,
      fetchIssues: jest.fn(),
    });
  });

  test('shows loading state', () => {
    useIssuesStore.mockReturnValue({
      issues: [],
      isLoading: true,
      error: null,
      fetchIssues: jest.fn(),
    });

    render(<IssueList />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

### Integration Testing
```javascript
// __tests__/LoginFlow.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';
import { authAPI } from '@/lib/api';

jest.mock('@/lib/api');

describe('Login Flow', () => {
  test('successful login redirects to dashboard', async () => {
    const mockUser = { id: '1', email: 'test@example.com', role: 'CITIZEN' };
    authAPI.login.mockResolvedValue({ data: { user: mockUser, token: 'token' } });

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(authAPI.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      });
    });
  });
});
```

## 🚀 Performance Optimization

### Code Splitting Strategies
```jsx
// Route-level splitting
import { lazy, Suspense } from 'react';
import { LoadingPage } from '@/components/ui/loading';

const AdminDashboard = lazy(() => import('@/components/pages/AdminDashboardPage'));
const UserManagement = lazy(() => import('@/components/pages/UserManagementPage'));

// Component-level splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));

const ParentComponent = () => (
  <Suspense fallback={<LoadingPage />}>
    <HeavyComponent />
  </Suspense>
);
```

### Memoization Patterns
```jsx
import { memo, useMemo, useCallback } from 'react';

// Component memoization
const IssueCard = memo(({ issue, onUpdate }) => {
  const statusColor = useMemo(() => 
    getStatusColor(issue.status), 
    [issue.status]
  );

  const handleUpdate = useCallback(() => {
    onUpdate(issue.id);
  }, [issue.id, onUpdate]);

  return (
    <Card style={{ borderColor: statusColor }}>
      <Button onClick={handleUpdate}>Update</Button>
    </Card>
  );
});

// Expensive computation memoization
const Dashboard = () => {
  const { issues } = useIssuesStore();
  
  const statistics = useMemo(() => {
    return calculateComplexStatistics(issues);
  }, [issues]);

  return <StatisticsDisplay data={statistics} />;
};
```

### Image Optimization
```jsx
import Image from 'next/image';

// Optimized images
<Image
  src="/hero-image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority // For above-the-fold images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// Lazy loading
<Image
  src={issue.imageUrl}
  alt={issue.title}
  width={300}
  height={200}
  loading="lazy"
/>
```

## 📱 Responsive Design Guidelines

### Breakpoint Strategy
```css
/* Mobile First Approach */
.container {
  /* Mobile styles (default) */
  padding: 1rem;
  
  /* Tablet */
  @media (min-width: 768px) {
    padding: 1.5rem;
  }
  
  /* Desktop */
  @media (min-width: 1024px) {
    padding: 2rem;
  }
  
  /* Large Desktop */
  @media (min-width: 1280px) {
    padding: 2.5rem;
  }
}
```

### Tailwind Responsive Classes
```jsx
<div className="
  grid grid-cols-1 gap-4
  sm:grid-cols-2 sm:gap-6
  md:grid-cols-3 md:gap-8
  lg:grid-cols-4 lg:gap-10
">
  {items.map(item => (
    <Card key={item.id} className="
      p-4
      sm:p-6
      lg:p-8
    ">
      <h3 className="
        text-lg font-medium
        sm:text-xl
        lg:text-2xl
      ">
        {item.title}
      </h3>
    </Card>
  ))}
</div>
```

## 🔧 Development Tools & Scripts

### Useful npm Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### ESLint Configuration
```javascript
// eslint.config.mjs
export default {
  extends: [
    'next/core-web-vitals',
    'eslint:recommended'
  ],
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'prefer-const': 'error'
  }
};
```

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-component
git add .
git commit -m "feat: add new component with validation"
git push origin feature/new-component

# Commit message format
# type(scope): description
# Types: feat, fix, docs, style, refactor, test, chore
```

## 📋 Code Review Checklist

### Pre-Review Checklist
- [ ] Code follows established patterns
- [ ] Components are properly documented
- [ ] Error handling is implemented
- [ ] Loading states are included
- [ ] Responsive design is implemented
- [ ] Accessibility guidelines followed
- [ ] Tests are written and passing
- [ ] No console errors or warnings

### Review Focus Areas
- **Functionality**: Does it work as expected?
- **Performance**: Any performance implications?
- **Security**: No security vulnerabilities?
- **Maintainability**: Is the code clean and readable?
- **Consistency**: Follows project conventions?

This guide provides comprehensive development practices for building and maintaining the Naagrik platform effectively.
