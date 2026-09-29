import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Auth',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 group">
            <span className="text-3xl">🎓</span>
            <span className="font-bold text-2xl text-gray-900 group-hover:text-indigo-600 transition-colors">
              AlimShare
            </span>
          </a>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {children}
        </div>
        <p className="text-center text-xs text-gray-500 mt-6">
          &copy; {new Date().getFullYear()} AlimShare LMS. All rights reserved.
        </p>
      </div>
    </div>
  )
}
