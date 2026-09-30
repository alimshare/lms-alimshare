'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { formatDate, generateAvatarColor, getInitials } from '@/lib/utils'
import type { UserRole } from '@prisma/client'

export interface AdminUserRow {
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
  _count: { enrollments: number; courses: number }
}

interface UserManagementProps {
  users: AdminUserRow[]
  currentUserId: string
}

const ROLE_STYLES: Record<UserRole, string> = {
  administrator: 'bg-indigo-100 text-indigo-700',
  teacher: 'bg-emerald-100 text-emerald-700',
  student: 'bg-amber-100 text-amber-700',
}

const ROLE_LABELS: Record<UserRole, string> = {
  administrator: 'Admin',
  teacher: 'Teacher',
  student: 'Student',
}

const inputClassName =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

export function UserManagement({ users, currentUserId }: UserManagementProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null)
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null)
  const [deletingUser, setDeletingUser] = useState<AdminUserRow | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('student')
  const [isActive, setIsActive] = useState(true)

  const normalizedSearch = search.trim().toLowerCase()
  const filteredUsers = users.filter((user) => {
    const displayName = user.name ?? (`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email)
    const matchesSearch =
      !normalizedSearch ||
      `${displayName} ${user.email}`.toLowerCase().includes(normalizedSearch)
    const matchesRole = !roleFilter || user.role === roleFilter
    const matchesStatus =
      !statusFilter ||
      (statusFilter === 'active' && user.isActive && !!user.emailVerified) ||
      (statusFilter === 'pending' && user.isActive && !user.emailVerified) ||
      (statusFilter === 'inactive' && !user.isActive)
    return matchesSearch && matchesRole && matchesStatus
  })

  const pageSize = 8
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const visibleUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function openCreateDialog() {
    setEditingUser(null)
    setFirstName('')
    setLastName('')
    setEmail('')
    setPassword('')
    setRole('student')
    setIsActive(true)
    setError('')
    setDialogMode('create')
  }

  function openEditDialog(user: AdminUserRow) {
    setEditingUser(user)
    setFirstName(user.firstName ?? '')
    setLastName(user.lastName ?? '')
    setEmail(user.email)
    setPassword('')
    setRole(user.role)
    setIsActive(user.isActive)
    setError('')
    setDialogMode('edit')
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSaving(true)

    const isCreating = dialogMode === 'create'
    const payload = isCreating
      ? { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim().toLowerCase(), password, role }
      : { firstName: firstName.trim(), lastName: lastName.trim(), role, isActive }

    try {
      const response = await fetch(
        isCreating ? '/api/admin/users' : `/api/admin/users/${editingUser?.id}`,
        {
          method: isCreating ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )
      const result = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(result.error ?? 'Unable to save this user.')
        return
      }

      setDialogMode(null)
      setNotice(isCreating ? 'User created.' : 'User updated.')
      router.refresh()
    } catch {
      setError('Unable to reach the server. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingUser) return
    setError('')
    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/users/${deletingUser.id}`, { method: 'DELETE' })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(result.error ?? 'Unable to delete this user.')
        return
      }

      setDeletingUser(null)
      setNotice('User deleted.')
      router.refresh()
    } catch {
      setError('Unable to reach the server. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      {notice && (
        <div role="status" className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          {notice}
          <button type="button" onClick={() => setNotice('')} aria-label="Dismiss message" className="rounded p-1 hover:bg-emerald-100">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" aria-label="User management">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
          <h2 className="flex-1 font-semibold text-gray-900">
            All Users <span className="text-sm font-normal text-gray-400">({filteredUsers.length})</span>
          </h2>
          <label className="relative block sm:w-56">
            <span className="sr-only">Search users</span>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1) }}
              placeholder="Search users"
              className={`${inputClassName} pl-9`}
            />
          </label>
          <label>
            <span className="sr-only">Filter by role</span>
            <select value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value); setPage(1) }} className={inputClassName}>
              <option value="">All roles</option>
              <option value="administrator">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by status</span>
            <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1) }} className={inputClassName}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending verification</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <button type="button" onClick={openCreateDialog} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <Plus size={16} aria-hidden="true" />
            Add user
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm" aria-label="Users list">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">User</th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Role</th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Joined</th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Activity</th>
                <th scope="col" className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleUsers.map((user) => {
                const displayName = user.name ?? (`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email)
                const isPending = user.isActive && !user.emailVerified
                return (
                  <tr key={user.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: generateAvatarColor(displayName) }} aria-hidden="true">
                          {getInitials(displayName)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900">{displayName}</p>
                          <p className="truncate text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_STYLES[user.role]}`}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {user.isActive ? (
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${isPending ? 'text-amber-700' : 'text-emerald-700'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isPending ? 'bg-amber-500' : 'bg-emerald-500'}`} aria-hidden="true" />
                          {isPending ? 'Pending' : 'Active'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-gray-500">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {user.role === 'student' ? `${user._count.enrollments} courses` : user.role === 'teacher' ? `${user._count.courses} courses` : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button type="button" onClick={() => openEditDialog(user)} title={`Edit ${displayName}`} aria-label={`Edit ${displayName}`} className="rounded-md p-2 text-gray-500 transition hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                          <Pencil size={15} />
                        </button>
                        <button type="button" onClick={() => { setDeletingUser(user); setError('') }} disabled={user.id === currentUserId} title={user.id === currentUserId ? 'You cannot delete your own account' : `Delete ${displayName}`} aria-label={`Delete ${displayName}`} className="rounded-md p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-30">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {visibleUsers.length === 0 && (
            <div className="px-5 py-14 text-center">
              <p className="text-sm font-medium text-gray-700">No users match these filters.</p>
              <button type="button" onClick={() => { setSearch(''); setRoleFilter(''); setStatusFilter(''); setPage(1) }} className="mt-2 text-sm font-semibold text-indigo-700 hover:text-indigo-800">
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3.5 sm:px-5">
          <span className="text-xs text-gray-500">
            Showing {filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} users
          </span>
          <nav className="flex items-center gap-2" aria-label="User list pagination">
            <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} aria-label="Previous page" className="rounded-md border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-16 text-center text-xs text-gray-600">Page {currentPage} of {totalPages}</span>
            <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages} aria-label="Next page" className="rounded-md border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </nav>
        </div>
      </section>

      {dialogMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialogMode(null) }}>
          <section role="dialog" aria-modal="true" aria-labelledby="user-dialog-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h3 id="user-dialog-title" className="font-semibold text-gray-950">{dialogMode === 'create' ? 'Add user' : 'Edit user'}</h3>
                <p className="mt-0.5 text-xs text-gray-500">{dialogMode === 'create' ? 'Create an account and assign a role.' : 'Update profile details and account access.'}</p>
              </div>
              <button type="button" onClick={() => setDialogMode(null)} aria-label="Close dialog" className="rounded-md p-2 text-gray-500 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4 px-5 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-gray-700">
                  First name
                  <input required maxLength={50} value={firstName} onChange={(event) => setFirstName(event.target.value)} className={`${inputClassName} mt-1`} />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Last name
                  <input required maxLength={50} value={lastName} onChange={(event) => setLastName(event.target.value)} className={`${inputClassName} mt-1`} />
                </label>
              </div>
              <label className="block text-sm font-medium text-gray-700">
                Email
                <input type="email" required disabled={dialogMode === 'edit'} value={email} onChange={(event) => setEmail(event.target.value)} className={`${inputClassName} mt-1 disabled:bg-gray-100 disabled:text-gray-500`} />
              </label>
              {dialogMode === 'create' && (
                <label className="block text-sm font-medium text-gray-700">
                  Temporary password
                  <input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className={`${inputClassName} mt-1`} autoComplete="new-password" />
                </label>
              )}
              <label className="block text-sm font-medium text-gray-700">
                Role
                <select value={role} onChange={(event) => setRole(event.target.value as UserRole)} className={`${inputClassName} mt-1`}>
                  <option value="administrator">Administrator</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
              </label>
              {dialogMode === 'edit' && (
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  Account is active
                </label>
              )}
              {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}
              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button type="button" onClick={() => setDialogMode(null)} className="rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isSaving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {isSaving ? 'Saving...' : dialogMode === 'create' ? 'Create user' : 'Save changes'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) setDeletingUser(null) }}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="delete-dialog-title" className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <h3 id="delete-dialog-title" className="font-semibold text-gray-950">Delete user?</h3>
            <p className="mt-2 text-sm text-gray-600">
              This permanently deletes <span className="font-semibold text-gray-900">{deletingUser.name ?? deletingUser.email}</span>. This action cannot be undone.
            </p>
            {error && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" disabled={isSaving} onClick={() => setDeletingUser(null)} className="rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60">Cancel</button>
              <button type="button" disabled={isSaving} onClick={handleDelete} className="rounded-lg bg-red-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                {isSaving ? 'Deleting...' : 'Delete user'}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}