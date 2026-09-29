import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Role-to-dashboard mapping
const ROLE_REDIRECTS: Record<string, string> = {
  administrator: '/admin',
  teacher: '/teacher',
  student: '/student',
}

export default auth((req) => {
  const { nextUrl, auth: session } = req as NextRequest & { auth: typeof req.auth }
  const pathname = nextUrl.pathname
  const isLoggedIn = !!session?.user

  // Protected route prefixes
  const isAdminRoute   = pathname.startsWith('/admin')
  const isTeacherRoute = pathname.startsWith('/teacher')
  const isStudentRoute = pathname.startsWith('/student')
  const isAuthRoute    = pathname.startsWith('/login') ||
                         pathname.startsWith('/register') ||
                         pathname.startsWith('/forgot-password') ||
                         pathname.startsWith('/reset-password')

  // If already logged in and tries auth pages → redirect to dashboard
  if (isLoggedIn && isAuthRoute) {
    const role = session!.user.role as string
    const redirectTo = ROLE_REDIRECTS[role] ?? '/student'
    return NextResponse.redirect(new URL(redirectTo, nextUrl))
  }

  // If not logged in and tries protected route → redirect to login
  if (!isLoggedIn && (isAdminRoute || isTeacherRoute || isStudentRoute)) {
    const loginUrl = new URL('/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based route protection
  if (isLoggedIn) {
    const role = session!.user.role as string
    if (isAdminRoute && role !== 'administrator') {
      return NextResponse.redirect(new URL(ROLE_REDIRECTS[role] ?? '/student', nextUrl))
    }
    if (isTeacherRoute && role !== 'teacher') {
      return NextResponse.redirect(new URL(ROLE_REDIRECTS[role] ?? '/student', nextUrl))
    }
    if (isStudentRoute && role !== 'student') {
      return NextResponse.redirect(new URL(ROLE_REDIRECTS[role] ?? '/student', nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
