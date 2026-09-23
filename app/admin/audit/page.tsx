import { requireModule } from '@/lib/auth-helpers'
import { getAuditEvents } from '@/lib/data/admin-queries'
import { AdminPageHeader } from '@/components/admin/ui'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ action?: string; entity?: string; actor?: string; from?: string; to?: string; page?: string }> }) {
  await requireModule('audit')
  const params = await searchParams
  const data = await getAuditEvents({ action: params.action, entity: params.entity, actor: params.actor, from: params.from, to: params.to, page: Number(params.page || 1) })
  const query = new URLSearchParams(Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1])))
  const previousQuery = new URLSearchParams(query); previousQuery.set('page', String(Math.max(1, data.page - 1)))
  const nextQuery = new URLSearchParams(query); nextQuery.set('page', String(data.page + 1))

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Audit log" description={`${data.total} recorded administrative events`} />
      <form className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-4" method="get">
        <input name="action" defaultValue={params.action} placeholder="Filter action" className="h-10 rounded-lg border border-border bg-background px-3 text-sm" />
        <input name="entity" defaultValue={params.entity} placeholder="Filter entity" className="h-10 rounded-lg border border-border bg-background px-3 text-sm" />
        <input name="actor" defaultValue={params.actor} placeholder="Filter actor" className="h-10 rounded-lg border border-border bg-background px-3 text-sm" />
        <input name="from" type="date" defaultValue={params.from} aria-label="From date" className="h-10 rounded-lg border border-border bg-background px-3 text-sm" />
        <input name="to" type="date" defaultValue={params.to} aria-label="To date" className="h-10 rounded-lg border border-border bg-background px-3 text-sm" />
        <button className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground" type="submit">Filter</button>
      </form>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Actor</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Entity</th><th className="px-4 py-3">ID</th></tr>
          </thead>
          <tbody>
            {data.rows.map((row: { _id: string; createdAt: string; userName?: string; action: string; entity?: string; entityId?: string }) => (
              <tr className="border-b border-border last:border-0" key={row._id}><td className="px-4 py-3 text-muted-foreground">{new Date(row.createdAt).toLocaleString()}</td><td className="px-4 py-3">{row.userName || 'System'}</td><td className="px-4 py-3 font-medium">{row.action}</td><td className="px-4 py-3">{row.entity || '—'}</td><td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.entityId || '—'}</td></tr>
            ))}
          </tbody>
        </table>
        {!data.rows.length ? <p className="p-8 text-center text-sm text-muted-foreground">No audit events match these filters.</p> : null}
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Page {data.page} of {Math.max(1, Math.ceil(data.total / data.pageSize))}</span>
        <div className="flex gap-2">
          <Link aria-disabled={data.page <= 1} className="rounded-lg border border-border px-3 py-2 aria-disabled:pointer-events-none aria-disabled:opacity-50" href={`/admin/audit?${previousQuery.toString()}`}>Previous</Link>
          <Link aria-disabled={data.page >= Math.ceil(data.total / data.pageSize)} className="rounded-lg border border-border px-3 py-2 aria-disabled:pointer-events-none aria-disabled:opacity-50" href={`/admin/audit?${nextQuery.toString()}`}>Next</Link>
        </div>
      </div>
    </div>
  )
}
