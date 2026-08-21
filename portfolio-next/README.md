# Mark's Portfolio - Next.js

A modern portfolio website built with Next.js 16, TypeScript, Tailwind CSS v4, and Supabase.

## Features

### Public Site

- **Coding & Drawing Projects**: Server-rendered project showcases with ISR (Incremental Static Regeneration, 60s revalidate)
- **About Section**: Bio and self-portrait
- **Contact Section**: Email and social links
- **Project Detail Pages**: Individual project pages at `/projects/[slug]`
- **Responsive Design**: Mobile-first design with Tailwind CSS

### Admin Dashboard

Protected admin interface at `/admin` for managing all site content:

| Section | Path | Description |
|---------|------|-------------|
| **Projects** | `/admin` | CRUD for coding and drawing projects; drag-and-drop reorder; visibility toggle |
| **Skills** | `/admin/skills` | Manage skills by category (systems, development); drag-and-drop reorder |
| **Certificates** | `/admin/certificates` | CRUD for education and Scrimba certificates; PDF uploads |
| **Jobs** | `/admin/jobs` | Work experience entries with achievements and responsibilities; drag-and-drop reorder |
| **Settings** | `/admin/settings` | Key-value settings (e.g., resume URL, contact info) |

**Admin Tools:**

- **Deploy Resume**: Triggers Vercel deploy hook to rebuild resume sub-project
- **Email OTP Auth**: Passwordless login via Supabase Auth (6-digit verification code)

---

## Tech Stack

### Core

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16 | App Router, server components, API routes |
| **React** | 19 | UI framework |
| **TypeScript** | 5.9 | Type safety |
| **Tailwind CSS** | 4.1 | Styling (CSS-first config with `@theme`) |

### Backend & Data

| Technology | Purpose |
|------------|---------|
| **Supabase** | PostgreSQL database, Auth (Email OTP), Storage |
| **@supabase/ssr** | Server-side auth with cookie handling |

### UI & Interaction

| Package | Purpose |
|---------|---------|
| **@dnd-kit/core** | Drag-and-drop foundation |
| **@dnd-kit/sortable** | Sortable lists for admin reordering |

### Analytics & Monitoring

| Tool | Purpose |
|------|---------|
| **PostHog** | Web analytics, session replay (optional, via `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`) |

### Testing

| Tool | Purpose |
|------|---------|
| **Vitest** | Test runner |
| **@testing-library/react** | Component testing |
| **happy-dom** | DOM environment for tests |
| **@vitest/coverage-v8** | Coverage reporting |

### Build & Tooling

| Tool | Purpose |
|------|---------|
| **ESLint** | Linting (eslint-config-next) |
| **PostCSS** | CSS processing (@tailwindcss/postcss) |

---

## Project Structure

```
portfolio-next/
├── app/
│   ├── admin/                    # Admin dashboard
│   │   ├── projects/             # Project CRUD (new, [id]/edit)
│   │   ├── skills/               # Skills CRUD
│   │   ├── certificates/         # Certificates CRUD
│   │   ├── jobs/                 # Jobs CRUD
│   │   ├── settings/             # Settings CRUD
│   │   └── layout.tsx            # Admin layout + nav
│   ├── api/                      # API routes
│   │   ├── revalidate/           # ISR revalidation
│   │   ├── deploy-resume/        # Vercel deploy hook trigger
│   │   ├── projects/             # delete, reorder, visibility
│   │   ├── skills/               # delete, reorder
│   │   ├── certificates/         # delete, reorder
│   │   ├── jobs/                 # delete, reorder
│   │   └── settings/             # delete
│   ├── auth/callback/            # Legacy magic-link callback (optional)
│   ├── auth/signout/             # Sign out handler
│   ├── login/                    # Login page
│   ├── projects/[slug]/          # Project detail page
│   └── page.tsx                  # Home page
├── components/
│   ├── admin/                    # Admin forms & clients
│   │   ├── ProjectForm.tsx
│   │   ├── CertificateForm.tsx
│   │   ├── SkillForm.tsx
│   │   ├── JobForm.tsx
│   │   ├── SettingsForm.tsx
│   │   ├── DeployResumeButton.tsx
│   │   └── ...sortable lists
│   ├── AboutSection.tsx
│   ├── ContactSection.tsx
│   ├── ClientLayout.tsx
│   ├── DrawingCard.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── Navigation.tsx
│   ├── ProjectCard.tsx
│   ├── PostHogProvider.tsx
│   └── PostHogPageView.tsx
├── lib/supabase/
│   ├── client.ts                 # Browser Supabase client
│   └── server.ts                 # Server Supabase client
├── types/                        # TypeScript interfaces
│   ├── project.ts
│   ├── job.ts
│   ├── certificate.ts
│   ├── skill.ts
│   └── settings.ts
├── supabase/
│   └── schema.sql                # Database schema + seed
├── middleware.ts                 # Auth middleware (protects /admin)
├── vitest.config.ts
└── postcss.config.mjs
```

---

## Database & Storage

### Supabase Tables

- **projects** – Coding and drawing projects (slug, title, description, technologies, type, display_order, is_visible, etc.)
- **skills** – Skills by category (systems, development)
- **certificates** – Education and Scrimba certificates with PDF paths
- **jobs** – Work experience with achievements and responsibilities
- **settings** – Key-value configuration

### Storage Buckets

- **images** – Project images (Supabase Storage)
- **certificates** – Certificate PDFs (Supabase Storage)

---

## Getting Started

### 1. Clone and Install

```bash
cd portfolio-next
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the schema from `supabase/schema.sql` in the SQL Editor
3. Create storage buckets `images` and `certificates` (public)
4. Enable Email Auth in Authentication > Providers (OTP / 6-digit code template)

### 3. Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Required:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_EMAIL=your-email@example.com
```

Optional:

```
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=  # PostHog project token
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
VERCEL_DEPLOY_HOOK_RESUME=      # Vercel deploy hook URL for resume rebuild
```

### 4. Supabase Auth Configuration

In Authentication > Providers > Email, ensure email OTP is enabled and the email template sends a **6-digit verification code**.

Ensure the admin user already exists under Authentication > Users (OTP login uses `shouldCreateUser: false`).

Optional — legacy magic-link redirect URLs (not used by OTP login):

- Site URL: `http://localhost:3000` (dev) or your production URL
- Redirect URLs: `http://localhost:3000/auth/callback`, `https://your-domain.vercel.app/auth/callback`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest |
| `npm run test:ui` | Vitest UI |
| `npm run test:coverage` | Coverage report |

---

## Admin Usage

1. Go to `/login`
2. Enter your admin email (must match `ADMIN_EMAIL`)
3. Enter the 6-digit verification code from your email
4. You’ll be redirected to `/admin`
5. Manage Projects, Skills, Certificates, Jobs, and Settings
6. Changes are reflected on the public site via ISR (revalidate API)

---

## Deployment (Vercel)

1. Push the repo to GitHub
2. Import the project in [vercel.com](https://vercel.com)
3. Set root directory to `portfolio-next`
4. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ADMIN_EMAIL`
5. Confirm Supabase Email OTP is enabled and the admin user exists in Authentication > Users

---

## License

Based on template by Nisar Hassan Naqvi (MIT License).
