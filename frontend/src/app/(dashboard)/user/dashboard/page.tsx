'use client'

import Link from 'next/link'
import { Button } from '@/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/Card'
import { Building2, Bookmark, Bell } from 'lucide-react'

export default function BuyerDashboard() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/search">
          <Button>
            <Building2 className="mr-2 h-4 w-4" />
            Browse Properties
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Properties</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Properties you have saved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">New updates this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex flex-col items-center justify-center text-center py-10 space-y-4">
          <Building2 className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Start your search</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Find your dream home from thousands of listings. Save your favorites and get alerted when prices drop.
          </p>
          <Link href="/user/search">
            <Button variant="outline">Search Now</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
