# Project Context for Qwen Code

## Project Overview

This is a Next.js application for recording standup meetings. The application allows team members to submit their daily standup reports, including what they did yesterday, what they plan to do today, and any blockers they're facing.

The application uses Google Workspace authentication, restricted to users with the @hospital-os.com domain.

## Technologies Used

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **PostgreSQL** as the database
- **Prisma** as the ORM
- **NextAuth.js** for authentication

## Project Structure

- `src/app`: Contains the main application pages and API routes
- `src/components`: Reusable React components
- `src/lib`: Utility functions and configurations
- `prisma`: Prisma schema and migrations

## Key Features

1. **Google Workspace Authentication**: Users can sign in with their Google accounts, but only those with @hospital-os.com email addresses can access the application.

2. **Standup Form**: Authenticated users can submit their daily standup reports with fields for yesterday's work, today's plans, and blockers.

3. **Standup List**: View recent standup entries from team members.

## Development Setup

1. Install dependencies: `npm install`
2. Set up the database: `npx prisma migrate dev`
3. Configure Google OAuth credentials in `.env.local`
4. Run the development server: `npm run dev`

## Authentication Flow

1. Users click "Sign in with Google" in the navbar
2. They are redirected to Google's OAuth page
3. After authentication, Google redirects back to the application
4. The application verifies the user's email domain (@hospital-os.com)
5. If verified, the user is logged in and can submit standup reports

## Database Schema

The application uses Prisma with the following models:

- `StandupEntry`: Stores standup report entries
- `User`, `Account`, `Session`: NextAuth.js models for user management

## API Routes

- `/api/auth/[...nextauth]`: NextAuth.js authentication routes
- `/api/standup`: API for creating and fetching standup entries

## Components

- `StandupForm`: Form for submitting standup reports
- `StandupList`: Displays recent standup entries
- `Navbar`: Navigation bar with authentication controls
- `AuthProvider`: NextAuth.js provider wrapper