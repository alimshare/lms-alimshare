import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
} from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatRelativeTime } from '@/lib/utils'
import type { SessionUser } from '@/types'

export const metadata: Metadata = { title: 'Student Dashboard' }

const STAT_STYLES = [
  { icon: BookOpen, iconClass: 'text-indigo-700', iconBg: 'bg-indigo-50', valueClass: 'text-gray-950' },
  { icon: CheckCircle2, iconClass: 'text-emerald-700', iconBg: 'bg-emerald-50', valueClass: 'text-emerald-700' },
  { icon: Award, iconClass: 'text-amber-700', iconBg: 'bg-amber-50', valueClass: 'text-amber-700' },
  { icon: Clock3, iconClass: 'text-cyan-700', iconBg: 'bg-cyan-50', valueClass: 'text-cyan-700' },
]

export default async function StudentDashboardPage() {
  const session = await auth()
  const user = session?.user as unknown as SessionUser | undefined

  if (!user?.id) return null

  const [enrollments, activeCourseCount, completedCourseCount, certificateCount, notifications] =
    await Promise.all([
      prisma.enrollment.findMany({
        where: { studentId: user.id, status: { in: ['active', 'completed'] } },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          status: true,
          progress: true,
          course: {
            select: {
              title: true,
              slug: true,
              level: true,
              totalLessons: true,
              totalDuration: true,
              category: { select: { name: true } },
              teacher: { select: { name: true, firstName: true, lastName: true } },
            },
          },
        },
      }),
      prisma.enrollment.count({ where: { studentId: user.id, status: 'active' } }),
      prisma.enrollment.count({ where: { studentId: user.id, status: 'completed' } }),
      prisma.certificate.count({ where: { enrollment: { studentId: user.id } } }),
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: { id: true, title: true, message: true, createdAt: true, isRead: true },
      }),
    ])

  const visibleEnrollments = enrollments.slice(0, 4)
  const learnedMinutes = enrollments.reduce((total, enrollment) => {
    const progress = Math.min(100, Math.max(0, Number(enrollment.progress)))
    return total + Math.round((enrollment.course.totalDuration * progress) / 100)
  }, 0)
  const learningHours = Math.round(learnedMinutes / 60)
  const stats = [
    { label: 'Active courses', value: activeCourseCount },
    { label: 'Completed', value: completedCourseCount },
    { label: 'Certificates', value: certificateCount },
    { label: 'Hours learned', value: learningHours },
  ]
  const firstName = user.firstName || user.name?.split(' ')[0] || 'Student'
  const today = new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date())

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-700">
            <CalendarDays size={14} aria-hidden="true" />
            {today}
          </p>
          <h2 className="text-2xl font-bold text-gray-950 sm:text-3xl">
            Welcome back, {firstName}
          </h2>
          <p className="mt-1 text-sm text-gray-600">Here’s your learning progress at a glance.</p>
        </div>
        <Link
          href="#my-courses"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <BookOpen size={16} aria-hidden="true" />
          View my courses
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Learning statistics">
        {stats.map((stat, index) => {
          const style = STAT_STYLES[index]
          const Icon = style.icon
          return (
            <div key={stat.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-lg ${style.iconBg}`}>
                <Icon size={18} className={style.iconClass} aria-hidden="true" />
              </div>
              <p className={`text-2xl font-bold ${style.valueClass}`}>{stat.value}</p>
              <p className="mt-1 text-xs font-medium text-gray-500">{stat.label}</p>
            </div>
          )
        })}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
        <section id="my-courses" className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-5">
            <div>
              <h3 className="font-semibold text-gray-950">Continue learning</h3>
              <p className="mt-0.5 text-xs text-gray-500">Your latest courses and progress</p>
            </div>
            <span className="text-xs font-medium text-gray-500">{activeCourseCount} active</span>
          </div>

          {visibleEnrollments.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {visibleEnrollments.map((enrollment, index) => {
                const progress = Math.min(100, Math.max(0, Math.round(Number(enrollment.progress))))
                const teacherName =
                  enrollment.course.teacher.name ||
                  `${enrollment.course.teacher.firstName ?? ''} ${enrollment.course.teacher.lastName ?? ''}`.trim() ||
                  'AlimShare instructor'
                const accents = [
                  'bg-indigo-50 text-indigo-700',
                  'bg-emerald-50 text-emerald-700',
                  'bg-amber-50 text-amber-700',
                  'bg-cyan-50 text-cyan-700',
                ]

                return (
                  <article key={enrollment.id} className="flex gap-3 p-4 sm:gap-4 sm:px-5">
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${accents[index % accents.length]}`}>
                      <GraduationCap size={22} aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                            {enrollment.course.category?.name ?? enrollment.course.level.replace('_', ' ')}
                          </p>
                          <h4 className="mt-0.5 truncate text-sm font-semibold text-gray-900">
                            {enrollment.course.title}
                          </h4>
                          <p className="mt-0.5 text-xs text-gray-500">{teacherName}</p>
                        </div>
                        <span className="whitespace-nowrap text-xs font-semibold text-gray-600">
                          {progress}%
                        </span>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-label={`${enrollment.course.title} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                        <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="mt-1.5 text-[11px] text-gray-500">
                        {enrollment.course.totalLessons} lessons · {progress === 100 ? 'Completed' : 'In progress'}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
                <BookOpen size={22} aria-hidden="true" />
              </div>
              <h4 className="text-sm font-semibold text-gray-900">No courses yet</h4>
              <p className="mt-1 text-sm text-gray-500">Your enrolled courses will appear here.</p>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
            <h3 className="font-semibold text-gray-950">Recent activity</h3>
            <p className="mt-0.5 text-xs text-gray-500">Updates from your learning space</p>
          </div>
          {notifications.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <li key={notification.id} className="flex gap-3 px-4 py-4 sm:px-5">
                  <span
                    className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${notification.isRead ? 'bg-gray-300' : 'bg-indigo-600'}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600">{notification.message}</p>
                    <p className="mt-1.5 text-[11px] text-gray-400">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <CheckCircle2 size={22} aria-hidden="true" />
              </div>
              <h4 className="text-sm font-semibold text-gray-900">You’re all caught up</h4>
              <p className="mt-1 text-sm text-gray-500">New course updates will show here.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}