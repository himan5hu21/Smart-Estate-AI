import { getDashboardStats } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/Card'
import { Building2, Users } from 'lucide-react'

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const items = [
    {
      title: 'Total Properties',  
      value: stats.totalProperties,
      icon: Building2,
      description: 'Listed properties on the platform',
      color: 'text-blue-600'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      description: 'Registered buyers, sellers, and agents',
      color: 'text-green-600'
    }
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <item.icon className={cn("h-4 w-4", item.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
