'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  MapPin, BedDouble, Bath, Square, Calendar, 
  ChevronLeft, Share2, Heart, ShieldCheck, Mail, 
  User, Loader2, Home, CheckCircle2, Sofa, Building, Layers
} from 'lucide-react'
import { getPropertyById, submitInquiry } from '@/lib/api'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { Card } from '@/ui/Card'
import { useToast } from '@/ui/Toast'
import dynamic from 'next/dynamic'

const PropertyMap = dynamic(() => import('@/ui/PropertyMap'), {
  loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-3xl" />,
  ssr: false
})

const PropertyDetailsPage = () => {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [property, setProperty] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [inquiryForm, setInquiryForm] = useState({ name: '', email: '', message: '' })
  const [sendingInquiry, setSendingInquiry] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

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

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { getCurrentUser, getProfile } = await import('@/lib/api')
        const user = await getCurrentUser()
        if (user) {
          const profile = await getProfile(user.id)
          setCurrentUser(profile)
          // Auto-fill form with user data
          setInquiryForm(prev => ({
            ...prev,
            name: profile.full_name || '',
            email: user.email || ''
          }))
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    fetchCurrentUser()
  }, [])

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendingInquiry(true)
    try {
      await submitInquiry({
        property_id: property.id,
        ...inquiryForm
      })
      toast({ type: 'success', message: 'Inquiry sent successfully!' })
      setInquiryForm({ name: '', email: '', message: '' })
    } catch (error) {
      console.error(error)
      toast({ type: 'error', message: 'Failed to send inquiry.' })
    } finally {
      setSendingInquiry(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading property details...</p>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
          <Home className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Property Not Found</h1>
        <p className="text-slate-500 mb-8 max-w-md">The property you are looking for might have been removed or is temporarily unavailable.</p>
        <Button onClick={() => router.push('/agent/dashboard')} className="bg-blue-600">
          Back to Dashboard
        </Button>
      </div>
    )
  }

  const gallery = property.images && property.images.length > 0 ? property.images : [
    property.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  ]

  const agent = property.profiles

  return (
    <div className="p-8 pb-12">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6 group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
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
              <p className="text-3xl font-black text-blue-600">${property.price?.toLocaleString()}</p>
            </div>
          </div>

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
            <div className="flex gap-4 overflow-x-auto pb-2">
              {gallery.map((img: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`
                    relative shrink-0 w-32 h-24 rounded-2xl overflow-hidden border-2 transition-all
                    ${activeImage === idx ? 'border-blue-600 scale-95 shadow-inner' : 'border-transparent hover:border-blue-200'}
                  `}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  {activeImage === idx && <div className="absolute inset-0 bg-blue-600/10"></div>}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Location</h2>
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

          <Card className="p-8 rounded-[32px] border-slate-100 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Description</h2>
            <div className="text-slate-600 leading-relaxed text-lg space-y-4">
              {property.description?.split('\n').map((para: string, i: number) => (
                <p key={i}>{para}</p>
              )) || (
                <p>Experience luxury living in this magnificent property. Featuring modern design, high-end finishes, and breathtaking views.</p>
              )}
            </div>
          </Card>

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

        <div className="space-y-8">
          <Card className="p-8 rounded-[32px] border-slate-200 shadow-xl bg-white sticky top-8">
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
                <span className="text-xs font-bold uppercase tracking-wider">Verified</span>
              </div>
            </div>

            <form onSubmit={handleInquirySubmit} className="space-y-4 mb-8">
              <input 
                type="text" 
                placeholder="Your Name" 
                required
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-600"
                value={inquiryForm.name}
                onChange={(e) => setInquiryForm({...inquiryForm, name: e.target.value})}
                disabled={!!currentUser}
              />
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-600"
                  value={inquiryForm.email}
                  onChange={(e) => setInquiryForm({...inquiryForm, email: e.target.value})}
                  disabled={!!currentUser}
                />
                {currentUser && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </div>
              <textarea 
                placeholder="I am interested in this property..." 
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                value={inquiryForm.message}
                onChange={(e) => setInquiryForm({...inquiryForm, message: e.target.value})}
              ></textarea>
              <Button type="submit" disabled={sendingInquiry} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3">
                <Mail className="w-5 h-5" />
                {sendingInquiry ? 'Sending...' : 'Send Inquiry'}
              </Button>
            </form>

            <div className="border-t border-slate-100 pt-8">
              <Button 
                onClick={() => router.push(`/agents/${agent?.id}`)}
                variant="ghost" 
                className="w-full text-blue-600 font-bold hover:text-blue-700 hover:bg-blue-50 rounded-xl"
              >
                View Profile & Listings
              </Button>
            </div>
          </Card>

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
  )
}

export default PropertyDetailsPage
