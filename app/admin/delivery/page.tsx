import { requireModule } from '@/lib/auth-helpers'
import { getDeliveryEvents } from '@/lib/data/admin-queries'
import { retryDelivery } from '@/app/actions/admin'
import { AdminPageHeader } from '@/components/admin/ui'

export const dynamic = 'force-dynamic'

export default async function DeliveryPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireModule('delivery')
  const params = await searchParams
  const data = await getDeliveryEvents(Number(params.page || 1))
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Delivery outbox" description={`${data.total} email and CRM delivery events`} />
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">Created</th><th className="px-4 py-3">Kind</th><th className="px-4 py-3">Provider</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Attempts</th><th className="px-4 py-3">Error</th><th className="px-4 py-3">Action</th></tr></thead>
          <tbody>{data.rows.map((row: { _id: string; createdAt: string; kind: string; provider?: string; status: string; attempts: number; error?: string }) => <tr className="border-b border-border last:border-0" key={row._id}><td className="px-4 py-3 text-muted-foreground">{new Date(row.createdAt).toLocaleString()}</td><td className="px-4 py-3">{row.kind}</td><td className="px-4 py-3">{row.provider || '—'}</td><td className="px-4 py-3 font-medium">{row.status}</td><td className="px-4 py-3">{row.attempts}</td><td className="max-w-xs truncate px-4 py-3 text-muted-foreground">{row.error || '—'}</td><td className="px-4 py-3">{row.status === 'failed' ? <form action={async (fd: FormData) => { 'use server'; await retryDelivery(fd) }}><input type="hidden" name="id" value={row._id} /><button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted" type="submit">Retry</button></form> : <span className="text-xs text-muted-foreground">—</span>}</td></tr>)}</tbody>
        </table>
        {!data.rows.length ? <p className="p-8 text-center text-sm text-muted-foreground">No delivery events recorded.</p> : null}
      </div>
    </div>
  )
}
