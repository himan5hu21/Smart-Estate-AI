'use client'

import { useEffect, useMemo, useState } from 'react'
import { Mail, Clock, Send, Loader2, Filter } from 'lucide-react'
import { getAllInquiries, getCurrentUser, respondToInquiry, updateInquiryStatus } from '@/lib/api'
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
  responded_by?: string
  property?: { title: string; location: string; posted_by: string }
  profiles?: { full_name: string; email: string }
}

interface InquiryThread {
  key: string
  name: string
  email: string
  property_id: number
  property?: { title: string; location: string; posted_by: string }
  owner?: { full_name: string; email: string }
  inquiries: Inquiry[]
  latest: Inquiry
  pendingCount: number
}

export default function AdminInquiriesPage() {
  const { error: showError, success: showSuccess } = useToast()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedThreadKey, setSelectedThreadKey] = useState<string | null>(null)
  const [response, setResponse] = useState('')
  const [sending, setSending] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [scopeFilter, setScopeFilter] = useState<'all' | 'mine'>('all')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const loadInquiries = async () => {
    try {
      const [data, user] = await Promise.all([getAllInquiries(), getCurrentUser()])
      setInquiries(data)
      setCurrentUserId(user?.id || null)
    } catch (error) {
      console.error(error)
      showError('Failed to load inquiries')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInquiries()
  }, [])

  const allThreads = useMemo(() => {
    const map = new Map<string, Inquiry[]>()
    inquiries.forEach((inq) => {
      const key = `${inq.property_id}|${inq.email}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(inq)
    })

    return Array.from(map.entries()).map(([key, items]) => {
      const sorted = [...items].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
      return {
        key,
        name: sorted[0].name,
        email: sorted[0].email,
        property_id: sorted[0].property_id,
        property: sorted[0].property,
        owner: sorted[0].profiles,
        inquiries: sorted,
        latest: sorted[sorted.length - 1],
        pendingCount: sorted.filter((i) => i.status === 'new').length,
      }
    }).sort((a, b) => +new Date(b.latest.created_at) - +new Date(a.latest.created_at))
  }, [inquiries])

  const threads = useMemo(() => {
    let result = allThreads

    if (statusFilter !== 'all') {
      result = result.filter((t) => t.inquiries.some((i) => i.status === statusFilter))
    }

    if (scopeFilter === 'mine' && currentUserId) {
      result = result.filter((t) => t.inquiries.some((i) => i.responded_by === currentUserId))
    }

    return result
  }, [allThreads, statusFilter, scopeFilter, currentUserId])

  const selectedThread = threads.find((t) => t.key === selectedThreadKey) || null
  const isSelectedThreadClosed = selectedThread ? selectedThread.inquiries.every((i) => i.status === 'closed') : false

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedThread || !response.trim()) return

    const target = [...selectedThread.inquiries].reverse().find((i) => i.status === 'new') || selectedThread.latest

    setSending(true)
    try {
      await respondToInquiry(target.id, response)
      showSuccess('Response sent successfully!')
      setResponse('')
      await loadInquiries()
    } catch (error) {
      console.error(error)
      showError('Failed to send response')
    } finally {
      setSending(false)
    }
  }

  const handleCloseInquiry = async () => {
    if (!selectedThread) return

    const openItems = selectedThread.inquiries.filter((i) => i.status !== 'closed')
    if (openItems.length === 0) {
      showError('All messages in this inquiry are already closed.')
      return
    }

    try {
      await Promise.all(openItems.map((item) => updateInquiryStatus(item.id, 'closed')))
      showSuccess('Inquiry closed successfully!')
      await loadInquiries()
    } catch (error) {
      console.error(error)
      showError('Failed to close inquiry')
    }
  }

  const stats = {
    conversations: allThreads.length,
    new: allThreads.filter((t) => t.pendingCount > 0).length,
    replied: allThreads.filter((t) => t.pendingCount === 0 && t.inquiries.some((i) => i.status === 'replied')).length,
    closed: allThreads.filter((t) => t.inquiries.every((i) => i.status === 'closed')).length,
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">All Property Inquiries</h1>
        <p className="text-slate-600">Threaded conversations across the platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4"><p className="text-sm text-slate-600 mb-1">Conversations</p><p className="text-2xl font-bold text-slate-900">{stats.conversations}</p></Card>
        <Card className="p-4"><p className="text-sm text-slate-600 mb-1">New</p><p className="text-2xl font-bold text-blue-600">{stats.new}</p></Card>
        <Card className="p-4"><p className="text-sm text-slate-600 mb-1">Replied</p><p className="text-2xl font-bold text-green-600">{stats.replied}</p></Card>
        <Card className="p-4"><p className="text-sm text-slate-600 mb-1">Closed</p><p className="text-2xl font-bold text-gray-600">{stats.closed}</p></Card>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Filter className="w-5 h-5 text-slate-600" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="replied">Replied</option>
          <option value="closed">Closed</option>
        </select>
        <select value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value as 'all' | 'mine')} className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Inquiries</option>
          <option value="mine">My Inquiries</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {threads.length === 0 ? (
            <Card className="p-12 text-center"><Mail className="w-16 h-16 mx-auto text-slate-300 mb-4" /><h3 className="text-xl font-semibold text-slate-900 mb-2">No inquiries found</h3></Card>
          ) : (
            threads.map((thread) => (
              <Card key={thread.key} className={`p-6 cursor-pointer transition-all hover:shadow-lg ${selectedThread?.key === thread.key ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setSelectedThreadKey(thread.key)}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">{thread.name}</h3>
                    <p className="text-sm text-slate-600">{thread.email}</p>
                    {thread.property && <p className="text-xs text-slate-500 mt-1">{thread.property.title}</p>}
                    {thread.owner && <p className="text-xs text-slate-500 mt-1">Owner: {thread.owner.full_name || thread.owner.email}</p>}
                  </div>
                  <Badge className={thread.inquiries.every((i) => i.status === 'closed') ? 'bg-gray-100 text-gray-700' : thread.pendingCount > 0 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>{thread.inquiries.every((i) => i.status === 'closed') ? 'closed' : thread.pendingCount > 0 ? `${thread.pendingCount} new` : 'replied'}</Badge>
                </div>
                <p className="text-slate-700 line-clamp-2">{thread.latest.message}</p>
              </Card>
            ))
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-6">
            {selectedThread ? (
              <>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Conversation</h3>

                <div className="space-y-3 max-h-[360px] overflow-y-auto mb-4">
                  {selectedThread.inquiries.map((inq) => (
                    <div key={inq.id} className="space-y-2">
                      <div className="p-3 rounded-lg bg-slate-100">
                        <p className="text-xs text-slate-500 mb-1">{inq.name}</p>
                        <p className="text-sm text-slate-900 whitespace-pre-wrap">{inq.message}</p>
                        <p className="text-xs text-slate-400 mt-2 flex items-center"><Clock className="w-3 h-3 mr-1" />{new Date(inq.created_at).toLocaleString('en-US')}</p>
                      </div>
                      {inq.response && <div className="p-3 rounded-lg bg-green-50 border border-green-200"><p className="text-xs text-green-700 mb-1">Response</p><p className="text-sm text-green-900 whitespace-pre-wrap">{inq.response}</p></div>}
                    </div>
                  ))}
                </div>

                {!isSelectedThreadClosed ? (
                  <form onSubmit={handleRespond} className="space-y-3">
                    {selectedThread.property && selectedThread.pendingCount > 0 && <AIInquiryResponse inquiry={selectedThread.latest} propertyData={selectedThread.property} onSelectResponse={(aiResponse) => setResponse(aiResponse)} />}
                    <textarea value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Type your response here..." className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32" required />
                    <div className="flex gap-2">
                      <Button type="submit" disabled={sending || !response.trim()} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">{sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : <><Send className="w-4 h-4 mr-2" />Send</>}</Button>
                      <Button type="button" variant="outline" onClick={handleCloseInquiry}>Close Inquiry</Button>
                    </div>
                  </form>
                ) : (
                  <div className="p-3 rounded-lg border bg-gray-50 text-sm text-gray-600">
                    Inquiry is closed. Reply input is disabled.
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12"><Mail className="w-12 h-12 mx-auto text-slate-300 mb-3" /><p className="text-slate-600">Select a conversation</p></div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}









