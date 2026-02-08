'use client'

import { useEffect, useState } from 'react'
import { getProperties, updatePropertyStatus } from '@/lib/api'
import { Table, TableRow, TableCell } from '@/components/Table'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import Link from 'next/link'

export default function PropertyApprovals() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProperties = async () => {
    try {
      const data = await getProperties({ status: 'pending' })
      setProperties(data)
    } catch (error) {
      console.error('Failed to fetch properties:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const handleAction = async (id: string, status: string) => {
    try {
      await updatePropertyStatus(id, status)
      setProperties(properties.filter(p => p.id !== id))
      alert(`Property ${status === 'active' ? 'Approved' : 'Rejected'} successfully!`)
    } catch (error: any) {
      console.error('Action failed:', error)
      alert(`Action failed: ${error.message || 'Please try again.'}`)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading approvals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Property Approvals</h1>
        <p className="text-muted-foreground">Review and approve new property listings.</p>
      </div>

      <Table headers={['Property', 'Location', 'Price', 'Status', 'Actions']}>
        {properties.length === 0 ? (
          <TableRow>
            <TableCell className="text-center py-8 text-muted-foreground" colSpan={5}>
              No pending approvals.
            </TableCell>
          </TableRow>
        ) : (
          properties.map((property) => (
            <TableRow key={property.id}>
              <TableCell className="font-medium">
                 <Link href={`/admin/approvals/properties/${property.id}`} className="text-blue-600 hover:underline">
                  {property.title}
                 </Link>
              </TableCell>
              <TableCell>{property.location}</TableCell>
              <TableCell>₹{property.price.toLocaleString('en-IN')}</TableCell>
              <TableCell className="space-x-2">
                 <div className="flex gap-2">
                   <Link href={`/admin/approvals/properties/${property.id}`}>
                      <Button size="sm" variant="outline">Review</Button>
                   </Link>
                   <Button size="sm" onClick={() => handleAction(property.id, 'active')}>Quick Approve</Button>
                 </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </Table>
    </div>
  )
}
