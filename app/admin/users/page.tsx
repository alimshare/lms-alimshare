import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Topbar } from '@/components/shared/topbar'
import { auth } from '@/lib/auth'
import { UserManagement } from './user-management'
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

export default async function UsersPage() {
  const [session, users, stats] = await Promise.all([auth(), getUsers(), getStats()])
  const currentUserId = (session?.user as unknown as { id?: string } | undefined)?.id ?? ''

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

        <UserManagement users={users} currentUserId={currentUserId} />
      </main>
    </>
  )
}
