# Diagnostic SaaS MVP

Diagnostic SaaS platform built with Next.js, Tailwind, Turso, and Gemini.

## Public Access & API

### Public Quiz Page
- URL: `/q/[slug]`
- Powered by `GET /api/q/[slug]`
- **Status Behavior**:
    - `PUBLIC`: Accessible, Indexed (s-maxage=60)
    - `UNLISTED`: Accessible, NoIndex (no-store)
    - `DRAFT`: 404 Not Found

### API Routes
- `GET /api/q/[slug]`: Get public quiz data.
- `GET /api/q/[slug]/promo-card`: Generate social image on the fly.
- `POST /api/events`: Track analytics (views, starts, etc.).

## Setup Instructions

### 1. Environment Variables
Copy `.env` and fill in the values:

```bash
# Turso / LibSQL
TURSO_DATABASE_URL="libsql://your-db.turso.io"
TURSO_AUTH_TOKEN="your-token"

# Auth.js
AUTH_SECRET="run-npx-auth-secret-to-generate"

# Resend (Email)
RESEND_API_KEY="re_..."
EMAIL_FROM="onboarding@resend.dev"

# Google Gemini
GOOGLE_GEMINI_API_KEY="AIza..."

# App URL (Critical for API Fetching)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Migration
Once keys are set:
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```

## Features
- **Dashboard**: Manage your diagnostics.
- **AI Creation**: Generate quiz drafts using Gemini.
- **Public View**: Users take diagnostics and get results.
- **Share Assets**: Generate promo cards and text.
