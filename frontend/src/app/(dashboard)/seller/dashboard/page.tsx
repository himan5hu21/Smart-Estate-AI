'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/ui/Card'
import { LayoutDashboard } from 'lucide-react'

export default function SellerDashboard() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <p className="text-muted-foreground">Manage your properties and track sales.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Properties currently live</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
