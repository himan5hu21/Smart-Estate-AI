'use client'

import { useParams } from 'next/navigation'
import { User, Mail, Shield, Calendar, Activity, Ban, KeyRound } from 'lucide-react'
import { Button } from '@/ui/Button'

const MOCK_USER = {
  id: '789',
  name: 'Jane Cooper',
  email: 'jane.c@example.com',
  role: 'Buyer',
  joinDate: 'Dec 10, 2025',
  lastActive: '2 hours ago',
  status: 'Active',
  stats: {
    searches: 154,
    savedProperties: 12,
    inquiries: 5
  }
}

export default function AdminUserDetailsPage() {
  const params = useParams()
  // Fetch user data using params.id

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">User Details</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10">
            <Ban className="w-4 h-4 mr-2" />
            Ban User
          </Button>
          <Button variant="outline">
            <KeyRound className="w-4 h-4 mr-2" />
            Reset Password
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="bg-white p-6 rounded-xl border shadow-sm md:col-span-1 h-fit">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <User size={32} />
            </div>
            <h2 className="text-lg font-bold">{MOCK_USER.name}</h2>
            <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {MOCK_USER.role}
            </span>
          </div>
          
          <div className="mt-6 space-y-4 pt-6 border-t">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{MOCK_USER.email}</span>
            </div>
             <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Joined {MOCK_USER.joinDate}</span>
            </div>
             <div className="flex items-center gap-3 text-sm">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span>Active {MOCK_USER.lastActive}</span>
            </div>
             <div className="flex items-center gap-3 text-sm">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-green-600 font-medium">{MOCK_USER.status}</span>
            </div>
          </div>
        </div>

        {/* Activity / Stats */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white border rounded-lg shadow-sm">
              <p className="text-sm text-muted-foreground">Properties Viewed</p>
              <p className="text-2xl font-bold mt-1">{MOCK_USER.stats.searches}</p>
            </div>
            <div className="p-4 bg-white border rounded-lg shadow-sm">
              <p className="text-sm text-muted-foreground">Saved</p>
              <p className="text-2xl font-bold mt-1">{MOCK_USER.stats.savedProperties}</p>
            </div>
             <div className="p-4 bg-white border rounded-lg shadow-sm">
              <p className="text-sm text-muted-foreground">Inquiries Sent</p>
              <p className="text-2xl font-bold mt-1">{MOCK_USER.stats.inquiries}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-semibold mb-4">Activity Log</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="text-muted-foreground min-w-[100px]">2 hours ago</span>
                  <span>Viewed property <span className="font-medium text-primary">Luxury Penthouse</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
