'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  MapPin, BedDouble, Bath, Square, Calendar, 
  ChevronLeft, Share2, Heart, ShieldCheck, 
  Loader2, Home, CheckCircle2, Sofa, Building, Layers, LogIn
} from 'lucide-react'
import { getPropertyById } from '@/lib/api'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { Card } from '@/ui/Card'
import dynamic from 'next/dynamic'

// Dynamically import Map to disable SSR (Leaflet requires window)
const PropertyMap = dynamic(() => import('@/ui/PropertyMap'), {
  loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-3xl" />,
  ssr: false
})

const PropertyDetailsPage = () => {
  const { id } = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return
      try {
        const data = await getPropertyById(id as string)
        setProperty(data)
      } catch (error) {
        console.error('Failed to fetch property:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProperty()
  }, [id])

  const handleLoginRedirect = () => {
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading property details...</p>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
          <Home className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Property Not Found</h1>
        <p className="text-slate-500 mb-8 max-w-md">The property you are looking for might have been removed or is temporarily unavailable.</p>
        <Button onClick={() => router.push('/search')} className="bg-blue-600">
          Back to Search
        </Button>
      </div>
    )
  }

  // Mock gallery if property only has one image
  const gallery = property.images && property.images.length > 0 ? property.images : [
    property.image_url
  ]

  const agent = property.profiles

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumbs / Back button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Results
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-3 py-1 uppercase tracking-wider text-xs font-bold">
                    For {property.type || 'Sale'}
                  </Badge>
                  <Badge variant="outline" className="border-slate-200 text-slate-500">
                    {property.status === 'active' ? 'Available' : property.status}
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">{property.title}</h1>
                <p className="text-slate-500 flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 text-blue-500" /> {property.location}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-slate-500 text-sm font-medium mb-1">Price</p>
                <p className="text-3xl font-black text-blue-600">₹{property.price?.toLocaleString()}</p>
              </div>
            </div>

            {/* Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-video rounded-[32px] overflow-hidden shadow-2xl border-4 border-white">
                <img 
                  src={gallery[activeImage]} 
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-6 right-6 flex gap-3">
                  <button className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg hover:bg-white transition-all active:scale-95 text-slate-900">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg hover:bg-white transition-all active:scale-95 text-slate-900">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {gallery.map((img: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`
                      relative flex-shrink-0 w-32 h-24 rounded-2xl overflow-hidden border-2 transition-all
                      ${activeImage === idx ? 'border-blue-600 scale-95 shadow-inner' : 'border-transparent hover:border-blue-200'}
                    `}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {activeImage === idx && <div className="absolute inset-0 bg-blue-600/10"></div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Map Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Location</h2>
              {property.latitude && property.longitude ? (
                  <PropertyMap 
                      location={property.title} 
                      lat={property.latitude} 
                      lng={property.longitude} 
                  />
              ) : (
                  <div className="bg-gray-100 p-8 text-center rounded-xl text-muted-foreground">Map coordinates not available</div>
              )}
            </div>

            {/* Video Tour Section */}
             {property.video_url && (
                <Card className="p-8 rounded-[32px] border-slate-100 shadow-sm">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Video Tour</h2>
                  <div className="aspect-video bg-black rounded-xl overflow-hidden">
                    <video 
                      src={property.video_url} 
                      controls 
                      className="w-full h-full"
                    >
                        Your browser does not support the video tag.
                    </video>
                  </div>
                </Card>
            )}

            {/* Quick Specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Bedrooms', value: property.bedrooms || 0, icon: <BedDouble className="w-6 h-6" /> },
                { label: 'Bathrooms', value: property.bathrooms || 0, icon: <Bath className="w-6 h-6" /> },
                { label: 'Area', value: `${property.area_sqft || 0} sq ft`, icon: <Square className="w-6 h-6" /> },
                { label: 'Built In', value: property.year_built || 'N/A', icon: <Calendar className="w-6 h-6" /> },
                { label: 'Furnishing', value: property.furnishing_status || 'N/A', icon: <Sofa className="w-6 h-6" /> },
                { label: 'Age', value: property.property_age || 'N/A', icon: <Building className="w-6 h-6" /> },
                { label: 'Floor', value: property.floor_number ? `${property.floor_number}/${property.total_floors || '?'}` : 'N/A', icon: <Layers className="w-6 h-6" /> },
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-3">
                    {item.icon}
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
                  <p className="text-lg font-black text-slate-900 capitalize">{typeof item.value === 'string' ? item.value.replace(/-/g, ' ') : item.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <Card className="p-8 rounded-[32px] border-slate-100 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Description</h2>
              <div className="text-slate-600 leading-relaxed text-lg space-y-4 break-all">
                {property.description?.split('\n').map((para: string, i: number) => (
                  <p key={i}>{para}</p>
                )) || (
                  <p>Experience luxury living in this magnificent property. Featuring modern design, high-end finishes, and breathtaking views, this home offers everything you've ever dreamed of. The spacious layout is perfect for both entertaining and comfortable family living.</p>
                )}
              </div>
            </Card>

            {/* Amenities */}
            <Card className="p-8 rounded-[32px] border-slate-100 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                {(property.amenities && property.amenities.length > 0 ? property.amenities : ['No amenities listed']).map((item: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-8">
            {/* Contact Card */}
            <Card className="p-8 rounded-[32px] border-slate-200 shadow-xl bg-white sticky top-24">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-slate-100 rounded-3xl mx-auto mb-4 overflow-hidden border-4 border-slate-50">
                  <img 
                    src={agent?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent?.full_name || 'Owner')}&background=0D8ABC&color=fff&size=200`} 
                    alt={agent?.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{agent?.full_name || 'Property Owner'}</h3>
                <p className="text-slate-500 font-medium capitalize">{agent?.role || 'Seller'}</p>
                <div className="flex items-center justify-center gap-1 mt-2 text-blue-600 bg-blue-50 py-1 px-3 rounded-full w-fit mx-auto">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider italic">Verified Provider</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogIn className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2 text-lg">Login Required</h4>
                  <p className="text-slate-600 text-sm mb-4">
                    Please log in to send an inquiry about this property
                  </p>
                  <Button 
                    onClick={handleLoginRedirect}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-5 h-5" />
                    Login to Send Inquiry
                  </Button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <Button 
                  onClick={() => router.push(`/agent/${agent?.id}`)}
                  variant="ghost" 
                  className="w-full text-blue-600 font-bold hover:text-blue-700 hover:bg-blue-50 rounded-xl"
                >
                  View Profile & Listings
                </Button>
              </div>
            </Card>

            {/* Safety Tips */}
            <div className="p-6 bg-slate-100 rounded-3xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" /> Safety Tips
              </h4>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>• Always meet in a public place</li>
                <li>• Verify property documents</li>
                <li>• Avoid upfront payments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetailsPage
