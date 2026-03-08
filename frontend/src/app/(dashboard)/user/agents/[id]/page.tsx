'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User, MapPin, Phone, Mail, Award, Building2, Loader2, Home, MessageSquare, PhoneCall, X } from 'lucide-react'
import { Button } from '@/ui/Button'
import Link from 'next/link'
// Ahia getCurrentUser import karyu chhe
import { getAgentById, getCurrentUser, submitAgentInquiry } from '@/lib/api'
import { useToast } from '@/ui/Toast'

export default function AgentProfilePage() {
  const params = useParams()
  const { success, error: showError } = useToast()
  
  const [agent, setAgent] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null) // Logged in user ni state
  const [isLoading, setIsLoading] = useState(true)
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inquiryData, setInquiryData] = useState({ name: '', email: '', message: '' })

  useEffect(() => {
    async function fetchData() {
      try {
        if (params.id) {
          // Agent no data ane Current User no data ek sathe fetch kariye
          const [agentData, userData] = await Promise.all([
            getAgentById(params.id as string),
            getCurrentUser()
          ])
          
          setAgent(agentData)
          setCurrentUser(userData) // User malyo to state ma set karo
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  // Message button click thay tyare aa function call thase
  const handleMessageClick = () => {
    if (currentUser) {
      // Jo user logged in hoy to tenu naam ane email aapo-aap form ma bhari daiye (optional, pan user mate saru raheshe)
      setInquiryData((prev) => ({
        ...prev,
        name: currentUser.user_metadata?.full_name || '',
        email: currentUser.email || ''
      }))
      setIsModalOpen(true)
    } else {
      // Jo user logged in na hoy to alert aapo
      showError('Please log in to send a message to the agent.')
      // Tame chaho to direct login page par pan mokli shako:
      // router.push('/login')
    }
  }

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !agent?.id) return

    setIsSubmitting(true)

    try {
      await submitAgentInquiry({
        agent_id: agent.id,
        name: inquiryData.name.trim(),
        email: inquiryData.email.trim(),
        message: inquiryData.message.trim()
      })

      success('Message sent successfully to the agent!')
      setIsModalOpen(false)
      setInquiryData({ name: '', email: '', message: '' })
    } catch (error) {
      console.error('Error sending inquiry:', error)
      showError('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
        <p>Loading agent profile & listings...</p>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <User className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Agent Not Found</h2>
        <p className="text-gray-500">The agent profile you are looking for does not exist.</p>
        <Link href="/user/agents">
          <Button className="mt-6">Back to Agents</Button>
        </Link>
      </div>
    )
  }

  const allProperties = agent.properties || []
  const activeListings = allProperties.filter((p: any) => p.status === 'active')
  const soldListings = allProperties.filter((p: any) => p.status === 'sold')

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Cover Image & Profile Header */}
      <div className="bg-white border-b shadow-sm mb-8">
        <div className="mx-auto">
          <div className="h-48 w-full bg-gradient-to-r from-blue-600 to-indigo-700"></div>
          
          <div className="px-4 sm:px-8 pb-8">
            <div className="relative flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6 gap-6">
              
              {/* Avatar */}
              <div className="w-32 h-32 bg-white p-1.5 rounded-full shadow-lg shrink-0">
                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                  {agent.avatar_url ? (
                    <img src={agent.avatar_url} alt={agent.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-gray-400" />
                  )}
                </div>
              </div>

              {/* Agent Details Header */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{agent.full_name}</h1>
                <p className="text-gray-500 font-medium mt-1 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  Real Estate Agent {agent.agency_name && `• ${agent.agency_name}`}
                </p>
              </div>

              {/* Option 2 & 3: Action Buttons */}
              <div className="flex flex-wrap gap-3 w-full md:w-auto mt-4 md:mt-0">
                {/* Updated Message onClick to use handleMessageClick */}
                <Button onClick={handleMessageClick} className="flex items-center gap-2 shadow-md">
                  <MessageSquare className="w-4 h-4" /> Message
                </Button>
                
                {agent.phone && (
                  <a href={`tel:${agent.phone}`}>
                    <Button variant="outline" className="flex items-center gap-2 bg-white hover:bg-gray-50">
                      <PhoneCall className="w-4 h-4" /> Call
                    </Button>
                  </a>
                )}
                
                {agent.email && (
                  <a href={`mailto:${agent.email}`}>
                    <Button variant="outline" className="flex items-center gap-2 bg-white hover:bg-gray-50">
                      <Mail className="w-4 h-4" /> Email
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 grid md:grid-cols-3 gap-8">
        
        {/* Left Column (About & Listings) */}
        <div className="md:col-span-2 space-y-8">
          
          <section className="bg-white p-6 rounded-2xl border shadow-sm">
            <h2 className="text-xl font-bold mb-3 text-gray-900">About {agent.full_name?.split(' ')[0]}</h2>
            <p className="text-gray-600 leading-relaxed">
              {agent.specialization 
                ? `Specializing in ${agent.specialization}. I am dedicated to helping clients find their dream properties with ${agent.experience_years || 0} years of extensive experience in the real estate market.` 
                : 'A dedicated and verified real estate professional ready to help you find your dream property. Contact me today to start your journey.'}
            </p>
          </section>

          <section className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Active Listings</h2>
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                {activeListings.length} Properties
              </span>
            </div>

            {activeListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {activeListings.map((listing: any) => (
                  <Link key={listing.id} href={`/user/property/${listing.id}`} className="group flex flex-col border rounded-xl overflow-hidden hover:shadow-lg transition-all bg-white hover:-translate-y-1 duration-200">
                    <div className="aspect-[4/3] relative bg-gray-100 overflow-hidden">
                      {listing.images && listing.images.length > 0 ? (
                        <img 
                          src={listing.images[0]} 
                          alt={listing.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                          <Home className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-sm">No Image</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                        Active
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {listing.title}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {listing.location}
                      </p>
                      <p className="text-blue-600 font-bold mt-auto pt-3 text-lg">
                        ₹{Number(listing.price).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center flex flex-col items-center justify-center">
                <Home className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No active listings at the moment.</p>
              </div>
            )}
          </section>
        </div>

        {/* Right Column (Info & Stats) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <h3 className="font-bold mb-4 text-gray-900 border-b pb-3">Contact Details</h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span>{agent.office_address || 'Address not provided'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <span className="font-medium text-gray-900">{agent.phone || 'Not available'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                {agent.email ? (
                  <a href={`mailto:${agent.email}`} className="truncate text-blue-600 hover:underline">
                    {agent.email}
                  </a>
                ) : (
                  <span className="truncate text-gray-500">Email not available</span>
                )}
              </div>
              {agent.agency_name && (
                <div className="flex items-center gap-3 pt-3 border-t">
                  <Building2 className="w-5 h-5 text-blue-500 shrink-0" />
                  <span className="font-medium">{agent.agency_name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <h3 className="font-bold mb-4 text-gray-900 border-b pb-3">Performance</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="font-bold text-2xl text-blue-600">{soldListings.length}</p>
                <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">Sold</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="font-bold text-2xl text-blue-600">{activeListings.length}</p>
                <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">Active</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="font-bold text-2xl text-blue-600">{agent.experience_years || 0}</p>
                <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">Yrs Exp</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INQUIRY MODAL */}
      {isModalOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-gray-900">Message {agent.full_name}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleInquirySubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={inquiryData.name}
                  onChange={(e) => setInquiryData({...inquiryData, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={inquiryData.email}
                  onChange={(e) => setInquiryData({...inquiryData, email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  value={inquiryData.message}
                  onChange={(e) => setInquiryData({...inquiryData, message: e.target.value})}
                  placeholder="I'm interested in buying/selling a property..."
                />
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}




