import Link from 'next/link'
import { Users, Building2, ArrowRight } from 'lucide-react'

export default function ApprovalsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
        <p className="text-muted-foreground mt-2">
          Manage approval requests for agents and properties.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link 
          href="/admin/approvals/agents"
          className="group block p-6 bg-white rounded-xl border shadow-sm hover:shadow-md transition-all hover:border-primary/50"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users size={24} />
            </div>
            <ArrowRight className="text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">Agent Approvals</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Review and approve new agent registration requests.
            </p>
          </div>
        </Link>

        <Link 
          href="/admin/approvals/properties"
          className="group block p-6 bg-white rounded-xl border shadow-sm hover:shadow-md transition-all hover:border-primary/50"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Building2 size={24} />
            </div>
            <ArrowRight className="text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">Property Approvals</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Review and approve new property listings before they go live.
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}
