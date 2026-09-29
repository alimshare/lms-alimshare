# 🎓 AlimShare LMS

A full-featured Learning Management System built with **Next.js 15**, **Prisma**, **PostgreSQL (Supabase)**, and **Vercel**.

## Roles
| Role | Key Capabilities |
|------|----------------|
| Administrator | Manage users, approve courses, system config, audit logs |
| Teacher | Create courses, build quizzes, grade assignments, monitor students |
| Student | Enroll in courses, track progress, take quizzes, submit tasks, earn certificates |

## Tech Stack
- **Framework:** Next.js 15 (App Router + RSC)
- **ORM:** Prisma 6
- **Database:** PostgreSQL via Supabase
- **Auth:** NextAuth v5 (Auth.js)
- **Storage:** Supabase Storage
- **Email:** Resend
- **UI:** Tailwind CSS + shadcn/ui
- **Deployment:** Vercel

## Documentation
- [`ANALYSIS.md`](./ANALYSIS.md) — Full system analysis, requirements, architecture, and implementation plan
- Database DDL and Prisma schema are in `prisma/`

## Getting Started

> Project is currently in **Planning Phase**. Implementation begins after architecture review.

```bash
# 1. Clone the repo
git clone https://github.com/alimshare/lms-alimshare.git

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Run database migrations
pnpm prisma migrate dev

# 5. Seed initial data
pnpm prisma db seed

# 6. Start development server
pnpm dev
```

## Project Status
- [x] Database design & schema
- [x] System analysis & planning
- [ ] Phase 1: Foundation (auth, roles, layouts)
- [ ] Phase 2: Course management
- [ ] Phase 3: Student experience
- [ ] Phase 4: Assessment (quizzes & assignments)
- [ ] Phase 5: Communication & admin
- [ ] Phase 6: Polish & deploy
