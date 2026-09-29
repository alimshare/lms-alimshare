# 📊 LMS AlimShare — System Analysis

> **Status:** Planning Phase
> **Last Updated:** 2026-09-29
> **Tech Stack:** Next.js 15 · Prisma 6 · PostgreSQL (Supabase) · Vercel

---

## 1. Project Overview

**AlimShare LMS** is a full-featured Learning Management System (LMS) built to support three distinct user roles: Administrator, Teacher, and Student. The system enables structured online learning through courses, lessons, quizzes, assignments, progress tracking, and certification.

### Goals
- Provide a scalable, role-aware platform for digital learning
- Enable teachers to create and manage course content independently
- Allow students to enroll, learn at their own pace, and earn certificates
- Give administrators full control over users, courses, and system configuration

---

## 2. User Roles & Capabilities

### 2.1 Administrator
| Capability | Description |
|-----------|-------------|
| Manage Users | Create, edit, activate/suspend any user account |
| Manage Courses | Approve, reject, archive courses submitted by teachers |
| Manage Categories | Create and organize hierarchical course categories |
| System Configuration | Site name, logo, feature flags, maintenance mode |
| View Audit Logs | Track all critical actions performed on the platform |
| View Analytics | Platform-wide statistics: total users, enrollments, revenue |

### 2.2 Teacher
| Capability | Description |
|-----------|-------------|
| Manage Courses | Create and edit courses (sections, lessons, attachments) |
| Manage Quizzes | Build quizzes with MCQ, true/false, and essay questions |
| Manage Assignments | Create tasks with due dates, scoring, and late submission rules |
| Grade Submissions | Score student submissions and provide written feedback |
| Monitor Participants | View enrollment list, student progress per course |
| Post Announcements | Send course-level announcements to enrolled students |

### 2.3 Student
| Capability | Description |
|-----------|-------------|
| Enroll in Courses | Browse catalog and enroll (free or paid) |
| Take Lessons | Watch videos, read content, download attachments |
| Track Progress | Visual progress bar per course, per section |
| Take Quizzes | Attempt quizzes with configurable time limits and attempts |
| Submit Assignments | Upload files or write text submissions |
| Earn Certificates | Auto-generated certificate upon course completion |
| Manage Profile | Update avatar, bio, phone, and password |
| Join Discussions | Post and reply in per-lesson discussion threads |

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization
- FR-AUTH-01: Users register with email + password
- FR-AUTH-02: Email verification required before first login
- FR-AUTH-03: Password reset via email link
- FR-AUTH-04: Role-based access control (RBAC) — routes protected by middleware
- FR-AUTH-05: Session management via JWT (NextAuth v5)
- FR-AUTH-06: Supabase Row Level Security (RLS) as second layer of access control

### 3.2 Course Management
- FR-COURSE-01: Teacher creates course with title, description, thumbnail, and category
- FR-COURSE-02: Course contains sections; sections contain ordered lessons
- FR-COURSE-03: Lesson types: Video, Text/Rich-HTML, PDF, Audio, Live Session
- FR-COURSE-04: Lessons support attachable files (PDF, docs)
- FR-COURSE-05: Course has lifecycle: Draft → Under Review → Published → Archived
- FR-COURSE-06: Admin approves or rejects courses submitted for review
- FR-COURSE-07: Preview lessons available to non-enrolled users
- FR-COURSE-08: Drag-and-drop reordering of sections and lessons

### 3.3 Enrollment & Progress
- FR-ENROLL-01: Student can enroll in a published course
- FR-ENROLL-02: Enrollment tracks progress as a percentage (0–100%)
- FR-ENROLL-03: Progress auto-updates when a lesson is marked complete
- FR-ENROLL-04: Enrollment status transitions: active → completed | expired | suspended
- FR-ENROLL-05: Certificate is auto-issued when enrollment reaches 100% progress

### 3.4 Quiz System
- FR-QUIZ-01: Teacher creates quizzes linked to a course or specific section
- FR-QUIZ-02: Supported question types: Multiple Choice, True/False, Short Answer, Essay
- FR-QUIZ-03: Configurable: time limit, passing score, max attempts, shuffle
- FR-QUIZ-04: MCQ and True/False are auto-graded on submission
- FR-QUIZ-05: Essay questions are flagged for manual teacher review
- FR-QUIZ-06: Student sees score and correct answers after submission (configurable)
- FR-QUIZ-07: Attempt history is stored per student per quiz

### 3.5 Assignment System
- FR-ASSIGN-01: Teacher creates assignment with description, instructions, and max score
- FR-ASSIGN-02: Due date is configurable; late submissions can be allowed with penalty
- FR-ASSIGN-03: Student submits text and/or file attachments
- FR-ASSIGN-04: Teacher grades submission and optionally provides text feedback
- FR-ASSIGN-05: Graded results are visible to the student
- FR-ASSIGN-06: Submission status: Submitted → Under Review → Graded | Returned

### 3.6 Notifications
- FR-NOTIF-01: In-app notifications for enrollment, quiz results, assignment grading
- FR-NOTIF-02: Email notifications via Resend (assignment due, grade published)
- FR-NOTIF-03: Real-time notification badge via Supabase Realtime

### 3.7 Discussions
- FR-DISC-01: Discussion threads scoped to a course or a specific lesson
- FR-DISC-02: Threaded replies (parent/child structure)
- FR-DISC-03: Teacher can pin or mark a thread as resolved
- FR-DISC-04: Markdown formatting in posts

---

## 4. Non-Functional Requirements

| Category | Requirement |
|---------|-------------|
| **Performance** | Page load < 2s (LCP), API response < 500ms for list endpoints |
| **Scalability** | Stateless Next.js app on Vercel; DB connections pooled via Supabase PgBouncer |
| **Security** | HTTPS-only, CSRF protection, Supabase RLS, rate limiting on auth routes |
| **Availability** | Target 99.9% uptime using Vercel + Supabase managed infrastructure |
| **Accessibility** | WCAG 2.1 AA compliance; keyboard navigation; screen reader support |
| **SEO** | Public course pages with Next.js metadata API and OpenGraph tags |
| **Maintainability** | TypeScript throughout; Prisma type-safe ORM; Zod validation on all inputs |
| **Testability** | Unit tests (Vitest), E2E tests (Playwright) for critical user flows |

---

## 5. Database Design Summary

### 5.1 Table Count: 22 Tables

| Domain | Tables |
|--------|--------|
| Identity | `users` |
| Content | `categories`, `courses`, `course_sections`, `lessons`, `lesson_attachments` |
| Enrollment | `enrollments`, `lesson_progress`, `certificates` |
| Assessment | `quizzes`, `quiz_questions`, `quiz_options`, `quiz_attempts`, `quiz_answers` |
| Tasks | `assignments`, `assignment_submissions`, `submission_attachments` |
| Community | `announcements`, `discussions`, `notifications` |
| System | `system_configs`, `audit_logs` |

### 5.2 Key Design Decisions

| Decision | Rationale |
|---------|-----------|
| UUID primary keys | Works seamlessly with Supabase Auth `uid()` in RLS policies |
| TIMESTAMPTZ (not TIMESTAMP) | Timezone-aware; avoids DST bugs |
| `updated_at` via trigger | Eliminates manual update burden in application code |
| Auto progress trigger | Recalculates `enrollments.progress` on every `lesson_progress` insert/update |
| JSONB in audit_logs | Flexible old/new value capture without schema coupling |
| Self-referencing categories | Enables unlimited category depth without extra tables |
| `UNIQUE(user_id, course_id)` on enrollments | Prevents duplicate enrollments at DB level |
| `TEXT[]` for what_you_learn / requirements | Simple array; avoids over-normalization for list data |

### 5.3 Enum Types
```
user_role         → administrator | teacher | student
course_level      → beginner | intermediate | advanced | all_levels
course_status     → draft | under_review | published | archived
lesson_type       → video | text | pdf | audio | live_session
enrollment_status → active | completed | expired | suspended
question_type     → multiple_choice | true_false | short_answer | essay
submission_status → submitted | under_review | graded | returned
notification_type → enrollment | assignment_due | assignment_graded |
                    quiz_result | course_announcement | system
```

---

## 6. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                      VERCEL                         │
│  ┌────────────────────────────────────────────────┐ │
│  │           Next.js 15 (App Router)              │ │
│  │                                                │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │ │
│  │  │  Admin   │  │ Teacher  │  │ Student  │    │ │
│  │  │  /admin  │  │/teacher  │  │/student  │    │ │
│  │  └──────────┘  └──────────┘  └──────────┘    │ │
│  │                                                │ │
│  │  ┌─────────────────────────────────────────┐  │ │
│  │  │       Route Handlers (API Routes)       │  │ │
│  │  │  /api/courses  /api/enrollments  ...    │  │ │
│  │  └──────────────────┬──────────────────────┘  │ │
│  └─────────────────────│────────────────────────┘ │
└────────────────────────│────────────────────────── ┘
                         │
              ┌──────────▼──────────┐
              │    Prisma Client    │
              │  (Type-safe ORM)    │
              └──────────┬──────────┘
                         │
        ┌────────────────▼────────────────────┐
        │            SUPABASE                 │
        │                                     │
        │  ┌─────────────┐  ┌─────────────┐  │
        │  │ PostgreSQL  │  │   Storage   │  │
        │  │  (RLS-on)   │  │(files/imgs) │  │
        │  └─────────────┘  └─────────────┘  │
        │  ┌─────────────┐  ┌─────────────┐  │
        │  │  Auth/JWT   │  │  Realtime   │  │
        │  │  Provider   │  │(WebSockets) │  │
        │  └─────────────┘  └─────────────┘  │
        └─────────────────────────────────────┘
```

### Request Flow
```
Browser → Vercel Edge (middleware role check)
       → Next.js Server Component / Route Handler
       → Prisma Client → Supabase PostgreSQL
       ← JSON response / RSC payload
Browser ← Hydrated page
```

---

## 7. Technology Stack

### Core
| Layer | Technology | Version | Reason |
|-------|-----------|---------|--------|
| Framework | Next.js | 15.x | App Router, RSC, built-in API routes, Vercel-optimized |
| Language | TypeScript | 5.x | Type safety, better DX, self-documenting |
| ORM | Prisma | 6.x | Type-safe DB access, migration system, schema-first |
| Database | PostgreSQL | 15 via Supabase | Mature, relational, RLS, JSON support |
| Hosting | Vercel | - | Zero-config Next.js deploy, preview branches |

### Auth
| Tool | Role |
|------|------|
| NextAuth v5 (Auth.js) | Session management, credential provider |
| Supabase Auth | Email verification, password reset flows |
| bcryptjs | Password hashing |

### UI
| Tool | Role |
|------|------|
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Accessible, unstyled component primitives |
| Tiptap | Rich text editor for lesson content |
| React Player | Embeddable video player (YouTube, Vimeo, direct) |
| Recharts | Analytics charts for dashboards |
| dnd-kit | Drag-and-drop for section/lesson ordering |
| Lucide React | Icon system |

### Forms & Validation
| Tool | Role |
|------|------|
| React Hook Form | Performant form state management |
| Zod | Schema validation (shared client/server) |

### File Storage
| Tool | Role |
|------|------|
| Supabase Storage | User-uploaded files (videos, PDFs, images) |
| Uploadthing | Alternative upload middleware for Next.js |

### Notifications & Email
| Tool | Role |
|------|------|
| Supabase Realtime | In-app live notification badge |
| Resend | Transactional email delivery |
| React Email | Email template rendering |

### Testing
| Tool | Role |
|------|------|
| Vitest | Unit & integration tests |
| Playwright | End-to-end browser tests |
| Prisma Mock | DB mocking in unit tests |

---

## 8. Folder Structure

```
lms-alimshare/
├── ANALYSIS.md                   ← This file
├── README.md
├── .env.local                    ← Environment variables (not committed)
├── .env.example                  ← Example env template
│
├── prisma/
│   ├── schema.prisma             ← Database schema
│   ├── migrations/               ← Auto-generated migration files
│   └── seed.ts                   ← Initial seed data
│
├── app/
│   ├── layout.tsx                ← Root layout (fonts, providers)
│   ├── page.tsx                  ← Landing page
│   │
│   ├── (auth)/                   ← Auth group layout (no sidebar)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   │
│   ├── (public)/                 ← Public pages (no auth required)
│   │   ├── courses/
│   │   │   ├── page.tsx          ← Course catalog
│   │   │   └── [slug]/page.tsx   ← Course detail / sales page
│   │   └── categories/page.tsx
│   │
│   ├── admin/                    ← Administrator panel
│   │   ├── layout.tsx
│   │   ├── page.tsx              ← Admin dashboard
│   │   ├── users/
│   │   │   ├── page.tsx          ← User list
│   │   │   └── [id]/page.tsx     ← User detail
│   │   ├── courses/
│   │   │   ├── page.tsx          ← All courses (review queue)
│   │   │   └── [id]/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── settings/page.tsx
│   │   └── audit-logs/page.tsx
│   │
│   ├── teacher/                  ← Teacher panel
│   │   ├── layout.tsx
│   │   ├── page.tsx              ← Teacher dashboard
│   │   ├── courses/
│   │   │   ├── page.tsx          ← My courses list
│   │   │   ├── create/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx      ← Course overview
│   │   │       ├── content/page.tsx   ← Section/lesson editor
│   │   │       ├── quizzes/page.tsx
│   │   │       ├── assignments/page.tsx
│   │   │       ├── students/page.tsx  ← Participant monitoring
│   │   │       └── announcements/page.tsx
│   │
│   ├── student/                  ← Student panel
│   │   ├── layout.tsx
│   │   ├── page.tsx              ← Student dashboard
│   │   ├── courses/
│   │   │   ├── page.tsx          ← My enrollments
│   │   │   └── [id]/
│   │   │       ├── page.tsx      ← Course player (lesson viewer)
│   │   │       ├── quizzes/[qid]/page.tsx
│   │   │       └── assignments/[aid]/page.tsx
│   │   ├── certificates/page.tsx
│   │   └── profile/page.tsx
│   │
│   └── api/                      ← Next.js Route Handlers
│       ├── auth/[...nextauth]/route.ts
│       ├── courses/
│       │   ├── route.ts           ← GET list, POST create
│       │   └── [id]/
│       │       ├── route.ts       ← GET, PATCH, DELETE
│       │       └── publish/route.ts
│       ├── enrollments/route.ts
│       ├── lessons/
│       │   └── [id]/progress/route.ts
│       ├── quizzes/
│       │   └── [id]/attempts/route.ts
│       ├── assignments/
│       │   └── [id]/submissions/route.ts
│       ├── notifications/route.ts
│       └── upload/route.ts
│
├── components/
│   ├── ui/                       ← shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── shared/                   ← Shared across roles
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   ├── course-card.tsx
│   │   ├── progress-bar.tsx
│   │   ├── notification-bell.tsx
│   │   └── rich-text-editor.tsx
│   ├── admin/
│   │   ├── users-table.tsx
│   │   ├── stats-cards.tsx
│   │   └── audit-log-table.tsx
│   ├── teacher/
│   │   ├── lesson-builder.tsx
│   │   ├── quiz-builder.tsx
│   │   ├── assignment-form.tsx
│   │   └── grading-panel.tsx
│   └── student/
│       ├── lesson-player.tsx
│       ├── quiz-attempt.tsx
│       ├── assignment-submit.tsx
│       └── certificate-card.tsx
│
├── lib/
│   ├── prisma.ts                 ← Prisma client singleton
│   ├── auth.ts                   ← NextAuth config & helpers
│   ├── supabase/
│   │   ├── client.ts             ← Browser-side Supabase client
│   │   ├── server.ts             ← Server-side Supabase client
│   │   └── storage.ts            ← Storage upload helpers
│   ├── validations/              ← Zod schemas
│   │   ├── course.ts
│   │   ├── quiz.ts
│   │   ├── assignment.ts
│   │   └── user.ts
│   ├── email/
│   │   ├── resend.ts             ← Resend client
│   │   └── templates/
│   │       ├── welcome.tsx
│   │       ├── assignment-due.tsx
│   │       └── grade-published.tsx
│   └── utils.ts                  ← General helpers (cn, slugify, etc.)
│
├── hooks/
│   ├── use-enrollment.ts
│   ├── use-quiz-timer.ts
│   ├── use-notifications.ts
│   └── use-upload.ts
│
├── types/
│   └── index.ts                  ← Shared TypeScript types
│
├── middleware.ts                  ← Role-based route protection
│
└── tests/
    ├── unit/
    │   ├── lib/
    │   └── components/
    └── e2e/
        ├── auth.spec.ts
        ├── enrollment.spec.ts
        └── quiz.spec.ts
```

---

## 9. API Design

### Endpoint Structure
All endpoints follow REST conventions under `/api/`.

| Method | Endpoint | Role | Description |
|--------|---------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| GET | `/api/courses` | Public | List published courses |
| POST | `/api/courses` | Teacher | Create new course |
| GET | `/api/courses/:id` | Public | Get course detail |
| PATCH | `/api/courses/:id` | Teacher/Admin | Update course |
| DELETE | `/api/courses/:id` | Teacher/Admin | Delete course |
| POST | `/api/courses/:id/publish` | Teacher | Submit for review |
| PATCH | `/api/courses/:id/approve` | Admin | Approve/reject course |
| POST | `/api/enrollments` | Student | Enroll in course |
| GET | `/api/enrollments` | Student | Get my enrollments |
| PATCH | `/api/lessons/:id/progress` | Student | Mark lesson complete |
| GET | `/api/quizzes/:id` | Auth | Get quiz (questions shuffled) |
| POST | `/api/quizzes/:id/attempts` | Student | Submit quiz attempt |
| GET | `/api/assignments/:id` | Auth | Get assignment detail |
| POST | `/api/assignments/:id/submissions` | Student | Submit assignment |
| PATCH | `/api/submissions/:id/grade` | Teacher | Grade a submission |
| GET | `/api/notifications` | Auth | Get my notifications |
| PATCH | `/api/notifications/read` | Auth | Mark notifications as read |
| GET | `/api/admin/stats` | Admin | Platform-wide stats |
| GET | `/api/admin/audit-logs` | Admin | View audit trail |

---

## 10. Security Model

### Layer 1 — Next.js Middleware (Route-level)
```
/admin/*     → requires role: administrator
/teacher/*   → requires role: teacher
/student/*   → requires role: student
/api/*       → requires valid session token
```

### Layer 2 — API Route Authorization
Every route handler explicitly checks the caller's role before executing queries.

### Layer 3 — Supabase Row Level Security
Database-level policies ensure data cannot be accessed via direct DB connections, even if application auth is bypassed.

### Layer 4 — Input Validation (Zod)
All incoming request bodies are validated against Zod schemas before reaching Prisma.

---

## 11. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Large video file uploads causing timeouts | High | Medium | Chunked upload via Supabase Storage, progress indicators |
| Database connection pool exhaustion | Medium | High | Use Supabase PgBouncer pooler mode for serverless |
| Prisma cold starts on Vercel | Medium | Medium | Use `@prisma/adapter-pg` + connection pooling |
| Student exploiting quiz timing | Low | Medium | Server-side timer validation on submission |
| File storage costs scaling | Medium | Medium | Enforce file size limits via `system_configs` |
| Email delivery to spam | Medium | Low | Configure SPF/DKIM/DMARC on Resend domain |

---

## 12. Implementation Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Initialize Next.js 15 project with TypeScript + Tailwind CSS
- [ ] Configure Supabase project (enable Auth, Storage, Realtime)
- [ ] Set up Prisma schema and run first migration
- [ ] Implement Auth: Register, Login, Email Verify, Forgot Password
- [ ] Build role-based middleware for route protection
- [ ] Create layout shells for Admin, Teacher, Student

### Phase 2 — Course Management (Week 3–4)
- [ ] Category CRUD (Admin)
- [ ] Course CRUD with rich-text description (Teacher)
- [ ] Section & Lesson editor with drag-and-drop ordering
- [ ] File/video upload via Supabase Storage
- [ ] Course publishing workflow (Draft → Review → Published)
- [ ] Public course catalog with search + filter

### Phase 3 — Student Experience (Week 5–6)
- [ ] Course enrollment flow
- [ ] Lesson player (video, text, PDF)
- [ ] Progress tracking — mark lessons complete
- [ ] Auto progress calculation and enrollment status update
- [ ] Certificate generation (PDF) on completion
- [ ] Student dashboard with My Courses and progress overview

### Phase 4 — Assessment (Week 7–8)
- [ ] Quiz builder UI (Teacher)
- [ ] Quiz attempt engine (timer, shuffle, auto-grade MCQ)
- [ ] Essay question flagging and manual grading
- [ ] Assignment builder with file attachment support
- [ ] Assignment submission by student
- [ ] Teacher grading panel with feedback form
- [ ] Results pages for student

### Phase 5 — Communication & Admin (Week 9–10)
- [ ] Course announcements (Teacher posts, Student sees)
- [ ] Discussion threads per lesson (threaded replies)
- [ ] In-app notifications with Supabase Realtime badge
- [ ] Email notifications (Resend) for key events
- [ ] Admin dashboard: stats, charts, user list
- [ ] Admin: user management (create, edit, suspend)
- [ ] Admin: system config editor
- [ ] Audit log viewer

### Phase 6 — Polish & Deploy (Week 11–12)
- [ ] Configure Supabase RLS policies for all tables
- [ ] API rate limiting (Vercel Edge Middleware)
- [ ] Error boundaries, 404/500 pages
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] SEO metadata + OpenGraph for course pages
- [ ] Write unit tests (Vitest) for lib utilities
- [ ] Write E2E tests (Playwright) for core flows
- [ ] Configure Vercel production environment + secrets
- [ ] Final QA and deployment

---

## 13. Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://...             # Supabase pooler URL (for Prisma)
DIRECT_URL=postgresql://...              # Supabase direct URL (for migrations)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...         # Server-only

# Auth (NextAuth)
NEXTAUTH_URL=https://lms.alimshare.com
NEXTAUTH_SECRET=...                      # openssl rand -base64 32

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@alimshare.com

# App
NEXT_PUBLIC_APP_URL=https://lms.alimshare.com
NEXT_PUBLIC_APP_NAME=AlimShare LMS
```

---

*This document is a living analysis. Update as decisions are made during implementation.*
