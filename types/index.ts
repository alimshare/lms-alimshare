import type { UserRole } from '@prisma/client'

export type { UserRole }

export interface SessionUser {
  id: string
  email: string
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  avatar?: string | null
  role: UserRole
  isActive: boolean
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface UserWithStats {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  name: string | null
  avatar: string | null
  role: UserRole
  isActive: boolean
  emailVerified: Date | null
  createdAt: Date
  _count: {
    enrollments: number
    courses: number
  }
}
