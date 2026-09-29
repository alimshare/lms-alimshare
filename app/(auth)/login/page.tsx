'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type FormEvent } from 'react'
import { loginSchema } from '@/lib/validations/user'

const inputClassName =
  'mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [registered, setRegistered] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setRegistered(new URLSearchParams(window.location.search).get('registered') === '1')
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const parsed = loginSchema.safeParse({ email: email.trim(), password })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check your email and password.')
      return
    }

    const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl')
    const redirectTo =
      callbackUrl?.startsWith('/') && !callbackUrl.startsWith('//')
        ? callbackUrl
        : '/student'

    setIsSubmitting(true)
    try {
      const result = await signIn('credentials', {
        email: parsed.data.email.toLowerCase(),
        password: parsed.data.password,
        redirect: false,
        redirectTo,
      })

      if (result?.error) {
        setError('Email or password is incorrect.')
      } else if (result?.url) {
        router.replace(result.url)
        router.refresh()
      }
    } catch {
      setError('Unable to sign in right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-7">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Welcome back
        </p>
        <h1 className="text-2xl font-bold text-gray-950">Sign in to AlimShare</h1>
        <p className="mt-2 text-sm text-gray-600">
          Continue learning, teaching, and sharing knowledge.
        </p>
      </div>

      {registered && (
        <p role="status" className="mb-5 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-800">
          Your account is ready. Sign in to continue.
        </p>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-800">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="password" className="block text-sm font-medium text-gray-800">
              Password
            </label>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClassName}
            placeholder="Enter your password"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        New to AlimShare?{' '}
        <Link href="/register" className="font-semibold text-indigo-700 hover:text-indigo-800">
          Create an account
        </Link>
      </p>
    </div>
  )
}