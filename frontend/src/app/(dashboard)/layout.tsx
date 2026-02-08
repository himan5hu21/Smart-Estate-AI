import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Prioritize using the profile role from the joined query
  // @ts-ignore - profile is added in getCurrentUser helper
  const role = user.profile?.role || user.user_metadata?.role || 'buyer'
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar role={role} userName={userName} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
