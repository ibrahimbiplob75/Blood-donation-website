# Blood Donation Management System - Frontend

## Project Overview

A comprehensive web application for managing blood donation services, connecting donors with recipients, and maintaining blood inventory. The system facilitates blood donation registration, blood requests, donor management, and administrative oversight of blood bank operations.

**Target Audience:** Blood donors, recipients, hospitals, and blood bank administrators

**Primary Features:**
- Blood donation registration and donor profile management
- Blood request submission and tracking
- Real-time blood inventory management
- Admin dashboard with comprehensive statistics
- User authentication with Firebase and custom backend
- Multi-role access control (Admin, Moderator, Donor, Recipient)
- Bulk data upload via Excel files
- PDF and QR code generation for donor records

---

## Tech Stack

### Core Framework & Build Tools
- **React 18.3.1** - UI library
- **Vite 6.3.5** - Build tool and development server
- **React Router DOM 6.28.0** - Client-side routing

### State Management & Data Fetching
- **TanStack Query (React Query) 5.90.16** - Server state management and data caching
- **React Context API** - Global state management for authentication and user data

### Authentication & Authorization
- **Firebase 12.4.0** - Authentication (Email/Password, Google OAuth)
- **Custom JWT Backend** - Admin authentication with HTTP-only cookies
- **Cross-domain authentication** - Synchronized auth across multiple domains

### UI & Styling
- **Tailwind CSS 3.4.14** - Utility-first CSS framework
- **DaisyUI 4.12.14** - Tailwind CSS component library
- **PostCSS 8.4.47** - CSS processing
- **Autoprefixer 10.4.20** - CSS vendor prefixing

### HTTP & API Communication
- **Axios 1.7.7** - HTTP client with interceptors
- **Custom Axios instances** - Secure and public API endpoints

### Animation & User Experience
- **Framer Motion 12.23.12** - Animation library
- **React Slick 0.31.0** - Carousel/slider component
- **React CountUp 6.5.3** - Animated number counters
- **SweetAlert2 11.26.3** - Beautiful alert modals

### Icons & Assets
- **React Icons 5.5.0** - Icon library
- **Lucide React 0.525.0** - Modern icon library

### Forms & Validation
- **React Hook Form 7.65.0** - Form state management and validation

### Document Generation
- **jsPDF 3.0.1** - PDF generation
- **@react-pdf/renderer 4.3.0** - React-based PDF rendering
- **QRCode 1.5.4** - QR code generation
- **React to Print 3.0.2** - Print functionality

### Data Processing
- **XLSX 0.18.5** - Excel file parsing and generation

### Development Tools
- **ESLint 9.13.0** - Code linting
- **@vitejs/plugin-react 4.3.3** - Vite React plugin
- **TypeScript type definitions** - Type support for React

### Deployment
- **Firebase Hosting** - Production deployment
- **Docker** - Containerization support

---

## Project Directory Structure

```
Frontend/
├── .firebase/                    # Firebase deployment cache
├── dist/                         # Production build output (generated)
├── node_modules/                 # Dependencies (generated)
├── public/                       # Static assets
│   ├── assets/
│   │   ├── icons/               # Icon assets
│   │   │   └── .gitkeep
│   │   └── images/              # Image assets
│   │       ├── footerBg.webp    # Footer background image
│   │       └── .gitkeep
│   └── index.html               # Fallback HTML (legacy)
│
├── src/                         # Source code
│   ├── components/              # React components organized by feature
│   │   ├── Home/
│   │   │   └── Home.jsx         # Landing page with hero, stats, and blood requests
│   │   │
│   │   ├── admin/               # Admin dashboard components
│   │   │   ├── AdminManagement.jsx      # Admin user management
│   │   │   ├── ApprovalManagement.jsx   # Blood donation approval system
│   │   │   ├── Dashboard.jsx            # Admin dashboard layout/sidebar
│   │   │   ├── DashboardHome.jsx        # Admin dashboard homepage
│   │   │   ├── Statistics.jsx           # Admin statistics visualization
│   │   │   └── UserManagement.jsx       # User CRUD operations
│   │   │
│   │   ├── common/              # Shared/reusable components
│   │   │   ├── Header.jsx       # Common header component
│   │   │   ├── ProtectedRoute.jsx # Route guard component
│   │   │   └── Spinner.jsx      # Loading spinner
│   │   │
│   │   ├── donor/               # Donor-related components
│   │   │   ├── DonateBloodModal.jsx     # Donation registration modal
│   │   │   ├── DonorHistory.jsx         # Donor's donation history
│   │   │   ├── DonorProfile.jsx         # Donor profile view
│   │   │   └── DonorRegistration.jsx    # New donor registration
│   │   │
│   │   ├── inventory/           # Blood inventory management
│   │   │   ├── BloodBank.jsx            # Donor list/blood bank view
│   │   │   ├── BloodDataUpload.jsx      # Excel bulk upload for donors
│   │   │   ├── BloodExchange.jsx        # Blood exchange functionality
│   │   │   ├── BloodStock.jsx           # Blood inventory stock levels
│   │   │   ├── Bloodbnk.jsx             # Alternative blood bank component
│   │   │   ├── Statistics.jsx           # Inventory statistics (empty)
│   │   │   └── StockManagement.jsx      # Stock management utilities
│   │   │
│   │   └── request/             # Blood request components
│   │       ├── BloodRequests.jsx        # List and manage blood requests
│   │       ├── RequestDetails.jsx       # Request detail view
│   │       ├── RequestForm.jsx          # Request creation form
│   │       └── RequestModal.jsx         # Request modal dialog
│   │
│   ├── context/                 # React Context providers and auth
│   │   ├── AdminRoute.jsx       # Admin route protection HOC
│   │   ├── AuthContext.jsx      # Legacy auth context (deprecated)
│   │   ├── AxiosPublic.jsx      # Public Axios instance hook
│   │   ├── CheckAdmin.jsx       # Admin verification utility
│   │   ├── ContextProvider.jsx  # Main auth context provider
│   │   ├── Moderator.jsx        # Moderator route protection
│   │   └── UseAxiosSecure.jsx   # Secure Axios instance with auth
│   │
│   ├── Firebase/                # Firebase configuration
│   │   └── firebase.js          # Firebase initialization and auth setup
│   │
│   ├── Hooks/                   # Custom React hooks
│   │   ├── useAuth.js           # Authentication hook
│   │   ├── useAuthQuery.js      # Auth with React Query integration
│   │   ├── useAxios.js          # Axios instance hook
│   │   └── useRole.js           # User role checking hook
│   │
│   ├── pages/                   # Top-level page components
│   │   ├── About.jsx            # About page
│   │   ├── Blogs.jsx            # Blog/news page
│   │   ├── Donors.jsx           # Public donor list page
│   │   ├── Requests.jsx         # Blood requests page
│   │   └── Userprofile.jsx      # User profile page
│   │
│   ├── services/                # API service layer
│   │   ├── api.js               # Base Axios configuration
│   │   └── donorService.js      # Donor-specific API calls
│   │
│   ├── shared/                  # Shared UI components
│   │   ├── types/               # Type definitions (JSDoc)
│   │   │   ├── blood.types.js   # Blood-related type definitions
│   │   │   └── user.types.js    # User type definitions
│   │   │
│   │   ├── BloodStock.jsx       # Shared blood stock component
│   │   ├── Button.jsx           # Reusable button component
│   │   ├── Construction.jsx     # Under construction placeholder
│   │   ├── Footer.jsx           # Application footer
│   │   ├── Header.jsx           # Application header/navigation
│   │   ├── Loader.jsx           # Loading component
│   │   ├── Login.jsx            # Login page/form
│   │   ├── Register.jsx         # Registration page/form
│   │   ├── SocialLogin.jsx      # Social login buttons
│   │   └── Spinner.jsx          # Loading spinner
│   │
│   ├── utils/                   # Utility functions
│   │   ├── constants.js         # App-wide constants (blood groups, roles, etc.)
│   │   ├── crossDomainAuth.js   # Cross-domain authentication utilities
│   │   ├── helpers.js           # General helper functions
│   │   ├── tokenManager.js      # JWT token management (localStorage)
│   │   └── validators.js        # Form validation utilities
│   │
│   ├── App.jsx                  # Root App component with layout
│   ├── index.css                # Global CSS and Tailwind imports
│   └── main.jsx                 # Application entry point with routing
│
├── .env                         # Environment variables (gitignored)
├── .env.example                 # Example environment variables
├── .env.local                   # Local environment overrides
├── .firebaserc                  # Firebase project configuration
├── .gitignore                   # Git ignore rules
├── Dockerfile                   # Docker containerization
├── README.md                    # Basic project readme
├── eslint.config.js             # ESLint configuration
├── firebase.json                # Firebase hosting configuration
├── index.html                   # HTML entry point
├── package-lock.json            # Dependency lock file
├── package.json                 # Project dependencies and scripts
├── postcss.config.js            # PostCSS configuration
├── static.json                  # Static file routing config
├── tailwind.config.js           # Tailwind CSS configuration
└── vite.config.js               # Vite build configuration
```

---

## Detailed Directory Descriptions

### `/src/components/`
Feature-based component organization with clear separation of concerns:

#### `Home/`
- **Home.jsx**: Main landing page featuring hero section, blood donation eligibility checker, latest blood requests carousel, FAQ section, statistics dashboard, and call-to-action buttons

#### `admin/`
Administrative dashboard and management interfaces:
- **Dashboard.jsx**: Admin sidebar layout with navigation menu
- **DashboardHome.jsx**: Admin dashboard overview with key metrics
- **UserManagement.jsx**: CRUD operations for managing users
- **AdminManagement.jsx**: Admin and moderator management
- **ApprovalManagement.jsx**: Review and approve pending donations
- **Statistics.jsx**: Data visualization for blood bank statistics

#### `common/`
Reusable cross-cutting components:
- **Header.jsx**: Alternative header component
- **ProtectedRoute.jsx**: Route guard for authenticated routes
- **Spinner.jsx**: Loading indicator

#### `donor/`
Donor registration and profile management:
- **DonateBloodModal.jsx**: Modal form for donation registration
- **DonorRegistration.jsx**: Full page donor registration form
- **DonorProfile.jsx**: Display and edit donor profile
- **DonorHistory.jsx**: View past donations and statistics

#### `inventory/`
Blood inventory and stock management:
- **BloodStock.jsx**: Main blood inventory dashboard showing stock levels by blood group
- **BloodBank.jsx**: List of registered donors with filters
- **BloodDataUpload.jsx**: Bulk upload donors from Excel file
- **StockManagement.jsx**: Utilities for managing stock levels
- **BloodExchange.jsx**: Inter-facility blood exchange
- **Bloodbnk.jsx**: Alternative blood bank listing view

#### `request/`
Blood request management workflow:
- **BloodRequests.jsx**: List all blood requests with filtering and status tracking
- **RequestModal.jsx**: Create new blood request via modal
- **RequestForm.jsx**: Blood request form component
- **RequestDetails.jsx**: Detailed view of a single request

### `/src/context/`
React Context providers for global state management:

- **ContextProvider.jsx**: Main authentication provider managing:
  - Firebase authentication state
  - Backend JWT token management
  - Admin session verification
  - Cross-domain/cross-tab logout
  - User role detection

- **AdminRoute.jsx**: Higher-order component protecting admin-only routes
- **Moderator.jsx**: Route protection for moderators
- **AxiosPublic.jsx**: Hook providing public Axios instance
- **UseAxiosSecure.jsx**: Hook providing authenticated Axios instance with token injection

### `/src/Firebase/`
Firebase configuration and initialization:
- **firebase.js**: Firebase app initialization, authentication setup, exports Firebase auth methods

### `/src/Hooks/`
Custom React hooks for reusable logic:
- **useAuth.js**: Access authentication context
- **useAuthQuery.js**: Authentication integrated with React Query
- **useAxios.js**: Get configured Axios instance
- **useRole.js**: Check user role permissions

### `/src/pages/`
Top-level route components:
- **About.jsx**: About page with mission and team information
- **Blogs.jsx**: Blog posts or news section
- **Donors.jsx**: Public-facing donor directory
- **Requests.jsx**: Public blood request listings
- **Userprofile.jsx**: User profile dashboard with edit capabilities

### `/src/services/`
API service abstraction layer:
- **api.js**: Base Axios instance with request/response interceptors for token management and error handling
- **donorService.js**: Donor-specific API endpoints

### `/src/shared/`
Globally shared components and type definitions:

**Components:**
- **Header.jsx**: Main navigation header with authentication state
- **Footer.jsx**: Application footer with links and contact info
- **Login.jsx**: Login form with email/password and Google OAuth
- **Register.jsx**: User registration form
- **SocialLogin.jsx**: Social authentication buttons
- **BloodStock.jsx**: Reusable blood inventory display
- **Loader.jsx**, **Spinner.jsx**, **Button.jsx**: UI primitives
- **Construction.jsx**: Placeholder for under-construction pages

**Types:**
- **blood.types.js**: Blood group, request status, urgency level type definitions
- **user.types.js**: User role and profile type definitions

### `/src/utils/`
Utility modules for common operations:
- **constants.js**: Application constants (blood groups, user roles, request statuses, API endpoints, eligibility criteria)
- **tokenManager.js**: JWT token storage and retrieval from localStorage
- **crossDomainAuth.js**: Cross-domain logout synchronization using BroadcastChannel and localStorage events
- **validators.js**: Form validation helpers
- **helpers.js**: General utility functions

### `/public/`
Static assets served directly:
- **assets/icons/**: Icon files
- **assets/images/**: Image assets (logos, backgrounds)

---

## Application Architecture

### Authentication Flow

1. **Firebase Authentication** (Regular Users):
   - Email/Password and Google OAuth
   - JWT token obtained from backend `/jwt` endpoint
   - Token stored in localStorage
   - User role fetched from backend `/users` endpoint

2. **Backend Authentication** (Admins):
   - Direct login to backend admin endpoint
   - HTTP-only cookie for session management
   - Session verified via `/admin/verify-token` endpoint
   - Admin token managed separately from user tokens

3. **Cross-Domain Authentication**:
   - BroadcastChannel API for same-domain cross-tab communication
   - localStorage events for cross-domain synchronization
   - Unified logout across all tabs and domains

### Routing Structure

**Public Routes** (via App.jsx):
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/profile` - User profile (authenticated)
- `/blood-bank` - Public donor directory
- `/blood-requests` - Public blood requests
- `/blogs` - Blog posts
- `/about` - About page

**Admin Routes** (via Dashboard.jsx, protected by AdminRoute):
- `/admin` - Dashboard home
- `/admin/blood-upload` - Bulk donor upload
- `/admin/blood-stock` - Inventory management
- `/admin/donar-list` - Donor list management
- `/admin/donor-history` - Donation history
- `/admin/statistics` - Statistics dashboard
- `/admin/approvals` - Approval queue
- `/admin/blood-requests` - Request management
- `/admin/user-management` - User administration

### State Management Strategy

1. **React Query** (TanStack Query):
   - Server state caching and synchronization
   - Automatic refetching and background updates
   - Optimistic updates for better UX
   - Configured with 5-minute stale time and 10-minute cache time

2. **React Context**:
   - Authentication state (user, loading, role, isAdmin)
   - Auth methods (login, logout, register, etc.)

3. **Local Component State**:
   - Form inputs and UI state
   - Modal visibility
   - Filters and pagination

### API Communication

**Base URL**: Configured via `VITE_API_URL` environment variable
- Production: `https://rmc-blood-club.vercel.app`
- Development: `http://localhost:5001`

**Axios Interceptors**:
- Request: Automatically attach JWT token from localStorage
- Response: Handle 401 errors by redirecting to login

**Axios Instances**:
- **Public**: No authentication (registration, public listings)
- **Secure**: Authenticated requests with token injection

---

## Key Features Explained

### 1. Blood Donation Registration
- Donors fill form with personal info, blood group, medical history
- Eligibility verification based on age, weight, health status
- QR code generation for easy donor identification
- PDF certificate generation for donors

### 2. Blood Request Management
- Urgency levels: Normal, Urgent, Emergency
- Request status tracking: Pending, Approved, Fulfilled, Rejected, Cancelled
- Hospital/location information
- Request approval workflow for admins

### 3. Blood Inventory Management
- Real-time stock levels by blood group
- Low stock alerts
- Donation and distribution tracking
- Bulk upload via Excel files (XLSX)

### 4. Admin Dashboard
- User management (CRUD operations)
- Donation approval queue
- Statistics and analytics
- Role-based access control (Admin, Moderator)

### 5. Multi-Role Access Control
- **Admin**: Full system access
- **Moderator**: Limited admin capabilities
- **Donor**: Donation registration and history
- **Recipient**: Blood request submission
- **User**: Basic authenticated access

---

## Environment Variables

Required environment variables (see `.env.example`):

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# API Configuration
VITE_API_URL=https://rmc-blood-club.vercel.app

# Environment
VITE_ENV=development
```

---

## Available Scripts

Defined in `package.json`:

### Development
```bash
npm run dev
```
Starts Vite development server with hot module replacement (HMR)
- Default port: 5173
- Accessible at: http://localhost:5173

### Production Build
```bash
npm run build
```
Creates optimized production build in `/dist` folder
- Minified and bundled
- Tree-shaking applied
- Source maps generated

### Linting
```bash
npm run lint
```
Runs ESLint on all source files to check code quality

### Preview
```bash
npm run preview
```
Preview production build locally before deployment

---

## Build & Deployment

### Docker Deployment
Dockerfile uses multi-stage build:
1. **deps**: Install dependencies
2. **build**: Create production build
3. **runner**: Serve static files

Build command:
```bash
docker build -t blood-donation-frontend .
```

Run command:
```bash
docker run -p 5173:5173 blood-donation-frontend
```

### Firebase Hosting
Configured via `firebase.json`:
- Public directory: `dist`
- SPA routing: All routes redirect to `/index.html`
- Deploy: `firebase deploy`

### Manual Deployment
1. Build: `npm run build`
2. Upload `/dist` folder to static hosting
3. Configure SPA routing (see `static.json` for reference)

---

## Code Quality & Standards

### ESLint Configuration
- **Plugins**: React, React Hooks, React Refresh
- **Rules**:
  - Recommended JavaScript rules
  - Recommended React rules
  - React Hooks rules for proper hook usage
  - JSX runtime configuration

### Tailwind CSS Configuration
- **Theme**: DaisyUI with light, dark, and cupcake themes
- **Content**: Scans all JSX/TSX files in src and index.html
- **Plugins**: DaisyUI component library

### PostCSS Configuration
- Tailwind CSS processing
- Autoprefixer for browser compatibility

---

## Data Models

### Blood Groups
`['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']`

### User Roles
- `admin` - Full system access
- `moderator` - Limited admin access
- `donor` - Can donate blood
- `hospital` - Can request blood
- `recipient` - Can request blood
- `user` - Basic authenticated user

### Request Statuses
- `pending` - Awaiting approval
- `approved` - Approved, seeking donors
- `fulfilled` - Request completed
- `rejected` - Request denied
- `cancelled` - Request cancelled by requester

### Urgency Levels
- `normal` - Standard request
- `urgent` - Time-sensitive
- `emergency` - Critical, immediate need

### Donation Eligibility Criteria
- Min Age: 18 years
- Max Age: 65 years
- Min Weight: 50 kg
- Donation Interval: 90 days (3 months)

---

## Security Considerations

1. **Token Management**:
   - JWT tokens stored in localStorage (consider httpOnly cookies for production)
   - Admin tokens use HTTP-only cookies
   - Tokens include expiration timestamps

2. **Route Protection**:
   - AdminRoute HOC verifies admin status before rendering
   - ProtectedRoute ensures authentication
   - Moderator routes check moderator role

3. **API Security**:
   - CORS configured on backend
   - Request interceptors attach auth tokens
   - Response interceptors handle unauthorized access

4. **Input Validation**:
   - React Hook Form validation
   - Backend validation (assumed)
   - SweetAlert2 for user-friendly error messages

5. **Cross-Domain Auth**:
   - BroadcastChannel for same-origin communication
   - localStorage events for cross-domain logout
   - Firebase IndexedDB cleanup on logout

---

## Performance Optimizations

1. **Code Splitting**:
   - Vite automatically splits vendor and app code
   - Dynamic imports for large components (potential improvement)

2. **Caching Strategy**:
   - React Query caches server state for 10 minutes
   - Stale data refetched after 5 minutes
   - Background refetching disabled on window focus

3. **Image Optimization**:
   - WebP format for images
   - Lazy loading (can be improved with React.lazy)

4. **Bundle Optimization**:
   - Tree-shaking enabled by Vite
   - Minification and compression in production

---

## Known Issues & Future Improvements

### Current Issues
- Mixed authentication approaches (Firebase + custom backend)
- Token storage in localStorage (security concern)
- Some duplicate components (e.g., Header.jsx in multiple locations)
- Empty component files (inventory/Statistics.jsx)

### Suggested Improvements
1. Consolidate authentication to single approach
2. Implement HTTP-only cookies for all tokens
3. Add comprehensive error boundaries
4. Implement lazy loading for route components
5. Add unit and integration tests
6. Improve accessibility (ARIA labels, keyboard navigation)
7. Add Progressive Web App (PWA) capabilities
8. Implement real-time updates with WebSockets
9. Add internationalization (i18n) for multiple languages
10. Implement comprehensive logging and monitoring

---

## Dependencies Summary

### Production Dependencies (34)
Core libraries required for the application to run in production.

### Development Dependencies (10)
Tools used during development (linting, building, type definitions).

**Total package size**: ~419 packages in node_modules (including transitive dependencies)

---

## Browser Support

Based on Vite and Tailwind CSS defaults:
- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

Modern browsers with ES2020 support.

---

## Contributing Guidelines

1. Follow existing code structure and naming conventions
2. Use functional components with hooks
3. Implement proper error handling
4. Add meaningful comments for complex logic
5. Test thoroughly before submitting
6. Keep components small and focused
7. Use TypeScript-style JSDoc comments for type hints

---

## Project Metadata

- **Project Name**: blood-donation-client-site
- **Version**: 0.0.0
- **Type**: ES Module
- **Node Version**: 20+ (based on Dockerfile)
- **License**: Not specified
- **Last Updated**: January 2026

---

## Contact & Support

For issues or questions, refer to the project repository or contact the development team.

---

*This documentation was generated based on the project structure as of January 30, 2026.*
