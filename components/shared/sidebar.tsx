'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, BookOpen, Tag, Settings,
  ScrollText, GraduationCap, FileText, PlusCircle,
  Trophy, User, ChevronRight
} from 'lucide-react'
import type { UserRole } from '@prisma/client'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

interface NavSection {
  label: string
  items: NavItem[]
}

const NAV: Record<UserRole, NavSection[]> = {
  administrator: [
    {
      label: 'Overview',
      items: [
        { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
      ],
    },
    {
      label: 'Management',
      items: [
        { href: '/admin/users', label: 'Users', icon: <Users size={16} /> },
        { href: '/admin/courses', label: 'Courses', icon: <BookOpen size={16} /> },
        { href: '/admin/categories', label: 'Categories', icon: <Tag size={16} /> },
      ],
    },
    {
      label: 'System',
      items: [
        { href: '/admin/audit-logs', label: 'Audit Logs', icon: <ScrollText size={16} /> },
        { href: '/admin/settings', label: 'Settings', icon: <Settings size={16} /> },
      ],
    },
  ],
  teacher: [
    {
      label: 'Overview',
      items: [
        { href: '/teacher', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
      ],
    },
    {
      label: 'Content',
      items: [
        { href: '/teacher/courses', label: 'My Courses', icon: <BookOpen size={16} /> },
        { href: '/teacher/courses/create', label: 'Create Course', icon: <PlusCircle size={16} /> },
      ],
    },
  ],
  student: [
    {
      label: 'Overview',
      items: [
        { href: '/student', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
      ],
    },
    {
      label: 'Learning',
      items: [
        { href: '/student/courses', label: 'My Courses', icon: <BookOpen size={16} /> },
        { href: '/student/certificates', label: 'Certificates', icon: <Trophy size={16} /> },
      ],
    },
    {
      label: 'Account',
      items: [
        { href: '/student/profile', label: 'My Profile', icon: <User size={16} /> },
      ],
    },
  ],
}

interface SidebarProps {
  role: UserRole
  userInitials: string
  userName: string
  userEmail: string
}

export function Sidebar({ role, userInitials, userName, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const sections = NAV[role] ?? NAV.student

  return (
    <aside className="w-60 min-h-screen bg-slate-900 flex flex-col flex-shrink-0" aria-label="Main navigation">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm" aria-hidden="true">
          🎓
        </div>
        <span className="font-bold text-white text-base">AlimShare</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {section.label}
            </p>
            {section.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/teacher' && item.href !== '/student' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-600/20 text-white border-r-2 border-indigo-500'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            aria-hidden="true"
          >
            {userInitials}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-white text-xs font-semibold truncate">{userName}</p>
            <p className="text-slate-400 text-[10px] truncate">{userEmail}</p>
          </div>
          <ChevronRight size={14} className="text-slate-500 flex-shrink-0" aria-hidden="true" />
        </div>
      </div>
    </aside>
  )
}
