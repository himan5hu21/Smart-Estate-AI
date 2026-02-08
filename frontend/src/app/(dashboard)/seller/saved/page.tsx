'use client'

import { useEffect, useState } from 'react'
import { getSavedProperties } from '@/lib/api'
import PropertyCard from '@/components/PropertyCard'
import { Heart, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/ui/Button'

export default function SellerSavedProperties() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSaved = async () => {
    try {
      const data = await getSavedProperties()
      setProperties(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSaved()
  }, [])

  const handleSaveChange = (propertyId: string, isSaved: boolean) => {
    if (!isSaved) {
      setProperties(prev => prev.filter(p => p.id !== parseInt(propertyId)))
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-8 h-8 text-red-500 fill-current" />
          <h1 className="text-3xl font-bold">Saved Properties</h1>
        </div>
        <p className="text-muted-foreground">Properties you have bookmarked for comparison.</p>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-300">
          <Heart className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No saved properties yet</h3>
          <p className="text-muted-foreground mb-6">
            Save properties to compare with your listings and understand market pricing!
          </p>
          <Link href="/seller/search">
            <Button>Browse Properties</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-slate-600">
              {properties.length} {properties.length === 1 ? 'property' : 'properties'} saved
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                userRole="seller"
                initialSaved={true}
                onSaveChange={handleSaveChange}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
