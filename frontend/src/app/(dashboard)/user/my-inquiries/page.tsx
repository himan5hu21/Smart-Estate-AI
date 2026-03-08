'use client'

import { useEffect, useMemo, useState } from 'react'
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
  property?: { title: string; location: string; images?: string[] }
}

interface InquiryThread {
  key: string
  property_id: number
  property?: { title: string; location: string; images?: string[] }
  inquiries: Inquiry[]
  latest: Inquiry
  pendingCount: number
}

export default function MyInquiriesPage() {
  const { error: showError, success: showSuccess } = useToast()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedThreadKey, setSelectedThreadKey] = useState<string | null>(null)
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

  useEffect(() => { loadInquiries() }, [])

  const threads = useMemo(() => {
    const map = new Map<number, Inquiry[]>()
    inquiries.forEach((inq) => {
      if (!map.has(inq.property_id)) map.set(inq.property_id, [])
      map.get(inq.property_id)!.push(inq)
    })
    return Array.from(map.entries()).map(([property_id, items]) => {
      const sorted = [...items].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
      return { key: String(property_id), property_id, property: sorted[0].property, inquiries: sorted, latest: sorted[sorted.length - 1], pendingCount: sorted.filter((i) => i.status === 'new').length }
    }).sort((a, b) => +new Date(b.latest.created_at) - +new Date(a.latest.created_at))
  }, [inquiries])

  const selectedThread = threads.find((t) => t.key === selectedThreadKey) || null

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedThread || !followUpMessage.trim()) return

    setSendingFollowUp(true)
    try {
      const { submitInquiry, getCurrentUser, getProfile } = await import('@/lib/api')
      const user = await getCurrentUser()
      const profile = user ? await getProfile(user.id) : null

      await submitInquiry({ property_id: selectedThread.property_id, name: profile?.full_name || selectedThread.latest.name, email: user?.email || selectedThread.latest.email, message: followUpMessage })

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

  const stats = { total: threads.length, pending: threads.filter((t) => t.pendingCount > 0).length, replied: threads.filter((t) => t.pendingCount === 0).length }

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8"><h1 className="text-3xl font-bold text-slate-900 mb-2">My Inquiries</h1><p className="text-slate-600">One card per property conversation</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"><Card className="p-4"><p className="text-sm text-slate-600 mb-1">Conversations</p><p className="text-2xl font-bold text-slate-900">{stats.total}</p></Card><Card className="p-4"><p className="text-sm text-slate-600 mb-1">Pending</p><p className="text-2xl font-bold text-blue-600">{stats.pending}</p></Card><Card className="p-4"><p className="text-sm text-slate-600 mb-1">Resolved</p><p className="text-2xl font-bold text-green-600">{stats.replied}</p></Card></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {threads.length === 0 ? <Card className="p-12 text-center"><Mail className="w-16 h-16 mx-auto text-slate-300 mb-4" /><h3 className="text-xl font-semibold text-slate-900 mb-2">No inquiries yet</h3><Button asChild><Link href="/user/search">Browse Properties</Link></Button></Card> : threads.map((thread) => (
            <Card key={thread.key} className={`p-6 cursor-pointer transition-all hover:shadow-lg ${selectedThread?.key === thread.key ? 'ring-2 ring-blue-500' : ''}`} onClick={() => { setSelectedThreadKey(thread.key); setShowFollowUp(false) }}>
              <div className="flex items-start justify-between mb-3"><div className="flex items-start gap-3">{thread.property?.images?.[0] && <img src={thread.property.images[0]} alt={thread.property.title} className="w-16 h-16 rounded-lg object-cover" />}<div><h3 className="font-semibold text-slate-900">{thread.property?.title || 'Property'}</h3><p className="text-sm text-slate-600">{thread.property?.location}</p></div></div><Badge className={thread.inquiries.every((i) => i.status === 'closed') ? 'bg-gray-100 text-gray-700' : thread.pendingCount > 0 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>{thread.inquiries.every((i) => i.status === 'closed') ? 'closed' : thread.pendingCount > 0 ? `${thread.pendingCount} pending` : 'replied'}</Badge></div>
              <p className="text-sm text-slate-600 line-clamp-2">{thread.latest.message}</p>
            </Card>
          ))}
        </div>
        <div className="lg:col-span-1"><Card className="p-6 sticky top-6">{selectedThread ? <><h3 className="text-lg font-semibold text-slate-900 mb-4">Conversation</h3>{selectedThread.property && <Button asChild variant="outline" className="w-full mb-4" size="sm"><Link href={`/user/property/${selectedThread.property_id}`}><ExternalLink className="w-4 h-4 mr-2" />View Property</Link></Button>}<div className="space-y-3 max-h-[420px] overflow-y-auto mb-4">{selectedThread.inquiries.map((inq) => (<div key={inq.id} className="space-y-2"><div className="p-3 rounded-lg bg-slate-100"><p className="text-xs text-slate-500 mb-1">You</p><p className="text-sm text-slate-900 whitespace-pre-wrap">{inq.message}</p><p className="text-xs text-slate-400 mt-2 flex items-center"><Clock className="w-3 h-3 mr-1" />{new Date(inq.created_at).toLocaleString('en-US')}</p></div>{inq.response && <div className="p-3 rounded-lg bg-green-50 border border-green-200"><p className="text-xs text-green-700 mb-1">Owner Reply</p><p className="text-sm text-green-900 whitespace-pre-wrap">{inq.response}</p></div>}</div>))}</div>{!showFollowUp ? <Button onClick={() => setShowFollowUp(true)} variant="outline" className="w-full"><Mail className="w-4 h-4 mr-2" />Send Follow-up</Button> : <form onSubmit={handleFollowUpSubmit} className="space-y-3"><textarea value={followUpMessage} onChange={(e) => setFollowUpMessage(e.target.value)} placeholder="Type your follow-up question..." className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 text-sm" required /><div className="flex gap-2"><Button type="submit" disabled={sendingFollowUp || !followUpMessage.trim()} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" size="sm">{sendingFollowUp ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : <><Mail className="w-4 h-4 mr-2" />Send</>}</Button><Button type="button" variant="outline" size="sm" onClick={() => { setShowFollowUp(false); setFollowUpMessage('') }}>Cancel</Button></div></form>}</> : <div className="text-center py-12"><Mail className="w-12 h-12 mx-auto text-slate-300 mb-3" /><p className="text-slate-600">Select a conversation</p></div>}</Card></div>
      </div>
    </div>
  )
}





