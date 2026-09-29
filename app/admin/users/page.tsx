import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Topbar } from '@/components/shared/topbar'
import { formatDate, getInitials, generateAvatarColor } from '@/lib/utils'
import { UserRole } from '@prisma/client'
import { Users, UserCheck, Clock, UserX } from 'lucide-react'

export const metadata: Metadata = { title: 'User Management' }

async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      name: true,
      avatar: true,
      role: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
      _count: { select: { enrollments: true, courses: true } },
    },
  })
}

async function getStats() {
  const [total, active, pending, inactive] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { emailVerified: null, isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
  ])
  return { total, active, pending, inactive }
}

const ROLE_STYLES: Record<UserRole, string> = {
  administrator: 'bg-indigo-100 text-indigo-700',
  teacher: 'bg-emerald-100 text-emerald-700',
  student: 'bg-amber-100 text-amber-700',
}

const ROLE_LABELS: Record<UserRole, string> = {
  administrator: '🛡️ Admin',
  teacher: '📖 Teacher',
  student: '🎒 Student',
}

export default async function UsersPage() {
  const [users, stats] = await Promise.all([getUsers(), getStats()])

  const statCards = [
    { label: 'Total Users', value: stats.total, icon: <Users size={18} className="text-indigo-600" />, bg: 'bg-indigo-50', valueClass: 'text-gray-900' },
    { label: 'Active', value: stats.active, icon: <UserCheck size={18} className="text-emerald-600" />, bg: 'bg-emerald-50', valueClass: 'text-emerald-600' },
    { label: 'Pending Verify', value: stats.pending, icon: <Clock size={18} className="text-amber-600" />, bg: 'bg-amber-50', valueClass: 'text-amber-600' },
    { label: 'Inactive', value: stats.inactive, icon: <UserX size={18} className="text-red-500" />, bg: 'bg-red-50', valueClass: 'text-red-500' },
  ]

  return (
    <>
      <Topbar title="User Management" />
      <main className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                {card.icon}
              </div>
              <div className={`text-2xl font-bold ${card.valueClass}`}>{card.value}</div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">All Users <span className="text-gray-400 font-normal text-sm">({users.length})</span></h2>
            <a
              href="/admin/users/create"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              + Add User
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Users list">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Activity</th>
                  <th scope="col" className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => {
                  const displayName = user.name ?? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email
                  const initials = getInitials(displayName)
                  const color = generateAvatarColor(displayName)
                  const isVerified = !!user.emailVerified

                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: color }}
                            aria-hidden="true"
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{displayName}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_STYLES[user.role]}`}>
                          {ROLE_LABELS[user.role]}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                            {isVerified ? 'Active' : 'Unverified'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden="true" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-xs text-gray-500">
                          {user.role === 'student' && `${user._count.enrollments} courses`}
                          {user.role === 'teacher' && `${user._count.courses} courses`}
                          {user.role === 'administrator' && '—'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/admin/users/${user.id}`}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                          >
                            ✏️ Edit
                          </a>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="py-16 text-center text-gray-400">
                <div className="text-3xl mb-3" aria-hidden="true">👥</div>
                <p className="text-sm">No users found</p>
              </div>
            )}
          </div>

          {users.length > 0 && (
            <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">Showing {users.length} user{users.length !== 1 ? 's' : ''}</span>
              <nav className="flex items-center gap-1" aria-label="Pagination">
                <button className="w-8 h-8 flex items-center justify-center text-gray-400 border border-gray-200 rounded-lg text-xs hover:bg-gray-50" aria-label="Previous page">‹</button>
                <button className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-lg text-xs font-semibold" aria-current="page">1</button>
                <button className="w-8 h-8 flex items-center justify-center text-gray-400 border border-gray-200 rounded-lg text-xs hover:bg-gray-50" aria-label="Next page">›</button>
              </nav>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
