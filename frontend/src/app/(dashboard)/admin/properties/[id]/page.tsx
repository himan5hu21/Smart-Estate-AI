'use client'

import { useParams } from 'next/navigation'
import { MapPin, Bed, Bath, Square, Home, Eye, Edit2, Archive } from 'lucide-react'
import { Button } from '@/ui/Button'
import { useToast } from '@/ui/Toast'
import dynamic from 'next/dynamic'

import { useEffect, useState } from 'react'
import { getPropertyById, updatePropertyStatus, getInquiries } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { FileText, CheckCircle, XCircle } from 'lucide-react'

const PropertyMap = dynamic(() => import('@/ui/PropertyMap'), {
  loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-xl" />,
  ssr: false
})

export default function AdminPropertyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [property, setProperty] = useState<any>(null)
  const [inquiriesCount, setInquiriesCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProperty() {
      if (!params.id) return
      try {
        const [propData, inqData] = await Promise.all([
             getPropertyById(params.id as string),
             getInquiries(params.id as string)
        ])
        setProperty(propData)
        setInquiriesCount(inqData ? inqData.length : 0)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProperty()
  }, [params.id])

  async function handleStatusChange(status: 'active' | 'rejected') {
    try {
        await updatePropertyStatus(property.id, status)
        toast({ type: 'success', message: `Property ${status === 'active' ? 'Approved' : 'Rejected'}` })
        window.location.reload()
    } catch (e) {
        console.error(e)
        const message = e instanceof Error ? e.message : 'Unknown error'
        toast({ type: 'error', message: `Error updating status: ${message}` })
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (loading) return <div>Loading...</div>
  if (!property) return <div>Property not found</div>

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Property Management</h1>
          <p className="text-muted-foreground mt-2">
            Details for Property ID: {params.id}
          </p>
        </div>
        <div className="flex gap-3">
          {property.status === 'pending' && (
              <>
                <Button onClick={() => handleStatusChange('active')} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                </Button>
                <Button variant="outline" onClick={() => handleStatusChange('rejected')} className="text-red-600 border-red-200 hover:bg-red-50">
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                </Button>
              </>
          )}
          <Button variant="outline">
            <Archive className="w-4 h-4 mr-2" />
            Archive
          </Button>
          <Button>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Listing
          </Button>
        </div>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
           {/* Image Banner */}
           <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center border relative overflow-hidden">
             {property.images && property.images.length > 0 ? (
                <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
             ) : (
                <span className="text-muted-foreground">Property Image Placeholder</span>
             )}
             <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
               {property.status}
             </div>
           </div>

           <div className="bg-white rounded-xl border shadow-sm p-6">
             <div className="flex justify-between items-start mb-6">
               <div>
                  <h2 className="text-2xl font-bold">{property.title}</h2>
                  <div className="flex items-center text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.location}
                  </div>
               </div>
                <div className="text-right">
                 <p className="text-2xl font-bold text-primary">{formatPrice(property.price)}</p>
               </div>
             </div>

              <div className="grid grid-cols-4 gap-4 py-6 border-t border-b mb-6">
               <div className="flex flex-col items-center">
                 <span className="font-bold text-lg">{property.bedrooms}</span>
                 <span className="text-xs text-muted-foreground uppercase">Beds</span>
               </div>
               <div className="flex flex-col items-center border-l">
                 <span className="font-bold text-lg">{property.bathrooms}</span>
                 <span className="text-xs text-muted-foreground uppercase">Baths</span>
               </div>
               <div className="flex flex-col items-center border-l">
                 <span className="font-bold text-lg">{property.area_sqft}</span>
                 <span className="text-xs text-muted-foreground uppercase">Sqft</span>
               </div>
                <div className="flex flex-col items-center border-l">
                 <span className="font-bold text-lg">{property.type}</span>
                 <span className="text-xs text-muted-foreground uppercase">Type</span>
               </div>
             </div>

             <div className="space-y-4">
                <h3 className="font-semibold">Description</h3>
                <p className="text-muted-foreground">{property.description}</p>
             </div>

             {property.amenities && (
                 <div className="mt-6 pt-6 border-t space-y-4">
                    <h3 className="font-semibold">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                        {property.amenities.map((a: string) => (
                            <span key={a} className="px-2 py-1 bg-gray-100 rounded text-sm">{a}</span>
                        ))}
                    </div>
                 </div>
             )}

             {property.ownership_docs && property.ownership_docs.length > 0 && (
                <div className="mt-6 pt-6 border-t space-y-4">
                    <h3 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4" /> Ownership Documents</h3>
                    <div className="flex flex-col gap-2">
                        {property.ownership_docs.map((doc: string, i: number) => (
                             <a key={i} href={doc} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm truncate">
                                Document {i + 1} (Click to View)
                             </a>
                        ))}
                    </div>
                </div>
             )}
             
            {/* Map Section */}
            <div className="mt-8 pt-6 border-t space-y-4">
              <h3 className="text-2xl font-bold text-slate-900">Location</h3>
              {property.latitude && property.longitude ? (
                <PropertyMap 
                  location={property.title} 
                  lat={property.latitude} 
                  lng={property.longitude} 
                />
              ) : (
                <div className="bg-gray-100 p-8 text-center rounded-xl text-slate-500">Map coordinates not available</div>
              )}
            </div>

           {/* Video Section */}
           {property.video_url && (
              <div className="mt-6 pt-6 border-t space-y-4">
                <h3 className="text-2xl font-bold text-slate-900">Video Tour</h3>
                <div className="aspect-video bg-black rounded-xl overflow-hidden">
                  <video 
                    src={property.video_url} 
                    controls 
                    className="w-full h-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
           )}

           </div>
         </div>

         {/* Sidebar */}
         <div className="space-y-6">
           <div className="bg-white rounded-xl border shadow-sm p-6">
             <h3 className="font-semibold mb-4">Performance</h3>
             <div className="grid grid-cols-3 gap-2 text-center">
               <div className="bg-gray-50 p-3 rounded-lg">
                 <p className="font-bold text-lg">{property.views || 0}</p>
                 <p className="text-xs text-muted-foreground">Views</p>
               </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                 <p className="font-bold text-lg">{(property.views || 0) + inquiriesCount}</p>
                 <p className="text-xs text-muted-foreground">Likes</p>
               </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                 <p className="font-bold text-lg">{inquiriesCount}</p>
                 <p className="text-xs text-muted-foreground">Inquiries</p>
               </div>
             </div>
           </div>

           <div className="bg-white rounded-xl border shadow-sm p-6">
             <h3 className="font-semibold mb-4">Listing Agent</h3>
             {property.profiles ? (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold overflow-hidden">
                        {property.profiles.avatar_url ? <img src={property.profiles.avatar_url} /> : (property.profiles.full_name?.charAt(0) || 'U')}
                    </div>
                    <div>
                        <p className="font-medium text-sm">{property.profiles.full_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{property.profiles.email || 'No Email'}</p>
                    </div>
                </div>
             ) : (
                 <p className="text-sm text-muted">Unknown Agent</p>
             )}
             <Button variant="ghost" size="sm" className="w-full mt-4 text-primary">View Agent Profile</Button>
           </div>
         </div>
       </div>
    </div>
  )
}
