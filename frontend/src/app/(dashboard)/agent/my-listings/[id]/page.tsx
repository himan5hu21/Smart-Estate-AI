'use client'

import { useParams, useRouter } from 'next/navigation'
import { MapPin, BarChart3, Edit, Trash2, Eye, MousePointerClick, MessageSquare } from 'lucide-react'
import { Button } from '@/ui/Button'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getPropertyById, deleteProperty, getInquiries } from '@/lib/api'
import { useToast } from '@/ui/Toast'
import dynamic from 'next/dynamic'

// Dynamically import Map to disable SSR
const PropertyMap = dynamic(() => import('@/ui/PropertyMap'), {
  loading: () => <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-xl" />,
  ssr: false
})

export default function MyPropertyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [property, setProperty] = useState<any>(null)
  const [inquiries, setInquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (!params.id) return
      try {
        const [propData, inqData] = await Promise.all([
            getPropertyById(params.id as string),
            getInquiries(params.id as string)
        ])
        setProperty(propData)
        setInquiries(inqData || [])
      } catch (error) {
        console.error(error)
        toast({ type: 'error', message: 'Failed to load property details' })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.id, toast])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return

    setDeleting(true)
    try {
      await deleteProperty(property.id)
      toast({ type: 'success', message: 'Property deleted successfully' })
      router.push('/agent/my-listings')
    } catch (error: any) {
      toast({ type: 'error', message: error.message || 'Failed to delete property' })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!property) return <div>Property not found</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{property.title}</h1>
          <div className="flex items-center text-muted-foreground mt-2">
            <MapPin className="w-4 h-4 mr-1" />
            {property.location}
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
          <Button asChild>
            <Link href={`/agent/add-property?edit=${property.id}`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Listing
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Eye size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold">{property.views || 0}</p>
            <p className="text-sm text-muted-foreground">Total Views</p>
          </div>
        </div>
        <div className="p-6 bg-white rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <MousePointerClick size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold">{(property.views || 0) + inquiries.length}</p>
            <p className="text-sm text-muted-foreground">Interactions</p>
          </div>
        </div>
        <div className="p-6 bg-white rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
             <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold">{inquiries.length}</p>
            <p className="text-sm text-muted-foreground">Inquiries</p>
          </div>
        </div>
         <div className="p-6 bg-white rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
             <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-lg font-bold capitalize">{property.status}</p>
            <p className="text-sm text-muted-foreground">Listing Status</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-xl border shadow-sm p-6 space-y-8">
          
           {/* Listing Details */}
           <div>
             <h2 className="text-xl font-semibold mb-4">Listing Details</h2>
             <p className="text-muted-foreground whitespace-pre-wrap">{property.description}</p>
           </div>
          
           {/* Map Section */}
           <div>
              <h3 className="text-lg font-semibold mb-3">Location</h3>
              {property.latitude && property.longitude ? (
                  <PropertyMap 
                      location={property.title} 
                      lat={property.latitude} 
                      lng={property.longitude} 
                  />
              ) : (
                  <div className="bg-gray-50 p-6 text-center rounded-xl text-muted-foreground border">Location coordinates not set</div>
              )}
           </div>

           {/* Video Section */}
           {property.video_url && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Video Tour</h3>
                <div className="aspect-video bg-black rounded-xl overflow-hidden border">
                  <video 
                    src={property.video_url} 
                    controls 
                    className="w-full h-full"
                  />
                </div>
              </div>
           )}

          {property.images && (
              <div>
                  <h3 className="font-semibold mb-2">Images</h3>
                  <div className="grid grid-cols-3 gap-2">
                       {property.images.map((img: string, i: number) => (
                           <img key={i} src={img} className="rounded-lg object-cover h-24 w-full" />
                       ))}
                  </div>
              </div>
          )}
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">Recent Inquiries</h2>
          <div className="space-y-4">
            {inquiries.length > 0 ? (
                inquiries.map((inq, i) => (
                    <div key={inq.id || i} className="p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{inq.name}</span>
                          <span className="text-xs text-muted-foreground">{new Date(inq.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-blue-600 mb-1">{inq.email}</p>
                        <p className="text-sm text-muted-foreground truncate">{inq.message}</p>
                    </div>
                ))
            ) : (
                <p className="text-sm text-muted-foreground">No recent inquiries.</p>
            )}
            <Button asChild variant="ghost" className="w-full text-blue-600">
              <Link href="/agent/inquiries">View All Inquiries</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
