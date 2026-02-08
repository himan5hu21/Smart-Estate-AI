'use client'

import { useEffect, useState } from 'react'
import { Mail, Clock, CheckCircle2, Send, Loader2, Filter } from 'lucide-react'
import { getAllInquiries, respondToInquiry } from '@/lib/api'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { Badge } from '@/ui/Badge'
import { useToast } from '@/ui/Toast'

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
    posted_by: string
  }
  profiles?: {
    full_name: string
    email: string
  }
}

export default function AdminInquiriesPage() {
  const { error: showError, success: showSuccess } = useToast()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [response, setResponse] = useState('')
  const [sending, setSending] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const loadInquiries = async () => {
    try {
      const data = await getAllInquiries()
      setInquiries(data)
      setFilteredInquiries(data)
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

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredInquiries(inquiries)
    } else {
      setFilteredInquiries(inquiries.filter(inq => inq.status === statusFilter))
    }
  }, [statusFilter, inquiries])

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

  const stats = {
    total: inquiries.length,
    new: inquiries.filter(i => i.status === 'new').length,
    replied: inquiries.filter(i => i.status === 'replied').length,
    closed: inquiries.filter(i => i.status === 'closed').length
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">All Property Inquiries</h1>
        <p className="text-slate-600">Manage and respond to all inquiries across the platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-slate-600 mb-1">Total Inquiries</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600 mb-1">New</p>
          <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600 mb-1">Replied</p>
          <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600 mb-1">Closed</p>
          <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
        </Card>
      </div>

      {/* Filter */}
      <div className="mb-6 flex items-center gap-3">
        <Filter className="w-5 h-5 text-slate-600" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="replied">Replied</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inquiries List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredInquiries.length === 0 ? (
            <Card className="p-12 text-center">
              <Mail className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No inquiries found</h3>
              <p className="text-slate-600">
                {statusFilter === 'all' 
                  ? 'No inquiries have been submitted yet' 
                  : `No ${statusFilter} inquiries found`}
              </p>
            </Card>
          ) : (
            filteredInquiries.map((inquiry) => (
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
                    {inquiry.profiles && (
                      <p className="text-xs text-slate-500 mt-1">
                        Owner: {inquiry.profiles.full_name || inquiry.profiles.email}
                      </p>
                    )}
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

                {selectedInquiry.property && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 font-medium mb-1">Property</p>
                    <p className="text-sm font-medium text-blue-900">{selectedInquiry.property.title}</p>
                    {selectedInquiry.profiles && (
                      <p className="text-xs text-blue-700 mt-1">
                        Owner: {selectedInquiry.profiles.full_name || selectedInquiry.profiles.email}
                      </p>
                    )}
                  </div>
                )}

                {selectedInquiry.status === 'replied' && selectedInquiry.response ? (
                  <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <p className="text-sm font-medium text-green-900">Previous Response</p>
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
