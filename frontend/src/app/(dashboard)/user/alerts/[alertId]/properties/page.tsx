'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import PropertyCard from '@/components/PropertyCard'
import { Button } from '@/ui/Button'
import { createClient } from '@/utils/supabase/client'
import { aiClient } from '@/lib/ai-client'

interface RawProperty {
  id: number | string
  title?: string
  price?: number
  location?: string
  type?: string
  images?: string[]
  image_urls?: string[]
  status?: string
  bedrooms?: number
  bathrooms?: number
  area_sqft?: number
}

export default function AlertPropertiesPage() {
  const params = useParams<{ alertId: string }>()
  const alertId = params?.alertId

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [properties, setProperties] = useState<RawProperty[]>([])

  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      if (!alertId) return

      setLoading(true)
      setError(null)

      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token

        if (!token) {
          setError('Please sign in again to view alert properties.')
          return
        }

        const response = await aiClient.checkNewPropertiesForAlert(alertId, token)
        setProperties(response?.properties || [])
      } catch (e) {
        console.error('Error loading alert properties:', e)
        setError('Failed to load alert properties.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [alertId, supabase])

  const cardProperties = useMemo(() => {
    return properties.map((p) => ({
      id: String(p.id),
      title: p.title || `Property #${p.id}`,
      price: typeof p.price === 'number' ? p.price : 0,
      location: p.location || 'Location not available',
      type: p.type || 'Property',
      images: (p.images && p.images.length > 0 ? p.images : p.image_urls) || [],
      status: p.status || 'active',
      bedrooms: typeof p.bedrooms === 'number' ? p.bedrooms : 0,
      bathrooms: typeof p.bathrooms === 'number' ? p.bathrooms : 0,
      area_sqft: typeof p.area_sqft === 'number' ? p.area_sqft : 0,
    }))
  }, [properties])

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alert Properties</h1>
          <p className="text-muted-foreground">Properties matching this alert</p>
        </div>
        <Link href="/user/alerts">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Alerts
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-white rounded-xl animate-pulse border" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 border rounded-xl bg-white">
          <p className="text-red-600">{error}</p>
        </div>
      ) : cardProperties.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-white">
          <p className="text-muted-foreground">No properties match this alert right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardProperties.map((property) => (
            <PropertyCard key={property.id} property={property} userRole="buyer" />
          ))}
        </div>
      )}
    </div>
  )
}