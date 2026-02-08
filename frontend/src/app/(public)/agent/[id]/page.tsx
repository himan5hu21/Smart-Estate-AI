'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ChevronLeft, MapPin, Mail, Phone, Loader2, Star, 
  ShieldCheck, Home, TrendingUp, Calendar, Users
} from 'lucide-react'
import { getAgentById } from '@/lib/api'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { Card } from '@/ui/Card'
import PropertyCard from '@/components/PropertyCard'

const AgentProfilePage = () => {
  const { id } = useParams()
  const router = useRouter()
  const [agent, setAgent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAgent = async () => {
      if (!id) return
      try {
        const data = await getAgentById(id as string)
        setAgent(data)
      } catch (error) {
        console.error('Failed to fetch agent:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAgent()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading agent profile...</p>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
          <Users className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Agent Not Found</h1>
        <p className="text-slate-500 mb-8 max-w-md">The agent profile you are looking for might have been removed or is unavailable.</p>
        <Button onClick={() => router.push('/agents')} className="bg-blue-600">
          Back to Agents
        </Button>
      </div>
    )
  }

  const listings = agent.properties || []

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Profile Header */}
      <section className="bg-slate-900 pt-32 pb-48 px-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-900/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <button 
            onClick={() => router.push('/agents')}
            className="flex items-center gap-2 text-blue-400 hover:text-white transition-colors mb-12 group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            <span className="text-lg font-medium">Back to All Agents</span>
          </button>

          <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
            <div className="w-48 h-48 rounded-[48px] overflow-hidden border-8 border-slate-800 shadow-2xl bg-white flex-shrink-0">
              <img 
                src={agent.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.full_name)}&background=0D8ABC&color=fff&size=400`} 
                alt={agent.full_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center md:text-left flex-1 pb-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-4xl md:text-6xl font-black text-white">{agent.full_name}</h1>
                <div className="flex items-center gap-2 self-center md:self-auto bg-blue-600/20 text-blue-400 border border-blue-400/30 px-4 py-1.5 rounded-full backdrop-blur-md">
                   {agent.is_verified && (
                     <>
                      <ShieldCheck className="w-5 h-5" />
                      <span className="text-sm font-bold uppercase tracking-wider">Verified Agent</span>
                     </>
                   )}
                </div>
              </div>
              <p className="text-blue-100/70 text-xl font-light max-w-2xl">
                {agent.specialization ? `Specializing in ${agent.specialization}` : 'Expert real estate strategist specializing in premium properties.'}
              </p>
              {agent.office_address && (
                 <p className="text-blue-200/50 text-sm mt-2 flex items-center gap-2">
                   <MapPin className="w-4 h-4" /> {agent.office_address}
                 </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Agent Info Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="p-8 rounded-[40px] border-slate-200 shadow-2xl bg-white">
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Contact Information</label>
                  <div className="space-y-4">
                    <a href={`tel:${agent.phone || '5551234567'}`} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all group">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-600">
                        <Phone className="w-5 h-5" />
                      </div>
                      <span className="font-bold">{agent.phone || '+1 (555) 123-4567'}</span>
                    </a>
                    <a href={`mailto:${agent.email || 'agent@smartestate.com'}`} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all group">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-600">
                        <Mail className="w-5 h-5" />
                      </div>
                      <span className="font-bold overflow-hidden text-ellipsis">{agent.email || 'agent@smartestate.com'}</span>
                    </a>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Performance Statistics</label>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Home className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-slate-600">Properties Sold</span>
                      </div>
                      <span className="font-black text-slate-900">142</span>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-amber-400" />
                        <span className="text-sm font-medium text-slate-600">Avg. Rating</span>
                      </div>
                      <span className="font-black text-slate-900">4.9/5</span>
                    </div>
                      <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-slate-600">Experience</span>
                        </div>
                        <span className="font-black text-slate-900">{agent.experience_years ? `${agent.experience_years} Years` : 'New'}</span>
                      </div>
                  </div>
                </div>

                <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20">
                  Book a Consultation
                </Button>
              </div>
            </Card>

            <div className="p-8 bg-slate-900 rounded-[40px] text-white">
              <h4 className="text-xl font-bold mb-4 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-blue-400" /> Market Focus
              </h4>
              <div className="flex flex-wrap gap-2">
                {['Luxury Homes', 'Condos', 'Rentals', 'New Dev', 'Commercial'].map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold text-blue-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Listings Area */}
          <div className="lg:col-span-3 space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-slate-900">Exclusive Listings</h2>
              <p className="text-slate-500 font-medium">Showing {listings.length} properties</p>
            </div>

            {listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {listings.map((property: any) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-[40px] border border-slate-200 shadow-sm">
                <Home className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No Active Listings</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  This agent currently has no public properties listed. Check back soon for new opportunities.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default AgentProfilePage
