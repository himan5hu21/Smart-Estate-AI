'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAgents } from '@/lib/api'
import { Card } from '@/ui/Card'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { Search, User, MapPin, Mail, Phone, Loader2, Star, ShieldCheck } from 'lucide-react'

const AgentsPage = () => {
  const [agents, setAgents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await getAgents()
        setAgents(data)
      } catch (error) {
        console.error('Failed to fetch agents:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAgents()
  }, [])

  const filteredAgents = agents.filter(agent => 
    agent.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Header */}
      <section className="bg-blue-600 py-20 px-4 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Find Your Trusted Agent</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Connect with verified real estate professionals who can help you find, buy, or sell your dream home.
          </p>
          
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-0 bg-white/10 blur-xl group-hover:bg-white/20 transition-all rounded-3xl"></div>
            <div className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden p-1">
              <div className="pl-4 text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <input 
                type="text" 
                placeholder="Search by agent name..."
                className="w-full h-14 pl-4 text-slate-900 outline-none text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="h-14 bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-bold ml-2">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 -mt-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[450px] bg-white rounded-[40px] shadow-sm animate-pulse"></div>
            ))}
          </div>
        ) : filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAgents.map((agent) => (
              <Card key={agent.id} className="group overflow-hidden rounded-[40px] border-slate-100 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 bg-white">
                {/* Agent Image Header */}
                <div className="h-40 bg-slate-900 relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-600/20 group-hover:bg-blue-600/10 transition-colors"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
                </div>

                {/* Profile Pic */}
                <div className="relative -mt-20 flex justify-center px-8">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden border-8 border-white shadow-xl bg-slate-100">
                    <img 
                      src={agent.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.full_name)}&background=0D8ABC&color=fff&size=200`} 
                      alt={agent.full_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>

                <div className="p-8 pt-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h2 className="text-2xl font-black text-slate-900">{agent.full_name}</h2>
                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                  </div>
                  <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none mb-6 px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-xs">
                    Certified Agent
                  </Badge>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Listings</p>
                      <p className="text-xl font-black text-slate-900">12</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rating</p>
                      <p className="text-xl font-black text-slate-900 flex items-center justify-center gap-1">
                        4.9 <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-slate-500 font-medium">
                      <Phone className="w-4 h-4 text-blue-400" />
                      <span>{agent.phone || '+1 (555) 123-4567'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <span>{agent.email || 'agent@smartestate.com'}</span>
                    </div>
                  </div>

                  <Link href={`/agents/${agent.id}`}>
                    <Button className="w-full h-14 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 group-hover:shadow-blue-600/20">
                      View Listings
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[40px] shadow-sm border border-slate-200">
            <User className="w-16 h-16 text-slate-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-900 mb-4">No Agents Found</h2>
            <p className="text-slate-500 text-lg">We couldn't find any agents matching your search.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default AgentsPage
