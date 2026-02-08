'use client'

import { Table, TableRow, TableCell } from '@/components/Table'
import { Badge } from '@/ui/Badge'
import { Button } from '@/ui/Button'
import { Mail, Phone } from 'lucide-react'

export default function LeadsPage() {
  // Placeholder data for leads
  const leads = [
    { id: 1, name: 'John Doe', email: 'john@example.com', property: 'Luxury Villa', phone: '+1234567890' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', property: 'Cozy Apartment', phone: '+0987654321' },
  ]

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leads & Inquiries</h1>
        <p className="text-muted-foreground">Manage potential buyers interested in your properties.</p>
      </div>

      <Table headers={['Buyer Name', 'Property Interested', 'Contact Info', 'Actions']}>
        {leads.map((lead) => (
          <TableRow key={lead.id}>
            <TableCell className="font-medium">{lead.name}</TableCell>
            <TableCell>{lead.property}</TableCell>
            <TableCell>
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-1"><Mail size={12} /> {lead.email}</div>
                <div className="flex items-center gap-1"><Phone size={12} /> {lead.phone}</div>
              </div>
            </TableCell>
            <TableCell>
              <Button size="sm">Contact</Button>
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </div>
  )
}
