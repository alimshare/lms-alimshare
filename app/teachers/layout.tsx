import type { Metadata } from 'next'
import { RoleLayout } from '@/components/shared/role-layout'

export const metadata: Metadata = { title: 'Teacher Dashboard' }

export default function TeacherLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RoleLayout role="teacher" title="Teacher Dashboard">
      {children}
    </RoleLayout>
  )
}