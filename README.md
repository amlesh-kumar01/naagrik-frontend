# 🏛️ Naagrik - Digital Civic Engagement Platform

<div align="center">


**Empowering Citizens, Enabling Stewards, Enhancing Communities**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.0.0-blue?logo=react&logoColor=white)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-State_Management-orange)](https://github.com/pmndrs/zustand)

*A comprehensive platform for civic issue reporting, management, and resolution with role-based access control*

</div>

---

## 🌟 Platform Overview

**Naagrik** is a next-generation civic engagement platform that bridges the gap between citizens and local authorities. Built for modern communities, it provides a seamless experience for reporting, tracking, and resolving civic issues while empowering designated stewards to efficiently manage their assigned zones and categories.

### 🎯 Key Features

- **🏠 Citizen Portal**: Report issues, track progress, engage with community
- **🛡️ Steward Dashboard**: Manage assigned zones and categories with powerful tools
- **⚡ Admin Control Center**: Comprehensive oversight and user management
- **🗺️ Interactive Maps**: Visualize issues geographically with real-time updates
- **📱 Responsive Design**: Seamless experience across all devices
- **🔐 Role-Based Access**: Secure, permission-based functionality

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend API server running on `http://localhost:5000`

### Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd naagrik-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

🌐 **Access the application**: [http://localhost:3000](http://localhost:3000)

---

## 🔑 Demo Accounts

For hackathon evaluation, use these pre-configured accounts:

### 👨‍💼 **Admin Account**
```
Email: admin@naagrik.com
Password: password123
Role: SUPER_ADMIN
```
**Admin Capabilities:**
- Full platform oversight and analytics
- User and steward management
- Zone and category administration
- Application review and approval
- System-wide issue management

### 🛡️ **Steward Account**
```
Email: steward1@naagrik.com
Password: password123
Role: STEWARD
```
**Steward Capabilities:**
- Manage issues in assigned zones
- Update issue status and priority
- Add internal notes and communications
- View zone-specific analytics
- Handle category-specific issues

### 👥 **Citizen Registration**
Citizens can register directly through the platform:
- Visit `/register` to create a new citizen account
- Complete profile with zone selection
- Start reporting and tracking issues immediately

---

## 🏗️ Platform Architecture

### **Frontend Stack**
- **Framework**: Next.js 15.5.0 with App Router
- **UI Library**: React 18 with custom component system
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for efficient store management
- **Maps**: Leaflet.js for interactive geographic features
- **Icons**: Lucide React for consistent iconography

### **Key Technologies**
- **Authentication**: JWT-based with role management
- **API Integration**: RESTful services with error handling
- **Responsive Design**: Mobile-first approach
- **Performance**: Optimized with Next.js features
- **Accessibility**: WCAG 2.1 compliant components

---

## 📋 Core Features

### 🏠 **Citizen Experience**
- **Issue Reporting**: Simple, guided issue submission with location services
- **Progress Tracking**: Real-time status updates and notifications
- **Community Engagement**: Voting, commenting, and social features
- **Personal Dashboard**: Track personal reports and community activity

### 🛡️ **Steward Management**
- **Zone Assignment**: Manage specific geographic zones and issue categories
- **Issue Dashboard**: Comprehensive view of assigned issues with filtering
- **Status Management**: Update issue status, priority, and resolution
- **Performance Analytics**: Track resolution rates and response times
- **Internal Communication**: Add notes and coordinate with other stewards

### ⚡ **Admin Control**
- **User Management**: Comprehensive user oversight and role assignment
- **Steward Operations**: Review applications and manage assignments
- **System Analytics**: Platform-wide statistics and performance metrics
- **Zone Management**: Create and modify geographic boundaries
- **Category Administration**: Manage issue types and classifications

### 🗺️ **Interactive Features**
- **Real-time Maps**: Live issue visualization with filtering capabilities
- **Location Services**: Automatic location detection and manual selection
- **Geographic Insights**: Zone-based analytics and heat maps
- **Mobile Optimization**: Touch-friendly map interactions

---

## 🎨 Design System

### **Color Palette**
- **Primary**: `#1A2A80` - Professional blue for headers and primary actions
- **Secondary**: `#4F46E5` - Accent color for interactive elements
- **Success**: `#10B981` - Status indicators and positive actions
- **Warning**: `#F59E0B` - Alerts and pending states
- **Error**: `#EF4444` - Error states and urgent notifications

### **Typography**
- **Headings**: Inter font family for clarity and professionalism
- **Body**: System fonts for optimal readability
- **Code**: Monospace for technical elements

### **Components**
- **Cards**: Elevated design with subtle shadows and blur effects
- **Buttons**: Consistent styling with hover states and loading indicators
- **Forms**: Accessible inputs with proper validation feedback
- **Navigation**: Intuitive tab systems and breadcrumbs

---

## 🔐 Security & Permissions

### **Role-Based Access Control**
```
SUPER_ADMIN
├── Full platform access
├── User and steward management
├── System configuration
└── All issue management

STEWARD
├── Zone-specific issue management
├── Category assignment handling
├── Status and priority updates
└── Internal communication tools

CITIZEN
├── Issue reporting and tracking
├── Community engagement features
├── Personal dashboard access
└── Public information viewing
```

### **Security Features**
- JWT authentication with secure token management
- Route protection based on user roles
- API endpoint security with permission validation
- Input sanitization and validation
- Secure file upload handling

---

## 📊 Key Metrics & Analytics

### **Performance Indicators**
- **Issue Resolution Rate**: Track steward and zone performance
- **Response Time**: Monitor issue acknowledgment and resolution speed
- **User Engagement**: Measure citizen participation and satisfaction
- **Geographic Distribution**: Analyze issue patterns by location

### **Administrative Insights**
- **Zone Efficiency**: Compare performance across different areas
- **Category Analysis**: Identify common issue types and trends
- **Steward Workload**: Balanced assignment and capacity management
- **System Health**: Platform usage and technical performance

---

## 🛠️ Development

### **Project Structure**
```
src/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── features/          # Feature-specific components
│   ├── layout/            # Layout components
│   ├── pages/             # Page components
│   └── ui/                # Reusable UI components
├── lib/                   # Utilities and configurations
│   ├── api/               # API client and endpoints
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Helper functions
├── store/                 # Zustand state management
└── styles/                # Global styles and themes
```

### **API Integration**
- **RESTful Architecture**: Consistent endpoint design
- **Error Handling**: Comprehensive error management
- **Type Safety**: Proper data validation and formatting
- **Performance**: Optimized queries and caching

### **State Management**
- **Zustand Stores**: Modular state management
- **Persistent State**: Authentication and user preferences
- **Real-time Updates**: Live data synchronization
- **Optimistic Updates**: Improved user experience

---

## 🌐 API Endpoints

### **Authentication**
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - New user registration
- `GET /api/auth/me` - Current user profile

### **Issues Management**
- `GET /api/issues` - List all issues with filtering
- `GET /api/issues/:id` - Get specific issue details
- `POST /api/issues` - Create new issue report
- `PUT /api/issues/:id` - Update issue information

### **Steward Operations**
- `GET /api/stewards/issues/me` - Get assigned issues
- `POST /api/stewards/issues/:id/assign` - Check/assign issue
- `GET /api/stewards/stats/me` - Personal statistics
- `GET /api/stewards/categories/me` - Assigned categories

### **Administrative**
- `GET /api/admin/users` - User management
- `GET /api/admin/stewards` - Steward oversight
- `POST /api/admin/zones` - Zone management
- `PUT /api/admin/assignments` - Assignment management

---

## 🎯 Hackathon Highlights

### **Innovation Features**
1. **Smart Zone Assignment**: Automatic steward assignment based on expertise and workload
2. **Interactive Geographic Visualization**: Real-time issue mapping with filtering
3. **Comprehensive Role Management**: Three-tier access control with granular permissions
4. **Performance Analytics**: Data-driven insights for continuous improvement
5. **Mobile-First Design**: Responsive interface optimized for all devices

### **Technical Excellence**
- **Modern Architecture**: Latest Next.js with App Router
- **Performance Optimization**: Efficient state management and API integration
- **User Experience**: Intuitive navigation and interaction design
- **Scalability**: Modular design ready for production deployment
- **Accessibility**: WCAG-compliant components and navigation

### **Real-World Impact**
- **Civic Engagement**: Encourages citizen participation in local governance
- **Efficient Management**: Streamlines issue resolution workflows
- **Data-Driven Decisions**: Provides insights for better resource allocation
- **Community Building**: Fosters transparency and accountability

---

## 📱 User Workflows

### **Citizen Journey**
1. **Registration** → Choose zone and complete profile
2. **Issue Reporting** → Use location services or manual entry
3. **Tracking** → Monitor progress and receive updates
4. **Engagement** → Vote, comment, and interact with community

### **Steward Workflow**
1. **Application** → Apply for steward role with zone preferences
2. **Assignment** → Receive zone and category assignments
3. **Management** → Handle assigned issues with full toolkit
4. **Analytics** → Track performance and improve response times

### **Admin Operations**
1. **Oversight** → Monitor platform health and user activity
2. **Management** → Review applications and manage assignments
3. **Configuration** → Set up zones, categories, and system settings
4. **Analytics** → Generate reports and performance insights

---

## 🔧 Configuration

### **Environment Variables**
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Map Configuration
NEXT_PUBLIC_DEFAULT_LAT=28.5494
NEXT_PUBLIC_DEFAULT_LNG=77.1923

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

### **Development Commands**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
```

---

## 🎯 Future Enhancements

### **Planned Features**
- **Mobile App**: Native iOS and Android applications
- **AI Integration**: Intelligent issue categorization and routing
- **Real-time Notifications**: Push notifications for status updates
- **Advanced Analytics**: Machine learning insights and predictions
- **Multi-language Support**: Localization for diverse communities

### **Scalability Roadmap**
- **Microservices Architecture**: Distributed system design
- **Cloud Deployment**: AWS/Azure integration
- **Performance Optimization**: CDN and caching strategies
- **Security Enhancements**: Advanced authentication and authorization

---

## 👥 Team & Acknowledgments

**Developed for:** [Hackathon Name]  
**Development Period:** [Date Range]  
**Team Members:** [Your Team Names]

### **Special Thanks**
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first approach
- Lucide React for beautiful icons
- Open source community for continuous inspiration

---

## 📞 Support & Contact

### **Demo Access**
- **Platform URL**: [http://localhost:3000](http://localhost:3000)
- **API Documentation**: Available in `/docs` folder
- **Component Guide**: Comprehensive UI component documentation

### **Technical Support**
- **Issues**: Create GitHub issues for bug reports
- **Documentation**: Refer to `/docs` folder for detailed guides
- **Architecture**: See `PROJECT_ARCHITECTURE.md` for system design

---

<div align="center">

**🏆 Built for the Future of Civic Engagement**

*Naagrik represents the next evolution in digital governance, where technology meets community needs to create more responsive, efficient, and transparent local administration.*

---

**⭐ Star this repository if you found it helpful!**

</div>
