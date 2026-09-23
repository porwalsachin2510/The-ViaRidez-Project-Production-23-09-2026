"use client"

import { useActionState, useState, useTransition } from "react"
import { UserPlus } from "lucide-react"
import { createUser, updateUserRole, toggleUserActive, type UserActionState } from "@/app/actions/users"

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  editor: "Editor",
  content_writer: "Content Writer",
  seo_manager: "SEO Manager",
}

type UserRow = {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  isSelf: boolean
}

function RoleSelect({ user }: { user: UserRow }) {
  const [pending, startTransition] = useTransition()
  const [role, setRole] = useState(user.role)
  return (
    <select
      value={role}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value
        setRole(next)
        startTransition(async () => {
          await updateUserRole(user.id, next)
        })
      }}
      className="rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground focus:border-accent focus:outline-none"
    >
      {Object.entries(ROLE_LABELS).map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  )
}

function ActiveToggle({ user }: { user: UserRow }) {
  const [pending, startTransition] = useTransition()
  const [active, setActive] = useState(user.isActive)
  if (user.isSelf) return <span className="text-xs text-muted-foreground">You</span>
  return (
    <button
      disabled={pending}
      onClick={() => {
        const next = !active
        setActive(next)
        startTransition(async () => {
          await toggleUserActive(user.id, next)
        })
      }}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        active
          ? "bg-emerald-100 text-emerald-800 ring-emerald-200"
          : "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      {active ? "Active" : "Disabled"}
    </button>
  )
}

export function UsersManager({ users }: { users: UserRow[] }) {
  const [state, action] = useActionState<UserActionState, FormData>(createUser, null)

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  {u.isSelf ? ROLE_LABELS[u.role] : <RoleSelect user={u} />}
                </td>
                <td className="px-4 py-3">
                  <ActiveToggle user={u} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
          <UserPlus className="h-5 w-5 text-accent" />
          Add team member
        </h2>
        <form action={action} className="space-y-4">
          <Input name="name" label="Full name" />
          <Input name="email" label="Email" type="email" />
          <Input name="password" label="Temporary password" type="password" help="Minimum 8 characters." />
          <div>
            <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-foreground">
              Role
            </label>
            <select
              id="role"
              name="role"
              defaultValue="content_writer"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            >
              {Object.entries(ROLE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
          {state?.success ? <p className="text-sm text-emerald-600">{state.success}</p> : null}
          <button
            type="submit"
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground"
          >
            Create user
          </button>
        </form>
      </div>
    </div>
  )
}

function Input({ name, label, type = "text", help }: { name: string; label: string; type?: string; help?: string }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
      {help ? <p className="mt-1 text-xs text-muted-foreground">{help}</p> : null}
    </div>
  )
}
