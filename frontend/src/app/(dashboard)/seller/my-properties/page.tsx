'use client'

import { useEffect, useState } from 'react'
import { getMyProperties, getCurrentUser } from '@/lib/api'
import { Table, TableRow, TableCell } from '@/components/Table'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PlusCircle } from 'lucide-react'

export default function SellerMyProperties() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMyProperties = async () => {
    try {
      const user = await getCurrentUser()
      if (user) {
        const data = await getMyProperties(user.id)
        setProperties(data)
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyProperties()
  }, [])

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="border rounded-md p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 w-full bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Properties</h1>
          <p className="text-muted-foreground">Manage your properties for sale.</p>
        </div>
        <Link href="/seller/add-property">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Property
          </Button>
        </Link>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table headers={['Property', 'Location', 'Price', 'Status', 'Actions']}>
          {properties.length === 0 ? (
            <TableRow>
              <TableCell className="text-center py-12 text-muted-foreground" colSpan={5}>
                <div className="flex flex-col items-center justify-center space-y-3">
                  <p>No properties found.</p>
                  <Link href="/seller/add-property">
                    <Button variant="outline">Create your first listing</Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell className="font-medium">{property.title}</TableCell>
                <TableCell>{property.location}</TableCell>
                <TableCell>${property.price.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "capitalize",
                      property.status === 'active' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    )}
                  >
                    {property.status}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" variant="outline">Edit</Button>
                  <Button size="sm" variant="danger">Delete</Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      </div>
    </div>
  )
}
