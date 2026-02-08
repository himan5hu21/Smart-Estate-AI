'use client'

import { useEffect, useState } from 'react'
import { Mail, Clock, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react'
import { getMySubmittedInquiries } from '@/lib/api'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { Badge } from '@/ui/Badge'
import { useToast } from '@/ui/Toast'
import Link from 'next/link'

interface Inquiry {
  id: string
  property_id: number
  name: string
  email: string
  message: string
  created_at: string
  status: 'new' | 'replied' | 'closed'
  response?: string
  responded_at?: string
  property?: {
    title: string
    location: string
    images?: string[]
  }
}

export default function MyInquiriesPage() {
  const { error: showError, success: showSuccess } = useToast()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [followUpMessage, setFollowUpMessage] = useState('')
  const [sendingFollowUp, setSendingFollowUp] = useState(false)

  const loadInquiries = async () => {
    try {
      const data = await getMySubmittedInquiries()
      setInquiries(data)
    } catch (error) {
      console.error(error)
      showError('Failed to load inquiries')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInquiries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInquiry || !followUpMessage.trim()) return

    setSendingFollowUp(true)
    try {
      const { submitInquiry, getCurrentUser, getProfile } = await import('@/lib/api')
      const user = await getCurrentUser()
      const profile = user ? await getProfile(user.id) : null

      await submitInquiry({
        property_id: selectedInquiry.property_id,
        name: profile?.full_name || selectedInquiry.name,
        email: user?.email || selectedInquiry.email,
        message: `Follow-up question:\n\n${followUpMessage}\n\n---\nOriginal inquiry: "${selectedInquiry.message}"\nPrevious response: "${selectedInquiry.response}"`
      })

      showSuccess('Follow-up question sent successfully!')
      setFollowUpMessage('')
      setShowFollowUp(false)
      loadInquiries()
    } catch (error) {
      console.error(error)
      showError('Failed to send follow-up question')
    } finally {
      setSendingFollowUp(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-700',
      replied: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700'
    }
    return colors[status as keyof typeof colors] || colors.new
  }

  const stats = {
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === 'new').length,
    replied: inquiries.filter(i => i.status === 'replied').length
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Inquiries</h1>
        <p className="text-slate-600">Track your property inquiries and responses</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-slate-600 mb-1">Total Inquiries</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600 mb-1">Pending Response</p>
          <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600 mb-1">Replied</p>
          <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inquiries List */}
        <div className="lg:col-span-2 space-y-4">
          {inquiries.length === 0 ? (
            <Card className="p-12 text-center">
              <Mail className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No inquiries yet</h3>
              <p className="text-slate-600 mb-4">Start exploring properties and ask questions!</p>
              <Button asChild>
                <Link href="/user/search">Browse Properties</Link>
              </Button>
            </Card>
          ) : (
            inquiries.map((inquiry) => (
              <Card
                key={inquiry.id}
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                  selectedInquiry?.id === inquiry.id ? 'ring-2 ring-blue-500' : ''
                } ${inquiry.status === 'replied' && 'border-l-4 border-l-green-500'}`}
                onClick={() => setSelectedInquiry(inquiry)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    {inquiry.property && (
                      <div className="flex items-start gap-3 mb-3">
                        {inquiry.property.images && inquiry.property.images[0] && (
                          <img 
                            src={inquiry.property.images[0]} 
                            alt={inquiry.property.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-slate-900">{inquiry.property.title}</h3>
                          <p className="text-sm text-slate-600">{inquiry.property.location}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <Badge className={getStatusBadge(inquiry.status)}>
                    {inquiry.status === 'new' ? 'Pending' : inquiry.status}
                  </Badge>
                </div>

                <div className="mb-3 p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700 mb-1">Your Question:</p>
                  <p className="text-sm text-slate-600 line-clamp-2">{inquiry.message}</p>
                </div>

                {inquiry.status === 'replied' && inquiry.response && (
                  <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <p className="text-sm font-medium text-green-900">Response Received</p>
                    </div>
                    <p className="text-sm text-green-800 line-clamp-2">{inquiry.response}</p>
                    <p className="text-xs text-green-600 mt-2">
                      💬 Click to read full response and ask follow-up questions
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(inquiry.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  {inquiry.property && (
                    <Link 
                      href={`/user/property/${inquiry.property_id}`}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Property
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-6">
            {selectedInquiry ? (
              <>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Inquiry Details</h3>
                
                {selectedInquiry.property && (
                  <div className="mb-4">
                    {selectedInquiry.property.images && selectedInquiry.property.images[0] && (
                      <img 
                        src={selectedInquiry.property.images[0]} 
                        alt={selectedInquiry.property.title}
                        className="w-full h-32 rounded-lg object-cover mb-3"
                      />
                    )}
                    <h4 className="font-semibold text-slate-900">{selectedInquiry.property.title}</h4>
                    <p className="text-sm text-slate-600">{selectedInquiry.property.location}</p>
                    <Button asChild variant="outline" className="w-full mt-3" size="sm">
                      <Link href={`/user/property/${selectedInquiry.property_id}`}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Property
                      </Link>
                    </Button>
                  </div>
                )}

                <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">Your Question</p>
                  <p className="text-sm text-slate-900">{selectedInquiry.message}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Asked on {new Date(selectedInquiry.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {selectedInquiry.status === 'replied' && selectedInquiry.response ? (
                  <>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <p className="text-sm font-medium text-green-900">Response</p>
                      </div>
                      <p className="text-sm text-green-800 whitespace-pre-wrap">{selectedInquiry.response}</p>
                      {selectedInquiry.responded_at && (
                        <p className="text-xs text-green-600 mt-3">
                          Replied on {new Date(selectedInquiry.responded_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>

                    {/* Follow-up Section */}
                    {!showFollowUp ? (
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm text-slate-700 mb-3">
                          💬 Have more questions about this property?
                        </p>
                        <Button 
                          onClick={() => setShowFollowUp(true)}
                          variant="outline"
                          className="w-full"
                          size="sm"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Ask Follow-up Question
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleFollowUpSubmit} className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-blue-700 mb-2">
                            💡 Your follow-up question will be sent to the property owner
                          </p>
                        </div>
                        <textarea
                          value={followUpMessage}
                          onChange={(e) => setFollowUpMessage(e.target.value)}
                          placeholder="Type your follow-up question here..."
                          className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 text-sm"
                          required
                        />
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={sendingFollowUp || !followUpMessage.trim()}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            size="sm"
                          >
                            {sendingFollowUp ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Question
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              setShowFollowUp(false)
                              setFollowUpMessage('')
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </>
                ) : (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      ⏳ Waiting for response from property owner...
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-600">Select an inquiry to view details</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
