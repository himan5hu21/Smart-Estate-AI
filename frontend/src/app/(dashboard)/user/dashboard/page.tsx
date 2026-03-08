import Link from 'next/link'
import type { ComponentType } from 'react'
import { getUserDashboardAnalytics } from '@/lib/api'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/Card'
import { Bell, Bookmark, MessageSquare, Search, Sparkles } from 'lucide-react'

type UserAnalytics = Awaited<ReturnType<typeof getUserDashboardAnalytics>>
type UserActivityPoint = { day: string; saved: number; inquiries: number; alerts: number }

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

export default async function BuyerDashboard() {
  const analytics: UserAnalytics = await getUserDashboardAnalytics()
  const { totals, distributions, activity7d } = analytics

  const maxActivity = Math.max(
    1,
    ...activity7d.map((d: UserActivityPoint) => d.saved),
    ...activity7d.map((d: UserActivityPoint) => d.inquiries),
    ...activity7d.map((d: UserActivityPoint) => d.alerts)
  )

  const statusEntries = Object.entries(distributions.inquiryStatus)
  const maxStatus = Math.max(1, ...statusEntries.map(([, value]) => value))

  return (
    <div className="p-6 md:p-8 space-y-8 bg-gradient-to-br from-cyan-50 via-white to-amber-50 min-h-screen">
      <section className="rounded-2xl p-6 border border-slate-200 bg-white/85 backdrop-blur shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Your Smart Dashboard</h1>
            <p className="text-slate-600 mt-1">Saved homes, inquiries, and alerts in one place.</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">Saved: {totals.savedProperties}</Badge>
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">Open Inquiries: {totals.openInquiries}</Badge>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Saved Properties" value={totals.savedProperties} subtitle="Your bookmarked listings" Icon={Bookmark} tone="bg-blue-100 text-blue-700" />
        <StatCard title="Total Inquiries" value={totals.inquiries} subtitle="Messages sent by you" Icon={MessageSquare} tone="bg-violet-100 text-violet-700" />
        <StatCard title="Active Alerts" value={totals.activeAlerts} subtitle="Live property alerts" Icon={Bell} tone="bg-emerald-100 text-emerald-700" />
        <StatCard title="Open Threads" value={totals.openInquiries} subtitle="Awaiting closure" Icon={Sparkles} tone="bg-orange-100 text-orange-700" />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2 border border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">7-Day Personal Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-3 items-end h-52">
              {activity7d.map((day: UserActivityPoint) => {
                const savedH = Math.max(4, Math.round((day.saved / maxActivity) * 100))
                const inquiriesH = Math.max(4, Math.round((day.inquiries / maxActivity) * 100))
                const alertsH = Math.max(4, Math.round((day.alerts / maxActivity) * 100))
                const label = new Date(day.day).toLocaleDateString('en-IN', { weekday: 'short' })

                return (
                  <div key={day.day} className="flex flex-col items-center gap-2">
                    <div className="w-full h-40 flex items-end justify-center gap-1">
                      <div className="w-2 rounded bg-blue-400" style={{ height: `${savedH}%` }} title={`Saved: ${day.saved}`} />
                      <div className="w-2 rounded bg-violet-400" style={{ height: `${inquiriesH}%` }} title={`Inquiries: ${day.inquiries}`} />
                      <div className="w-2 rounded bg-emerald-400" style={{ height: `${alertsH}%` }} title={`Alerts: ${day.alerts}`} />
                    </div>
                    <span className="text-xs text-slate-500">{label}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex flex-wrap gap-4 text-xs mt-4 text-slate-600">
              <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-400" />Saved</span>
              <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-violet-400" />Inquiries</span>
              <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />Alerts</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Link href="/user/search" className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50">Browse Properties</Link>
            <Link href="/user/saved" className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50">View Saved Homes</Link>
            <Link href="/user/alerts" className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50">Manage Alerts</Link>
            <Link href="/user/my-inquiries" className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50">Track Inquiries</Link>
            <Link href="/user/search" className="block">
              <Button className="w-full"><Search className="w-4 h-4 mr-2" />Start New Search</Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Inquiry Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusEntries.length === 0 ? (
              <p className="text-sm text-slate-500">No inquiries yet.</p>
            ) : (
              statusEntries.map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{formatKey(key)}</span>
                    <span className="font-semibold text-slate-900">{value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-cyan-500" style={{ width: `${Math.max(8, Math.round((value / maxStatus) * 100))}%` }} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

