'use client'

import { useEffect, useMemo, useState } from 'react'
import { Mail, Clock, CheckCircle2, Loader2 } from 'lucide-react'
import { getMySubmittedAgentMessages, submitAgentInquiry, getCurrentUser, getProfile } from '@/lib/api'
import { Card } from '@/ui/Card'
import { Badge } from '@/ui/Badge'
import { Button } from '@/ui/Button'
import { useToast } from '@/ui/Toast'

interface AgentMessage {
  id: string
  name: string
  email: string
  message: string
  created_at: string
  status: 'new' | 'replied' | 'closed'
  response?: string
  responded_at?: string
  agent_id?: string
  agent?: { id: string; full_name: string; avatar_url?: string; agency_name?: string }
}

interface AgentThread {
  key: string
  agent_id: string
  agent?: { id: string; full_name: string; avatar_url?: string; agency_name?: string }
  messages: AgentMessage[]
  latest: AgentMessage
  pendingCount: number
}

export default function UserAgentMessagesPage() {
  const { error: showError, success: showSuccess } = useToast()
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedThreadKey, setSelectedThreadKey] = useState<string | null>(null)
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [followUpMessage, setFollowUpMessage] = useState('')
  const [sendingFollowUp, setSendingFollowUp] = useState(false)

  const loadMessages = async () => {
    try {
      const data = await getMySubmittedAgentMessages()
      setMessages(data)
    } catch (error) {
      console.error(error)
      showError('Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadMessages() }, [])

  const threads = useMemo(() => {
    const map = new Map<string, AgentMessage[]>()
    messages.forEach((msg) => {
      const id = msg.agent_id || msg.agent?.id || 'unknown'
      if (!map.has(id)) map.set(id, [])
      map.get(id)!.push(msg)
    })
    return Array.from(map.entries()).map(([agent_id, items]) => {
      const sorted = [...items].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
      return { key: agent_id, agent_id, agent: sorted[0].agent, messages: sorted, latest: sorted[sorted.length - 1], pendingCount: sorted.filter((m) => m.status === 'new').length }
    }).sort((a, b) => +new Date(b.latest.created_at) - +new Date(a.latest.created_at))
  }, [messages])

  const selectedThread = threads.find((t) => t.key === selectedThreadKey) || null

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedThread || !followUpMessage.trim()) return

    setSendingFollowUp(true)
    try {
      const user = await getCurrentUser()
      const profile = user ? await getProfile(user.id) : null

      await submitAgentInquiry({
        agent_id: selectedThread.agent_id,
        name: profile?.full_name || selectedThread.latest.name,
        email: user?.email || selectedThread.latest.email,
        message: followUpMessage
      })

      showSuccess('Your reply has been sent to the agent!')
      setFollowUpMessage('')
      setShowFollowUp(false)
      loadMessages()
    } catch (error) {
      console.error(error)
      showError('Failed to send your reply')
    } finally {
      setSendingFollowUp(false)
    }
  }

  const stats = { total: threads.length, pending: threads.filter((t) => t.pendingCount > 0).length, replied: threads.filter((t) => t.pendingCount === 0).length }

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8"><h1 className="text-3xl font-bold text-slate-900 mb-2">My Agent Messages</h1><p className="text-slate-600">One card per agent conversation</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"><Card className="p-4"><p className="text-sm text-slate-600 mb-1">Conversations</p><p className="text-2xl font-bold text-slate-900">{stats.total}</p></Card><Card className="p-4"><p className="text-sm text-slate-600 mb-1">Pending</p><p className="text-2xl font-bold text-blue-600">{stats.pending}</p></Card><Card className="p-4"><p className="text-sm text-slate-600 mb-1">Replied</p><p className="text-2xl font-bold text-green-600">{stats.replied}</p></Card></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {threads.length === 0 ? <Card className="p-12 text-center"><Mail className="w-16 h-16 mx-auto text-slate-300 mb-4" /><h3 className="text-xl font-semibold text-slate-900 mb-2">No agent messages yet</h3></Card> : threads.map((thread) => (
            <Card key={thread.key} className={`p-6 cursor-pointer transition-all hover:shadow-lg ${selectedThread?.key === thread.key ? 'ring-2 ring-blue-500' : ''}`} onClick={() => { setSelectedThreadKey(thread.key); setShowFollowUp(false) }}>
              <div className="flex items-start justify-between mb-3"><div className="flex items-center gap-3">{thread.agent?.avatar_url ? <img src={thread.agent.avatar_url} alt={thread.agent.full_name} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-semibold">{thread.agent?.full_name?.slice(0, 1) || 'A'}</div>}<div><p className="font-semibold text-slate-900">{thread.agent?.full_name || 'Agent'}</p><p className="text-xs text-slate-500">{thread.agent?.agency_name || 'Real Estate Agent'}</p></div></div><Badge className={thread.messages.every((m) => m.status === 'closed') ? 'bg-gray-100 text-gray-700' : thread.pendingCount > 0 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>{thread.messages.every((m) => m.status === 'closed') ? 'closed' : thread.pendingCount > 0 ? `${thread.pendingCount} pending` : 'replied'}</Badge></div>
              <p className="text-sm text-slate-600 line-clamp-2">{thread.latest.message}</p>
            </Card>
          ))}
        </div>
        <div className="lg:col-span-1"><Card className="p-6 sticky top-6">{selectedThread ? <><h3 className="text-lg font-semibold text-slate-900 mb-4">Conversation</h3><div className="space-y-3 max-h-[420px] overflow-y-auto mb-4">{selectedThread.messages.map((msg) => (<div key={msg.id} className="space-y-2"><div className="p-3 rounded-lg bg-slate-100"><p className="text-xs text-slate-500 mb-1">You</p><p className="text-sm text-slate-900 whitespace-pre-wrap">{msg.message}</p><p className="text-xs text-slate-400 mt-2 flex items-center"><Clock className="w-3 h-3 mr-1" />{new Date(msg.created_at).toLocaleString('en-US')}</p></div>{msg.response && <div className="p-3 rounded-lg bg-green-50 border border-green-200"><p className="text-xs text-green-700 mb-1">Agent</p><p className="text-sm text-green-900 whitespace-pre-wrap">{msg.response}</p></div>}</div>))}</div>{!showFollowUp ? <Button variant="outline" className="w-full" onClick={() => setShowFollowUp(true)}><Mail className="w-4 h-4 mr-2" />Reply to Agent</Button> : <form onSubmit={handleFollowUpSubmit} className="space-y-3"><textarea value={followUpMessage} onChange={(e) => setFollowUpMessage(e.target.value)} placeholder="Write your reply to the agent..." className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 text-sm" required /><div className="flex gap-2"><Button type="submit" disabled={sendingFollowUp || !followUpMessage.trim()} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" size="sm">{sendingFollowUp ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : <><Mail className="w-4 h-4 mr-2" />Send</>}</Button><Button type="button" variant="outline" size="sm" onClick={() => { setShowFollowUp(false); setFollowUpMessage('') }}>Cancel</Button></div></form>}</> : <div className="text-center py-12"><Mail className="w-12 h-12 mx-auto text-slate-300 mb-3" /><p className="text-slate-600">Select a conversation</p></div>}</Card></div>
      </div>
    </div>
  )
}



