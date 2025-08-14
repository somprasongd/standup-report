# Project Context for Qwen Code

## Project Overview

This is a Next.js application for recording standup meetings. The application allows team members to submit their daily standup reports, including what they did yesterday, what they plan to do today, and any blockers they're facing.

The application uses Google Workspace authentication, restricted to users with the @hospital-os.com domain.

## Technologies Used

- **Next.js 15.4.6** with App Router
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **PostgreSQL 17** as the database
- **Prisma 6.14.0** as the ORM
- **NextAuth.js 4.24.11** for authentication
- **Shadcn UI** components
- **React 19.1.0**
- **Radix UI** for accessible UI primitives
- **Lucide React** for icons

## Project Structure

- `src/app`: Contains the main application pages and API routes
  - `api`: API routes
  - `layout.tsx`: Root layout component
  - `page.tsx`: Main page component
- `src/components`: Reusable React components
  - `ui`: Shadcn UI components
  - `StandupForm.tsx`: Form for submitting standup reports
  - `StandupList.tsx`: Displays recent standup entries with view mode toggle
  - `StandupListContent.tsx`: Core component for rendering standup entries in different layouts
  - `Navbar.tsx`: Navigation bar with authentication controls
  - `Footer.tsx`: Footer component
  - `AuthProvider.tsx`: NextAuth.js provider wrapper
- `src/lib`: Utility functions and configurations
  - `auth.ts`: Authentication utilities
  - `prisma.ts`: Prisma client configuration
  - `utils.ts`: General utility functions
- `prisma`: Prisma schema and migrations
  - `schema.prisma`: Database schema definition
  - `migrations`: Database migration files

## Key Features

1. **Google Workspace Authentication**: Users can sign in with their Google accounts, but only those with @hospital-os.com email addresses can access the application.

2. **Standup Form**: Authenticated users can submit their daily standup reports with fields for yesterday's work, today's plans, and blockers.
   - **Edit Functionality**: Users can edit their existing standup entries for the current day
   - **Markdown Support**: Rich text formatting using Markdown in all fields

3. **Standup List**: View standup entries from team members with date navigation and two viewing modes:
   - **Grid View**: Traditional card-based layout with scrollable content
   - **Kanban View**: Board-based layout with separate scrollbars for each column
   - **Date Navigation**: Navigate between dates to view historical entries
   - **Real-time Updates**: Automatic refresh when new entries are added

4. **Responsive Design**: Fully responsive layout that works on mobile, tablet, and desktop devices

## Recent Improvements

- **Responsive Layout**: The application uses a full-height layout that properly fits the viewport without browser scrollbars
- **Scrollable Components**:
  - Grid view has scrollable content area
  - Kanban view has separate scrollbars for each board column
- **Footer Visibility**: The footer is always visible without requiring page scrolling
- **Date Navigation**: Users can navigate between dates to view historical standup entries
- **Real-time Updates**: Automatic refresh when new entries are added or existing entries are updated
- **View Mode Persistence**: The selected view mode (grid or kanban) is saved in localStorage
- **Markdown Support**: Rich text formatting using Markdown in all standup fields
- **Enhanced Error Handling**: Improved error messages and user feedback throughout the application
- **Code Quality**: Removed unused code and dependencies for better maintainability
- **Content Expansion**: Added modal functionality for viewing full content when text is truncated in both Grid and Kanban views

## Development Setup

1. Install dependencies: `npm install`
2. Set up the database: `npx prisma migrate dev`
3. Generate Prisma client: `npx prisma generate`
4. Configure environment variables in `.env.local`:

   ```env
   DATABASE_URL=your_database_url_here
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here
   ```

5. Run the development server: `npm run dev`

## Docker Development

The application includes Docker support for easier development and deployment:

1. Build and run with Docker Compose: `docker-compose up -d`
2. The application will be available at `http://localhost:3000`

Note: Update the environment variables in `docker-compose.yml` before running.

## Authentication Flow

1. Users click "Sign in with Google" in the navbar
2. They are redirected to Google's OAuth page
3. After authentication, Google redirects back to the application
4. The application verifies the user's email domain (@hospital-os.com) in the `signIn` callback
5. If verified, the user is logged in and can submit standup reports
6. The user's ID is added to the session object for use in API calls

## Database Schema

The application uses Prisma with the following models:

- `StandupEntry`: Stores standup report entries
  - `id`: Auto-incrementing integer ID
  - `createdAt`: DateTime when the entry was created
  - `updatedAt`: DateTime when the entry was last updated
  - `yesterday`: String containing yesterday's work
  - `today`: String containing today's plans
  - `blockers`: Optional string containing blockers
  - `userId`: String referencing the User model
  - `user`: Relation to the User model
- `User`: NextAuth.js model for user management
  - `id`: String ID (CUID)
  - `name`: Optional user name
  - `email`: Unique email address
  - `emailVerified`: Optional datetime when email was verified
  - `image`: Optional user image URL
  - `accounts`: Relation to Account model
  - `sessions`: Relation to Session model
  - `standupEntries`: Relation to StandupEntry model
- `Account`: NextAuth.js model for user accounts
  - `id`: String ID (CUID)
  - `userId`: String referencing the User model
  - `type`: Account type
  - `provider`: Authentication provider
  - `providerAccountId`: Provider-specific account ID
  - `refresh_token`: Optional refresh token
  - `access_token`: Optional access token
  - `expires_at`: Optional token expiration timestamp
  - `token_type`: Optional token type
  - `scope`: Optional scope
  - `id_token`: Optional ID token
  - `session_state`: Optional session state
  - `user`: Relation to the User model
- `Session`: NextAuth.js model for user sessions
  - `id`: String ID (CUID)
  - `sessionToken`: Unique session token
  - `userId`: String referencing the User model
  - `expires`: DateTime when the session expires
  - `user`: Relation to the User model

## API Routes

- `/api/auth/[...nextauth]`: NextAuth.js authentication routes
- `/api/standup`: API for creating standup entries
- `/api/standup/[id]`: API for updating and deleting specific standup entries
- `/api/standup/get`: API for fetching standup entries
- `/api/standup/check`: API for checking if a user has already submitted an entry today
- `/api/health`: API for health checks

## Components

- `StandupForm`: Form for submitting standup reports with edit/delete functionality
- `StandupList`: Displays recent standup entries with view mode toggle
- `StandupListContent`: Core component for rendering standup entries in different layouts
- `Navbar`: Navigation bar with authentication controls
- `Footer`: Footer component
- `AuthProvider`: NextAuth.js provider wrapper
- `StandupDialog`: Floating action button with dialog for creating/editing standup entries

## Development Guidelines

### Code Structure & Architecture

- Follow Next.js App Router patterns with proper separation of server and client components
- Use the `src/app` directory for pages and API routes
- Place reusable components in `src/components`
- Keep business logic in `src/lib` utilities
- Use PascalCase for component files (e.g., `UserCard.tsx`)
- Use named exports for all components and utilities
- Prefer functional components with TypeScript interfaces

### Styling & UI Components

- Use Tailwind CSS v4 for styling with utility-first approach
- Leverage Shadcn UI components for consistent UI patterns
- Use Radix UI primitives for accessible, customizable components
- Follow responsive design principles for all components
- Use Lucide React icons for consistent iconography
- Implement dark mode support where appropriate

### State Management

- Use React Context API for global state management
- Leverage React hooks for local component state
- Use server components for data fetching when possible
- Implement client-side caching with appropriate strategies

### Data Fetching & API

- Use server-side data fetching in Server Components where possible
- Implement proper error handling for all API calls
- Use RESTful API design principles
- Implement proper authentication checks in API routes
- Use Prisma for database operations with proper error handling
- Optimize database queries with appropriate where clauses and includes

### Security Practices

- Implement proper authentication checks in all components and API routes
- Validate and sanitize all user inputs
- Use environment variables for sensitive configuration
- Implement proper authorization checks for user actions
- Follow OWASP Top 10 security principles
- Use HTTPS in production environments
- Implement proper CORS policies

### Database Best Practices

- Use Prisma Schema for type-safe database operations
- Implement proper database indexing for frequently queried fields
- Use date range queries for efficient filtering of time-based data
- Avoid N+1 queries by using proper Prisma includes
- Implement proper data validation at the application level
- Use database transactions for operations that modify multiple records

### Git & Development Workflow

- Write clear, concise commit messages following conventional commits format
- Squash trivial commits before merging to main branch
- Keep pull requests focused on single features or fixes
- Update documentation when making significant changes
- Ensure `.gitignore` is properly configured for Next.js projects
- Use feature branches for all new development work

### Testing

- Write unit tests for utility functions and complex logic
- Implement integration tests for API routes
- Use end-to-end testing for critical user flows
- Test components with various data scenarios
- Ensure authentication and authorization are properly tested

### Performance Optimization

- Use dynamic imports for code splitting where appropriate
- Implement proper loading states for asynchronous operations
- Optimize images and static assets
- Use React.memo for components with expensive render operations
- Implement proper pagination for large data sets
- Minimize bundle size by analyzing and removing unused dependencies
