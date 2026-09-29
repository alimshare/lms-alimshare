import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const createUserSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['administrator', 'teacher', 'student']),
})

// GET /api/admin/users
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'administrator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const role = searchParams.get('role') as string | null
  const page = parseInt(searchParams.get('page') ?? '1')
  const pageSize = parseInt(searchParams.get('pageSize') ?? '20')

  const where = {
    AND: [
      search ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
        ],
      } : {},
      role ? { role: role as 'administrator' | 'teacher' | 'student' } : {},
    ],
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        name: true, avatar: true, role: true, isActive: true,
        emailVerified: true, createdAt: true,
        _count: { select: { enrollments: true, courses: true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({
    success: true,
    data: users,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
}

// POST /api/admin/users
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'administrator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { firstName, lastName, email, password, role } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      role,
      emailVerified: new Date(), // Admin-created users are pre-verified
    },
    select: { id: true, email: true, role: true },
  })

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: 'CREATE',
      entity: 'User',
      entityId: user.id,
      newValues: { email, role },
    },
  })

  return NextResponse.json({ success: true, data: user }, { status: 201 })
}
