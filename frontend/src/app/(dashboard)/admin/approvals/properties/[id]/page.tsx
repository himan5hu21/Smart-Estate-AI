'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, MapPin, Bed, Bath, Square, Home } from 'lucide-react'
import { Button } from '@/ui/Button'
import { getPropertyById, updatePropertyStatus } from '@/lib/api'

export default function PropertyApprovalPage() {
  const params = useParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProperty() {
      try {
        const id = params.id as string
        const data = await getPropertyById(id)
        setProperty(data)
      } catch (error) {
        console.error('Error loading property:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProperty()
  }, [params.id])

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      await updatePropertyStatus(params.id as string, 'active')
      router.push('/admin/approvals/properties')
    } catch (error) {
      console.error('Error approving property:', error)
      alert('Failed to approve property')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    setIsProcessing(true)
    try {
      await updatePropertyStatus(params.id as string, 'rejected')
      router.push('/admin/approvals/properties')
    } catch (error) {
      console.error('Error rejecting property:', error)
      alert('Failed to reject property')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading property...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl font-semibold">Property not found</p>
          <Button onClick={() => router.push('/admin/approvals/properties')} className="mt-4">
            Back to Approvals
          </Button>
        </div>
      </div>
    )
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pending Review', className: 'bg-yellow-100 text-yellow-800' },
      active: { label: 'Approved', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
      sold: { label: 'Sold', className: 'bg-blue-100 text-blue-800' },
    }
    return badges[status] || badges.pending
  }

  const statusBadge = getStatusBadge(property.status)

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Property Verification</h1>
          <p className="text-muted-foreground mt-2">
            Review property details before publishing to the marketplace.
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="text-destructive hover:text-destructive hover:bg-destructive/10" 
            onClick={handleReject} 
            disabled={isProcessing || property.status !== 'pending'}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
          <Button 
            onClick={handleApprove} 
            disabled={isProcessing || property.status !== 'pending'}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Approve Listing
          </Button>
        </div>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Content */}
         <div className="lg:col-span-2 space-y-6">
           {/* Image Gallery */}
           {property.images && property.images.length > 0 ? (
             <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden border">
               <img 
                 src={property.images[0]} 
                 alt={property.title}
                 className="w-full h-full object-cover"
               />
             </div>
           ) : (
             <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center border">
               <span className="text-muted-foreground">No images available</span>
             </div>
           )}

           <div className="p-6 bg-white rounded-xl border shadow-sm space-y-4">
             <div className="flex justify-between items-start">
               <div>
                 <h2 className="text-2xl font-bold">{property.title}</h2>
                 <div className="flex items-center text-muted-foreground mt-1">
                   <MapPin className="w-4 h-4 mr-1" />
                   {property.location}
                 </div>
               </div>
               <div className="text-right">
                 <p className="text-2xl font-bold text-primary">{formatPrice(property.price)}</p>
                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.className}`}>
                   {statusBadge.label}
                 </span>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 py-4 border-t border-b">
               <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                 <Bed className="w-5 h-5 mb-1 text-muted-foreground" />
                 <span className="font-semibold">{property.bedrooms} Beds</span>
               </div>
               <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                 <Bath className="w-5 h-5 mb-1 text-muted-foreground" />
                 <span className="font-semibold">{property.bathrooms} Baths</span>
               </div>
               <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                 <Square className="w-5 h-5 mb-1 text-muted-foreground" />
                 <span className="font-semibold">{property.area_sqft} sqft</span>
               </div>
                <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                 <Home className="w-5 h-5 mb-1 text-muted-foreground" />
                 <span className="font-semibold">{property.type}</span>
               </div>
             </div>

             <div>
               <h3 className="font-semibold mb-2">Description</h3>
               <p className="text-muted-foreground">{property.description || 'No description provided'}</p>
             </div>
             
             {property.amenities && property.amenities.length > 0 && (
               <div>
                 <h3 className="font-semibold mb-2">Amenities</h3>
                 <div className="flex flex-wrap gap-2">
                   {property.amenities.map((amenity: string) => (
                     <span key={amenity} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                       {amenity}
                     </span>
                   ))}
                 </div>
               </div>
             )}
           </div>
         </div>

         {/* Sidebar Stats */}
         <div className="space-y-6">
            {property.profiles && (
              <div className="p-6 bg-white rounded-xl border shadow-sm">
                <h3 className="font-semibold mb-4">Listing Agent</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="font-bold text-gray-600">
                      {property.profiles.full_name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{property.profiles.full_name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">{property.profiles.email}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 bg-white rounded-xl border shadow-sm">
              <h3 className="font-semibold mb-4">Property Details</h3>
              <div className="space-y-3">
                 <div className="flex items-center justify-between text-sm">
                   <span>Furnishing</span>
                   <span className="font-medium">{property.furnishing_status || 'N/A'}</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                   <span>Year Built</span>
                   <span className="font-medium">{property.year_built || 'N/A'}</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                   <span>Submitted</span>
                   <span className="font-medium">{new Date(property.created_at).toLocaleDateString()}</span>
                 </div>
              </div>
            </div>
         </div>
       </div>
    </div>
  )
}
