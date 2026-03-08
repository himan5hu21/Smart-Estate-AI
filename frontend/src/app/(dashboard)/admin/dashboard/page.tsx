import Link from 'next/link'
import { getAdminDashboardAnalytics } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/Card'
import { Badge } from '@/ui/Badge'
import type { ComponentType } from 'react'
import { Activity, AlertTriangle, Building2, MessageSquare, ShieldCheck, Users } from 'lucide-react'

type ActivityPoint = {
  day: string
  properties: number
  users: number
  inquiries: number
}

type AnalyticsData = Awaited<ReturnType<typeof getAdminDashboardAnalytics>>

function formatKey(label: string) {
  return label
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function StatCard({ title, value, subtitle, Icon, tone }: { title: string; value: number; subtitle: string; Icon: ComponentType<{ className?: string }>; tone: string }) {
  return (
    <Card className="border-0 shadow-md bg-white/90 backdrop-blur">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{value.toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          </div>
          <div className={`h-10 w-10 rounded-xl grid place-items-center ${tone}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DistributionBars({ title, data, colorClass }: { title: string; data: Record<string, number>; colorClass: string }) {
  const entries = Object.entries(data)
  const max = Math.max(1, ...entries.map(([, value]) => value))

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-sm text-slate-500">No data yet.</p>
        ) : (
          entries.map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">{formatKey(key)}</span>
                <span className="font-semibold text-slate-900">{value}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${colorClass}`}
                  style={{ width: `${Math.max(8, Math.round((value / max) * 100))}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export default async function AdminDashboard() {
  const analytics: AnalyticsData = await getAdminDashboardAnalytics()
  const { totals, distributions, activity7d } = analytics

  const maxActivity = Math.max(
    1,
    ...activity7d.map((d: ActivityPoint) => d.properties),
    ...activity7d.map((d: ActivityPoint) => d.users),
    ...activity7d.map((d: ActivityPoint) => d.inquiries)
  )

  return (
    <div className="p-6 md:p-8 space-y-8 bg-gradient-to-br from-sky-50 via-slate-50 to-emerald-50 min-h-screen">
      <section className="rounded-2xl p-6 border border-slate-200 bg-white/80 backdrop-blur shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Command Center</h1>
            <p className="text-slate-600 mt-1">Live platform health, approvals, and user activity.</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending Properties: {totals.pendingProperties}</Badge>
            <Badge className="bg-rose-100 text-rose-800 border-rose-200">Unverified Agents: {totals.unverifiedAgents}</Badge>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Properties" value={totals.properties} subtitle="All listings" Icon={Building2} tone="bg-blue-100 text-blue-700" />
        <StatCard title="Total Users" value={totals.users} subtitle="All registered accounts" Icon={Users} tone="bg-emerald-100 text-emerald-700" />
        <StatCard title="Total Inquiries" value={totals.inquiries} subtitle="Buyer interest volume" Icon={MessageSquare} tone="bg-violet-100 text-violet-700" />
        <StatCard title="Open Inquiries" value={totals.openInquiries} subtitle="Need response or closure" Icon={AlertTriangle} tone="bg-orange-100 text-orange-700" />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2 border border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-slate-500" /> 7-Day Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-3 items-end h-52">
              {activity7d.map((day: ActivityPoint) => {
                const usersH = Math.max(4, Math.round((day.users / maxActivity) * 100))
                const propsH = Math.max(4, Math.round((day.properties / maxActivity) * 100))
                const inqH = Math.max(4, Math.round((day.inquiries / maxActivity) * 100))
                const label = new Date(day.day).toLocaleDateString('en-IN', { weekday: 'short' })

                return (
                  <div key={day.day} className="flex flex-col items-center gap-2">
                    <div className="w-full h-40 flex items-end justify-center gap-1">
                      <div className="w-2 rounded bg-emerald-400" style={{ height: `${usersH}%` }} title={`Users: ${day.users}`} />
                      <div className="w-2 rounded bg-blue-400" style={{ height: `${propsH}%` }} title={`Properties: ${day.properties}`} />
                      <div className="w-2 rounded bg-violet-400" style={{ height: `${inqH}%` }} title={`Inquiries: ${day.inquiries}`} />
                    </div>
                    <span className="text-xs text-slate-500">{label}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex flex-wrap gap-4 text-xs mt-4 text-slate-600">
              <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />Users</span>
              <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-400" />Properties</span>
              <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-violet-400" />Inquiries</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Link href="/admin/approvals/properties" className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50">Review Property Approvals</Link>
            <Link href="/admin/approvals/agents" className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50">Verify Agent Requests</Link>
            <Link href="/admin/inquiries" className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50">Manage Inquiries</Link>
            <Link href="/admin/users" className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50">Open User Management</Link>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 flex items-start gap-2 text-emerald-800">
              <ShieldCheck className="h-4 w-4 mt-0.5" />
              <p>All cards and charts are loaded from live Supabase data via server API calls.</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <DistributionBars title="Property Status" data={distributions.propertiesByStatus} colorClass="bg-blue-500" />
        <DistributionBars title="Property Types" data={distributions.propertiesByType} colorClass="bg-violet-500" />
        <DistributionBars title="Users by Role" data={distributions.usersByRole} colorClass="bg-emerald-500" />
      </section>
    </div>
  )
}

