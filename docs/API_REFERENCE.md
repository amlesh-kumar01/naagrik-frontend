# Naagrik API Reference & Integration Guide

## 🌐 API Base Configuration

### Environment Configuration
```javascript
// Development
const API_BASE_URL = 'http://localhost:8000/api'

// Production
const API_BASE_URL = 'https://api.naagrik.com/api'
```

### Request/Response Patterns

#### Standard Request Headers
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
  'X-Client-Version': '1.0.0'
}
```

#### Standard Response Format
```javascript
{
  "success": true,
  "data": {...},
  "message": "Operation successful",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### Error Response Format
```javascript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": ["Email is required"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

## 🔐 Authentication API

### POST /auth/login
**Purpose**: Authenticate user and receive JWT token

**Request Body**:
```javascript
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response**:
```javascript
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "CITIZEN", // CITIZEN | STEWARD | SUPER_ADMIN
      "status": "ACTIVE",
      "avatar": "https://...",
      "assignedZone": "zone_456", // For stewards
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "token": "jwt_token_here",
    "expiresIn": 86400
  }
}
```

### POST /auth/register
**Purpose**: Create new user account

**Request Body**:
```javascript
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "securepassword",
  "phone": "+1234567890",
  "address": "123 Main St, City",
  "acceptTerms": true
}
```

### GET /auth/verify
**Purpose**: Verify token validity and get current user

**Headers**: `Authorization: Bearer <token>`

**Response**: Same as login response

### POST /auth/logout
**Purpose**: Invalidate current session

## 👥 User Management API

### GET /users/profile
**Purpose**: Get current user's profile

**Response**:
```javascript
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "+1234567890",
    "address": "123 Main St, City",
    "avatar": "https://...",
    "role": "CITIZEN",
    "status": "ACTIVE",
    "stats": {
      "issuesReported": 15,
      "issuesResolved": 8,
      "reputation": 85
    },
    "badges": ["REPORTER", "CIVIC_HERO"],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### PATCH /users/profile
**Purpose**: Update user profile

**Request Body**:
```javascript
{
  "name": "Updated Name",
  "phone": "+9876543210",
  "address": "456 New St, City",
  "avatar": "data:image/jpeg;base64,..."
}
```

### GET /users (Admin Only)
**Purpose**: Get paginated list of users with filters

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search term for name/email
- `role`: Filter by role (CITIZEN, STEWARD, SUPER_ADMIN)
- `status`: Filter by status (ACTIVE, INACTIVE, SUSPENDED)
- `zone`: Filter by assigned zone

**Response**:
```javascript
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "CITIZEN",
      "status": "ACTIVE",
      "assignedZone": null,
      "issuesCount": 5,
      "lastActive": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {...}
}
```

### PATCH /users/:id/role (Admin Only)
**Purpose**: Update user role

**Request Body**:
```javascript
{
  "role": "STEWARD",
  "assignedZone": "zone_456" // Required for STEWARD role
}
```

## 📋 Issues API

### GET /issues
**Purpose**: Get paginated list of issues with filters

**Query Parameters**:
- `page`, `limit`: Pagination
- `search`: Search in title/description
- `status`: REPORTED, IN_PROGRESS, RESOLVED, CLOSED
- `priority`: LOW, MEDIUM, HIGH, URGENT
- `category`: INFRASTRUCTURE, SAFETY, ENVIRONMENT, etc.
- `zone`: Filter by zone
- `assignedSteward`: Filter by assigned steward
- `reportedBy`: Filter by reporter
- `dateFrom`, `dateTo`: Date range filters
- `lat`, `lng`, `radius`: Geographic filters

**Response**:
```javascript
{
  "success": true,
  "data": [
    {
      "id": "issue_123",
      "title": "Broken streetlight on Main St",
      "description": "Streetlight has been out for 3 days...",
      "category": "INFRASTRUCTURE",
      "priority": "MEDIUM",
      "status": "REPORTED",
      "location": {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "address": "123 Main St, City"
      },
      "reporter": {
        "id": "user_123",
        "name": "John Doe",
        "avatar": "https://..."
      },
      "assignedSteward": {
        "id": "steward_456",
        "name": "Jane Smith"
      },
      "zone": {
        "id": "zone_789",
        "name": "Downtown District"
      },
      "images": [
        "https://storage.example.com/issue_123_1.jpg"
      ],
      "upvotes": 15,
      "commentsCount": 3,
      "estimatedResolutionTime": "2-3 days",
      "createdAt": "2024-01-15T09:00:00Z",
      "updatedAt": "2024-01-15T14:30:00Z",
      "resolvedAt": null
    }
  ],
  "pagination": {...}
}
```

### POST /issues
**Purpose**: Create new issue report

**Request Body**:
```javascript
{
  "title": "Broken streetlight",
  "description": "Detailed description...",
  "category": "INFRASTRUCTURE",
  "priority": "MEDIUM",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main St, City"
  },
  "images": [
    "data:image/jpeg;base64,..." // Base64 encoded images
  ]
}
```

### GET /issues/:id
**Purpose**: Get detailed issue information

**Response**: Single issue object with additional details:
```javascript
{
  "success": true,
  "data": {
    // ... standard issue fields
    "comments": [
      {
        "id": "comment_123",
        "content": "I see this issue too...",
        "author": {
          "id": "user_456",
          "name": "Alice Johnson",
          "avatar": "https://..."
        },
        "createdAt": "2024-01-15T10:15:00Z"
      }
    ],
    "updates": [
      {
        "id": "update_123",
        "action": "STATUS_CHANGED",
        "oldValue": "REPORTED",
        "newValue": "IN_PROGRESS",
        "updatedBy": {
          "id": "steward_456",
          "name": "Jane Smith",
          "role": "STEWARD"
        },
        "note": "Investigation started",
        "createdAt": "2024-01-15T11:00:00Z"
      }
    ],
    "relatedIssues": [
      {
        "id": "issue_456",
        "title": "Another nearby issue",
        "status": "RESOLVED"
      }
    ]
  }
}
```

### PATCH /issues/:id (Steward/Admin Only)
**Purpose**: Update issue status, priority, or assignment

**Request Body**:
```javascript
{
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "assignedSteward": "steward_789",
  "stewardNote": "Starting investigation today",
  "estimatedResolutionTime": "1-2 days"
}
```

### POST /issues/:id/upvote
**Purpose**: Upvote an issue to show support

### POST /issues/:id/comments
**Purpose**: Add comment to issue

**Request Body**:
```javascript
{
  "content": "I have the same issue in my area..."
}
```

## 🛡️ Steward Management API

### GET /stewards (Admin Only)
**Purpose**: Get list of stewards with performance data

**Response**:
```javascript
{
  "success": true,
  "data": [
    {
      "id": "steward_123",
      "user": {
        "id": "user_456",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "avatar": "https://..."
      },
      "assignedZone": {
        "id": "zone_789",
        "name": "Downtown District"
      },
      "status": "ACTIVE",
      "performance": {
        "issuesAssigned": 25,
        "issuesResolved": 20,
        "resolutionRate": 80,
        "avgResolutionTime": "2.5 days",
        "rating": 4.5
      },
      "joinedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /stewards/apply
**Purpose**: Submit steward application

**Request Body**:
```javascript
{
  "justification": "I want to help my community because...",
  "preferredZone": "zone_123",
  "experience": "Previous volunteer work includes..."
}
```

### GET /stewards/applications (Admin Only)
**Purpose**: Get pending steward applications

### PATCH /stewards/applications/:id (Admin Only)
**Purpose**: Approve or reject steward application

**Request Body**:
```javascript
{
  "status": "APPROVED", // APPROVED | REJECTED
  "assignedZone": "zone_123",
  "adminNote": "Excellent application, approved for downtown zone"
}
```

## 🗺️ Zone Management API

### GET /zones
**Purpose**: Get list of all zones

**Response**:
```javascript
{
  "success": true,
  "data": [
    {
      "id": "zone_123",
      "name": "Downtown District",
      "description": "Central business district area",
      "boundaries": {
        "type": "Polygon",
        "coordinates": [[...]] // GeoJSON format
      },
      "assignedStewards": [
        {
          "id": "steward_456",
          "name": "Jane Smith"
        }
      ],
      "issueStats": {
        "total": 45,
        "resolved": 35,
        "pending": 10
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /zones (Admin Only)
**Purpose**: Create new zone

**Request Body**:
```javascript
{
  "name": "New District",
  "description": "Description of the new zone",
  "boundaries": {
    "type": "Polygon",
    "coordinates": [[...]]
  }
}
```

## 📊 Analytics API

### GET /analytics/dashboard (Admin Only)
**Purpose**: Get admin dashboard analytics

**Response**:
```javascript
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 1250,
      "totalStewards": 25,
      "totalIssues": 450,
      "resolvedIssues": 380,
      "resolutionRate": 84.4
    },
    "recentActivity": [
      {
        "type": "ISSUE_RESOLVED",
        "description": "Streetlight issue resolved",
        "timestamp": "2024-01-15T14:30:00Z"
      }
    ],
    "performanceMetrics": {
      "avgResolutionTime": "2.3 days",
      "topPerformingStewards": [...],
      "mostActiveZones": [...]
    },
    "trends": {
      "issuesReportedThisMonth": 45,
      "issuesResolvedThisMonth": 52,
      "newUsersThisMonth": 15
    }
  }
}
```

## 📤 File Upload API

### POST /upload/image
**Purpose**: Upload image file

**Request**: Multipart form data
```javascript
FormData {
  file: [File object],
  type: "issue_image" // issue_image | avatar | document
}
```

**Response**:
```javascript
{
  "success": true,
  "data": {
    "url": "https://storage.example.com/images/uuid_filename.jpg",
    "filename": "uuid_filename.jpg",
    "size": 245760,
    "mimeType": "image/jpeg"
  }
}
```

## 🔔 Real-time Events (WebSocket)

### Connection
```javascript
const ws = new WebSocket('wss://api.naagrik.com/ws');
ws.send(JSON.stringify({
  type: 'auth',
  token: 'jwt_token_here'
}));
```

### Event Types
```javascript
// Issue status updates
{
  "type": "ISSUE_STATUS_CHANGED",
  "data": {
    "issueId": "issue_123",
    "oldStatus": "REPORTED",
    "newStatus": "IN_PROGRESS",
    "updatedBy": "steward_456"
  }
}

// New issue in zone (for stewards)
{
  "type": "NEW_ISSUE_IN_ZONE",
  "data": {
    "issue": {...}, // Full issue object
    "zone": "zone_123"
  }
}

// Application status update
{
  "type": "APPLICATION_STATUS_CHANGED",
  "data": {
    "applicationId": "app_123",
    "status": "APPROVED",
    "assignedZone": "zone_456"
  }
}
```

## 🛠️ Integration Examples

### Frontend Store Integration
```javascript
// In issuesStore.js
const fetchIssues = async (filters = {}) => {
  try {
    set({ isLoading: true, error: null });
    const response = await issueAPI.getIssues(filters);
    set({ 
      issues: response.data.data,
      pagination: response.data.pagination,
      isLoading: false 
    });
  } catch (error) {
    set({ 
      error: error.response?.data?.error || error.message,
      isLoading: false 
    });
  }
};
```

### Error Handling Pattern
```javascript
// In API client
const handleAPIError = (error) => {
  if (error.response?.status === 401) {
    // Token expired, redirect to login
    useAuthStore.getState().logout();
    window.location.href = '/login';
  } else if (error.response?.status === 403) {
    // Insufficient permissions
    toast.error('You do not have permission to perform this action');
  } else {
    // General error
    const message = error.response?.data?.error?.message || 'An error occurred';
    toast.error(message);
  }
  throw error;
};
```

### Component API Usage
```javascript
// In a component
const { issues, isLoading, fetchIssues } = useIssuesStore();

useEffect(() => {
  fetchIssues({
    page: 1,
    limit: 20,
    status: 'REPORTED'
  });
}, []);
```

This API reference provides comprehensive documentation for all endpoints used in the Naagrik platform, including request/response formats, authentication requirements, and integration patterns.
