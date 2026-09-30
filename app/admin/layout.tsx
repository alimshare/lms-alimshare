import { RoleLayout } from '@/components/shared/role-layout'

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RoleLayout role="administrator">{children}</RoleLayout>
}