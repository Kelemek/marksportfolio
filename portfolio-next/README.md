# Mark's Portfolio - Next.js

A modern portfolio website built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Public Portfolio**: Server-side rendered portfolio with ISR (Incremental Static Regeneration)
- **Admin Dashboard**: Protected admin interface to manage projects
- **Magic Link Auth**: Passwordless authentication via Supabase Auth
- **Image Storage**: Upload and manage images via Supabase Storage
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Magic Link)
- **Storage**: Supabase Storage
- **Deployment**: Vercel

## Getting Started

### 1. Clone and Install

```bash
cd portfolio-next
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Enable Email Auth in Authentication > Providers
4. Configure Magic Link in Authentication > Email Templates

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_EMAIL=your-email@example.com
```

### 4. Configure Supabase Auth Redirect URLs

In your Supabase dashboard, go to Authentication > URL Configuration and add:

- Site URL: `http://localhost:3000` (for development)
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://your-domain.vercel.app/auth/callback` (for production)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the portfolio.

## Project Structure

```
portfolio-next/
├── app/
│   ├── admin/              # Admin dashboard pages
│   │   ├── projects/       # Project CRUD pages
│   │   ├── layout.tsx      # Admin layout with nav
│   │   └── page.tsx        # Admin dashboard
│   ├── api/
│   │   └── revalidate/     # ISR revalidation endpoint
│   ├── auth/
│   │   ├── callback/       # Magic link callback
│   │   └── signout/        # Sign out handler
│   ├── login/              # Login page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   ├── admin/
│   │   └── ProjectForm.tsx # Project create/edit form
│   ├── AboutSection.tsx
│   ├── ContactSection.tsx
│   ├── DrawingCard.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── Navigation.tsx
│   └── ProjectCard.tsx
├── lib/
│   └── supabase/
│       ├── client.ts       # Browser Supabase client
│       └── server.ts       # Server Supabase client
├── public/
│   ├── fonts/              # Custom fonts
│   └── images/             # Static images
├── supabase/
│   └── schema.sql          # Database schema + seed data
├── types/
│   └── project.ts          # TypeScript types
├── middleware.ts           # Auth middleware
└── ...config files
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial Next.js portfolio"
git push
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and import your repository
2. Set the root directory to `portfolio-next`
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_EMAIL`
4. Deploy!

### 3. Update Supabase Redirect URLs

After deployment, add your Vercel URL to Supabase Auth redirect URLs:
- `https://your-project.vercel.app/auth/callback`

## Admin Usage

1. Go to `/login`
2. Enter your admin email (must match `ADMIN_EMAIL`)
3. Check your email for the magic link
4. Click the link to access `/admin`
5. Add, edit, or delete projects
6. Changes are automatically reflected on the public site via ISR

## Uploading Images

After setting up Supabase Storage:

1. Upload existing images to the `images` bucket in Supabase dashboard
2. Update project `image_url` fields with the public URLs
3. Or use the admin form to upload images directly

## License

Based on template by Nisar Hassan Naqvi (MIT License).
