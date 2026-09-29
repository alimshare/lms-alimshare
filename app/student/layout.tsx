import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/shared/sidebar'
import { Topbar } from '@/components/shared/topbar'
import { auth } from '@/lib/auth'
import { getInitials } from '@/lib/utils'
import type { SessionUser } from '@/types'

export const metadata: Metadata = {
  title: 'Student Dashboard',
}

export default async function StudentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = session.user as unknown as SessionUser
  if (user.role !== 'student') {
    redirect(user.role === 'administrator' ? '/admin' : '/teacher')
  }

  const userName = user.name || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <Sidebar
        role="student"
        userInitials={getInitials(userName)}
        userName={userName}
        userEmail={user.email}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title="Student Dashboard" />
        <main className="min-w-0 flex-1 p-4 sm:p-6 xl:p-8">{children}</main>
      </div>
    </div>
  )
}