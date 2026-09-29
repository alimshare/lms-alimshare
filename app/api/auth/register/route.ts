import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations/user'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid registration details.' },
      { status: 400 },
    )
  }

  const { firstName, lastName, password } = parsed.data
  const email = parsed.data.email.trim().toLowerCase()

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash(password, 12),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`,
        role: 'student',
      },
      select: { id: true },
    })

    return NextResponse.json({ id: user.id }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 },
      )
    }

    console.error('Account registration failed:', error)
    return NextResponse.json(
      { error: 'Unable to create your account right now.' },
      { status: 500 },
    )
  }
}