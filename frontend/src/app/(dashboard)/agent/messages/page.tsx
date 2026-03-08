'use client'

import { useEffect, useMemo, useState } from 'react'
import { Mail, Clock, CheckCircle2, Send, Loader2 } from 'lucide-react'
import { getMyAgentMessages, respondToAgentMessage } from '@/lib/api'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { Badge } from '@/ui/Badge'
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
}

interface MessageThread {
  key: string
  name: string
  email: string
  messages: AgentMessage[]
  latest: AgentMessage
  pendingCount: number
}

export default function AgentMessagesPage() {
  const { error: showError, success: showSuccess } = useToast()
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedThreadKey, setSelectedThreadKey] = useState<string | null>(null)
  const [response, setResponse] = useState('')
  const [sending, setSending] = useState(false)

  const loadMessages = async () => {
    try {
      const data = await getMyAgentMessages()
      setMessages(data)
    } catch (error) {
      console.error(error)
      showError('Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const threads = useMemo(() => {
    const map = new Map<string, AgentMessage[]>()
    messages.forEach((msg) => {
      const key = `${msg.email}|${msg.name}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(msg)
    })

    return Array.from(map.entries()).map(([key, items]) => {
      const sorted = [...items].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
      return {
        key,
        name: sorted[0].name,
        email: sorted[0].email,
        messages: sorted,
        latest: sorted[sorted.length - 1],
        pendingCount: sorted.filter((m) => m.status === 'new').length
      }
    }).sort((a, b) => +new Date(b.latest.created_at) - +new Date(a.latest.created_at))
  }, [messages])

  const selectedThread = threads.find((t) => t.key === selectedThreadKey) || null

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedThread || !response.trim()) return

    const target = [...selectedThread.messages].reverse().find((m) => m.status === 'new') || selectedThread.latest

    setSending(true)
    try {
      await respondToAgentMessage(target.id, response)
      showSuccess('Reply sent successfully!')
      setResponse('')
      loadMessages()
    } catch (error) {
      console.error(error)
      showError('Failed to send reply')
    } finally {
      setSending(false)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Agent Messages</h1>
        <p className="text-slate-600">One card per conversation, with full chat history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {threads.length === 0 ? (
            <Card className="p-12 text-center"><Mail className="w-16 h-16 mx-auto text-slate-300 mb-4" /><h3 className="text-xl font-semibold text-slate-900 mb-2">No messages yet</h3></Card>
          ) : (
            threads.map((thread) => (
              <Card key={thread.key} className={`p-6 cursor-pointer transition-all hover:shadow-lg ${selectedThread?.key === thread.key ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setSelectedThreadKey(thread.key)}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">{thread.name}</h3>
                    <p className="text-sm text-slate-600">{thread.email}</p>
                  </div>
                  <Badge className={thread.messages.every((m) => m.status === 'closed') ? 'bg-gray-100 text-gray-700' : thread.pendingCount > 0 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>{thread.messages.every((m) => m.status === 'closed') ? 'closed' : thread.pendingCount > 0 ? `${thread.pendingCount} new` : 'replied'}</Badge>
                </div>
                <p className="text-slate-700 mb-3 line-clamp-2">{thread.latest.message}</p>
                <div className="flex items-center text-xs text-slate-500"><Clock className="w-3 h-3 mr-1" />{new Date(thread.latest.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              </Card>
            ))
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-6">
            {selectedThread ? (
              <>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Conversation</h3>
                <div className="space-y-3 max-h-[420px] overflow-y-auto mb-4">
                  {selectedThread.messages.map((msg) => (
                    <div key={msg.id} className="space-y-2">
                      <div className="p-3 rounded-lg bg-slate-100"><p className="text-xs text-slate-500 mb-1">{msg.name}</p><p className="text-sm text-slate-900 whitespace-pre-wrap">{msg.message}</p></div>
                      {msg.response && <div className="p-3 rounded-lg bg-green-50 border border-green-200"><p className="text-xs text-green-700 mb-1">You</p><p className="text-sm text-green-900 whitespace-pre-wrap">{msg.response}</p></div>}
                    </div>
                  ))}
                </div>
                <form onSubmit={handleRespond} className="space-y-3">
                  <textarea value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Type your reply..." className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 h-28" required />
                  <Button type="submit" disabled={sending || !response.trim()} className="w-full bg-blue-600 hover:bg-blue-700 text-white">{sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : <><Send className="w-4 h-4 mr-2" />Send Reply</>}</Button>
                </form>
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



