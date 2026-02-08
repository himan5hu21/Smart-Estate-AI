'use client'

import { useEffect, useState } from 'react'
import { Mail, Clock, CheckCircle2, Send, Loader2 } from 'lucide-react'
import { getMyInquiries, respondToInquiry } from '@/lib/api'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { Badge } from '@/ui/Badge'
import { useToast } from '@/ui/Toast'
import { AIInquiryResponse } from '@/components/AIInquiryResponse'

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
  }
}

export default function SellerInquiriesPage() {
  const { error: showError, success: showSuccess } = useToast()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [response, setResponse] = useState('')
  const [sending, setSending] = useState(false)

  const loadInquiries = async () => {
    try {
      const data = await getMyInquiries()
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

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInquiry || !response.trim()) return

    setSending(true)
    try {
      await respondToInquiry(selectedInquiry.id, response)
      showSuccess('Response sent successfully!')
      setResponse('')
      setSelectedInquiry(null)
      loadInquiries()
    } catch (error) {
      console.error(error)
      showError('Failed to send response')
    } finally {
      setSending(false)
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Property Inquiries</h1>
        <p className="text-slate-600">Manage and respond to inquiries from potential buyers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inquiries List */}
        <div className="lg:col-span-2 space-y-4">
          {inquiries.length === 0 ? (
            <Card className="p-12 text-center">
              <Mail className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No inquiries yet</h3>
              <p className="text-slate-600">When buyers inquire about your properties, they&apos;ll appear here</p>
            </Card>
          ) : (
            inquiries.map((inquiry) => (
              <Card
                key={inquiry.id}
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                  selectedInquiry?.id === inquiry.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedInquiry(inquiry)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">{inquiry.name}</h3>
                    <p className="text-sm text-slate-600">{inquiry.email}</p>
                  </div>
                  <Badge className={getStatusBadge(inquiry.status)}>
                    {inquiry.status}
                  </Badge>
                </div>

                {inquiry.property && (
                  <div className="mb-3 p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm font-medium text-slate-900">{inquiry.property.title}</p>
                    <p className="text-xs text-slate-600">{inquiry.property.location}</p>
                  </div>
                )}

                <p className="text-slate-700 mb-3 line-clamp-2">{inquiry.message}</p>

                <div className="flex items-center text-xs text-slate-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(inquiry.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Response Panel */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-6">
            {selectedInquiry ? (
              <>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Respond to Inquiry</h3>
                
                <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-900 mb-1">{selectedInquiry.name}</p>
                  <p className="text-sm text-slate-600 mb-3">{selectedInquiry.email}</p>
                  <p className="text-sm text-slate-700 italic">&quot;{selectedInquiry.message}&quot;</p>
                </div>

                {selectedInquiry.status === 'replied' && selectedInquiry.response ? (
                  <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <p className="text-sm font-medium text-green-900">Your Response</p>
                    </div>
                    <p className="text-sm text-green-800">{selectedInquiry.response}</p>
                    {selectedInquiry.responded_at && (
                      <p className="text-xs text-green-600 mt-2">
                        Sent on {new Date(selectedInquiry.responded_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : null}

                <form onSubmit={handleRespond} className="space-y-4">
                  {/* AI Response Suggestions */}
                  {selectedInquiry.status !== 'replied' && selectedInquiry.property && (
                    <div className="mb-4">
                      <AIInquiryResponse
                        inquiry={selectedInquiry}
                        propertyData={selectedInquiry.property}
                        onSelectResponse={(aiResponse) => setResponse(aiResponse)}
                      />
                    </div>
                  )}

                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type your response here..."
                    className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={sending || !response.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Response
                      </>
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-600">Select an inquiry to respond</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
