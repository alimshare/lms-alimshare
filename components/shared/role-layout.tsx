import type { UserRole } from '@prisma/client'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/shared/sidebar'
import { Topbar } from '@/components/shared/topbar'
import { auth } from '@/lib/auth'
import { getInitials } from '@/lib/utils'
import type { SessionUser } from '@/types'

const ROLE_HOME: Record<UserRole, string> = {
  administrator: '/admin',
  teacher: '/teachers',
  student: '/student',
}

interface RoleLayoutProps {
  children: React.ReactNode
  role: UserRole
  title?: string
}

export async function RoleLayout({ children, role, title }: RoleLayoutProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = session.user as unknown as SessionUser
  if (user.role !== role) redirect(ROLE_HOME[user.role] ?? '/student')

  const userName = user.name || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <Sidebar
        role={role}
        userInitials={getInitials(userName)}
        userName={userName}
        userEmail={user.email}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        {title ? (
          <>
            <Topbar title={title} />
            <main className="min-w-0 flex-1 p-4 sm:p-6 xl:p-8">{children}</main>
          </>
        ) : (
          children
        )}
      </div>
    </div>
  )
}