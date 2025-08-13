# Team Standup Report

A simple web application for team standup meetings built with Next.js, Tailwind CSS, and PostgreSQL.

## Features

- Google Workspace authentication (restricted to @hospital-os.com domain)
- Submit daily standup reports
- View recent standup entries

## Setup Instructions

### Prerequisites

- Node.js (version 16 or higher)
- PostgreSQL database
- Google Cloud account for OAuth setup

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd standup-report
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

### Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Choose "Web application" as the application type
6. Add the following redirect URIs:
   - For local development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
7. Save the credentials

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
DATABASE_URL=your_database_url_here
```

### Running the Application

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Deployment

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm start
```