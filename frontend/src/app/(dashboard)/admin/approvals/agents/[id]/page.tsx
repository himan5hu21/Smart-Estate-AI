'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, FileText, User, Mail, Phone, MapPin, Building, Calendar } from 'lucide-react'
import { Button } from '@/ui/Button'
import { getAgentById, verifyAgent, updateProfile } from '@/lib/api'

export default function AgentApprovalPage() {
  const params = useParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [agent, setAgent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAgent() {
      try {
        const id = params.id as string
        const data = await getAgentById(id)
        setAgent(data)
      } catch (error) {
        console.error('Error loading agent:', error)
      } finally {
        setLoading(false)
      }
    }
    loadAgent()
  }, [params.id])

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      await verifyAgent(params.id as string)
      router.push('/admin/approvals/agents')
    } catch (error) {
      console.error('Error approving agent:', error)
      alert('Failed to approve agent')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    setIsProcessing(true)
    try {
      await updateProfile(params.id as string, { is_verified: false, verification_status: 'rejected' })
      router.push('/admin/approvals/agents')
    } catch (error) {
      console.error('Error rejecting agent:', error)
      alert('Failed to reject agent')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading agent...</p>
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl font-semibold">Agent not found</p>
          <Button onClick={() => router.push('/admin/approvals/agents')} className="mt-4">
            Back to Approvals
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Verification</h1>
          <p className="text-muted-foreground mt-2">
            Review applicant details and documents before approval.
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="text-destructive hover:text-destructive hover:bg-destructive/10" 
            onClick={handleReject} 
            disabled={isProcessing || agent.is_verified}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
          <Button 
            onClick={handleApprove} 
            disabled={isProcessing || agent.is_verified}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {agent.is_verified ? 'Already Approved' : 'Approve Agent'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
           <div className="p-6 bg-white rounded-xl border shadow-sm">
             <div className="flex flex-col items-center text-center">
               <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                 {agent.avatar_url ? (
                   <img src={agent.avatar_url} alt={agent.full_name} className="w-full h-full rounded-full object-cover" />
                 ) : (
                   <User size={40} className="text-gray-500" />
                 )}
               </div>
               <h2 className="text-xl font-bold">{agent.full_name || 'Unknown Agent'}</h2>
               <p className="text-muted-foreground">{agent.agency || 'Independent Agent'}</p>
               
               {agent.is_verified && (
                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                   Verified
                 </span>
               )}
               
               <div className="w-full mt-6 space-y-4 text-left">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="break-all">{agent.email}</span>
                  </div>
                  {agent.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{agent.phone}</span>
                    </div>
                  )}
                  {agent.location && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{agent.location}</span>
                    </div>
                  )}
                  {agent.license_number && (
                    <div className="flex items-center gap-3 text-sm">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span>{agent.license_number}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Applied: {new Date(agent.created_at).toLocaleDateString()}</span>
                  </div>
               </div>
             </div>
           </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <p className="text-muted-foreground leading-relaxed">
              {agent.bio || 'No bio provided'}
            </p>
          </div>

          {agent.properties && agent.properties.length > 0 && (
            <div className="p-6 bg-white rounded-xl border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Listed Properties</h3>
              <div className="space-y-3">
                {agent.properties.slice(0, 5).map((property: any) => (
                  <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{property.title}</p>
                      <p className="text-xs text-muted-foreground">{property.location}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      property.status === 'approved' ? 'bg-green-100 text-green-800' :
                      property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {property.status}
                    </span>
                  </div>
                ))}
                {agent.properties.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    +{agent.properties.length - 5} more properties
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Agent Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Listings</p>
                <p className="text-2xl font-bold">{agent.properties?.length || 0}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="text-lg font-semibold">{new Date(agent.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
