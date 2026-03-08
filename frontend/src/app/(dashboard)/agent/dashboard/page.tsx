import Link from 'next/link'
import type { ComponentType } from 'react'
import { getAgentDashboardAnalytics } from '@/lib/api'
import { Badge } from '@/ui/Badge'
import { Button } from '@/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/Card'
import { Building2, MessageSquare, PlusCircle, Target } from 'lucide-react'

type AgentAnalytics = Awaited<ReturnType<typeof getAgentDashboardAnalytics>>
type ActivityPoint = { day: string; listings: number; inquiries: number }

function formatKey(label: string) {
  return label.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
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

export default async function AgentDashboard() {
  const analytics: AgentAnalytics = await getAgentDashboardAnalytics()
  const { totals, distributions, activity7d } = analytics

  const maxActivity = Math.max(
    1,
    ...activity7d.map((d: ActivityPoint) => d.listings),
    ...activity7d.map((d: ActivityPoint) => d.inquiries)
  )

  const listingEntries = Object.entries(distributions.listingStatus)
  const inquiryEntries = Object.entries(distributions.inquiryStatus)
  const maxListing = Math.max(1, ...listingEntries.map(([, value]) => value))
  const maxInquiry = Math.max(1, ...inquiryEntries.map(([, value]) => value))

  return (
    <div className="p-6 md:p-8 space-y-8 bg-gradient-to-br from-sky-50 via-white to-lime-50 min-h-screen">
      <section className="rounded-2xl p-6 border border-slate-200 bg-white/85 backdrop-blur shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Agent Performance Hub</h1>
            <p className="text-slate-600 mt-1">Track listings, leads, and conversion health in real time.</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending: {totals.pendingListings}</Badge>
            <Badge className="bg-rose-100 text-rose-800 border-rose-200">Open Leads: {totals.openInquiries}</Badge>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Listings" value={totals.listings} subtitle="All your listings" Icon={Building2} tone="bg-blue-100 text-blue-700" />
        <StatCard title="Active Listings" value={totals.activeListings} subtitle="Currently live" Icon={Target} tone="bg-emerald-100 text-emerald-700" />
        <StatCard title="Total Inquiries" value={totals.inquiries} subtitle="Lead volume" Icon={MessageSquare} tone="bg-violet-100 text-violet-700" />
        <StatCard title="Closed Inquiries" value={totals.closedInquiries} subtitle="Resolved leads" Icon={Target} tone="bg-orange-100 text-orange-700" />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2 border border-slate-200 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">7-Day Pipeline Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-3 items-end h-52">
              {activity7d.map((day: ActivityPoint) => {
                const listingsH = Math.max(4, Math.round((day.listings / maxActivity) * 100))
                const inquiriesH = Math.max(4, Math.round((day.inquiries / maxActivity) * 100))
                const label = new Date(day.day).toLocaleDateString('en-IN', { weekday: 'short' })
                return (
                  <div key={day.day} className="flex flex-col items-center gap-2">
                    <div className="w-full h-40 flex items-end justify-center gap-1">
                      <div className="w-2 rounded bg-blue-400" style={{ height: `${listingsH}%` }} title={`Listings: ${day.listings}`} />
                      <div className="w-2 rounded bg-violet-400" style={{ height: `${inquiriesH}%` }} title={`Inquiries: ${day.inquiries}`} />
                    </div>
                    <span className="text-xs text-slate-500">{label}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Link href="/agent/add-property" className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50">Add New Listing</Link>
            <Link href="/agent/my-listings" className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50">Manage Listings</Link>
            <Link href="/agent/inquiries" className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50">Open Lead Inbox</Link>
            <Link href="/agent/search" className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50">Search Market</Link>
            <Link href="/agent/add-property" className="block"><Button className="w-full"><PlusCircle className="w-4 h-4 mr-2" />Create Listing</Button></Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Listing Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {listingEntries.length === 0 ? <p className="text-sm text-slate-500">No listings yet.</p> : listingEntries.map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">{formatKey(key)}</span><span className="font-semibold text-slate-900">{value}</span></div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.max(8, Math.round((value / maxListing) * 100))}%` }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Lead Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {inquiryEntries.length === 0 ? <p className="text-sm text-slate-500">No inquiries yet.</p> : inquiryEntries.map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">{formatKey(key)}</span><span className="font-semibold text-slate-900">{value}</span></div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.max(8, Math.round((value / maxInquiry) * 100))}%` }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

