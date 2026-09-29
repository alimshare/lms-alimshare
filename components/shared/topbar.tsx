import { Bell, LogOut, Search } from 'lucide-react'
import { auth, signOut } from '@/lib/auth'

export async function Topbar({ title }: { title: string }) {
  const session = await auth()
  const userName = session?.user?.name ?? 'User'

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="font-semibold text-gray-900 text-base">{title}</h1>
      <div className="flex items-center gap-3">
        <button
          aria-label="Search"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Search size={18} />
        </button>
        <button
          aria-label="Notifications"
          className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell size={18} />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"
            aria-label="Unread notifications"
          />
        </button>
        <div className="h-5 w-px bg-gray-200" aria-hidden="true" />
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/login' })
          }}
        >
          <button
            type="submit"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
            aria-label="Sign out"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline text-xs">{userName}</span>
          </button>
        </form>
      </div>
    </header>
  )
}
